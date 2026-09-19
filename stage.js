(function () {
  'use strict';
  var canvas = document.getElementById('stageCanvas');
  var stage = document.querySelector('.stage');
  var reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
  var finePointer = window.matchMedia('(pointer: fine)');
  var paused = reducedMotion.matches;
  var context = canvas && canvas.getContext('2d');
  var width = 0, height = 0, frameId = 0, phase = 0, lastTime = 0;
  var visible = true;
  var pointer = { x: .55, y: .65, strength: 0, target: 0 };

  function draw() {
    if (!context) return;
    context.clearRect(0, 0, width, height);
    // An abstract signal field, not an audio meter. Pointer proximity bends the lines.
    for (var row = 0; row < 30; row++) {
      context.beginPath();
      for (var x = 0; x <= width + 8; x += 8) {
        var nx = x / width;
        var distance = nx - pointer.x;
        var envelope = Math.exp(-distance * distance * 18);
        var wave = Math.sin(nx * 12 + phase + row * .12);
        var base = height * .57 + row * height * .014;
        var y = base + Math.sin(nx * 7 + phase * .3 + row * .08) * height * .075;
        y += wave * (24 + envelope * pointer.strength * 90);
        y += envelope * pointer.strength * (pointer.y - .5) * 100;
        if (x === 0) context.moveTo(x, y); else context.lineTo(x, y);
      }
      context.strokeStyle = 'rgba(238,73,56,' + (.07 + row / 170) + ')';
      context.lineWidth = .8;
      context.stroke();
    }
  }
  function canAnimate() { return context && !paused && visible && !document.hidden; }
  var waitBefore = 0;
  function frame(time) {
    frameId = 0;
    if (!canAnimate()) { waitBefore = 0; return; }
    var delta = lastTime ? Math.min(time - lastTime, 50) : 16;
    lastTime = time;
    waitBefore += delta;
    if (waitBefore >= 33) {
      phase += waitBefore * .0003;
      pointer.strength += (pointer.target - pointer.strength) * Math.min(.35, waitBefore * .004);
      waitBefore = 0;
      draw();
    }
    frameId = requestAnimationFrame(frame);
  }
  function syncAnimation() {
    if (frameId) cancelAnimationFrame(frameId);
    frameId = 0;
    lastTime = 0;
    document.body.classList.toggle('motion-paused', paused);
    if (canAnimate()) frameId = requestAnimationFrame(frame);
    else draw();
  }
  function resize() {
    if (!context) return;
    var rect = stage.getBoundingClientRect();
    width = rect.width; height = rect.height;
    var ratio = Math.min(window.devicePixelRatio || 1, 2);
    canvas.width = Math.round(width * ratio); canvas.height = Math.round(height * ratio);
    context.setTransform(ratio, 0, 0, ratio, 0, 0);
    draw();
  }
  if (context && stage) {
    resize();
    if ('ResizeObserver' in window) new ResizeObserver(resize).observe(stage);
    else window.addEventListener('resize', resize, { passive: true });
    stage.addEventListener('pointermove', function (event) {
      if (paused || !finePointer.matches) return;
      var rect = stage.getBoundingClientRect();
      pointer.x = (event.clientX - rect.left) / rect.width;
      pointer.y = (event.clientY - rect.top) / rect.height;
      pointer.target = 1;
    }, { passive: true });
    stage.addEventListener('pointerleave', function () { pointer.target = 0; });
    if ('IntersectionObserver' in window) new IntersectionObserver(function (entries) {
      visible = entries[0].isIntersecting; syncAnimation();
    }).observe(stage);
    document.addEventListener('visibilitychange', syncAnimation);
  }
  reducedMotion.addEventListener('change', function (event) { paused = event.matches; syncAnimation(); });
  syncAnimation();
})();

(function () {
  'use strict';
  var items = Array.from(document.querySelectorAll('#songList li'));
  var slots = document.getElementById('mixSlots');
  var breakdown = document.getElementById('mixBreakdown');
  if (!slots || !breakdown) return;
  var categories = [
    { key: 'hits', label: "50'er-hits" },
    { key: 'dance', label: 'Danse-raketter' },
    { key: 'gems', label: 'Glemte perler & Cash' }
  ];
  items.forEach(function (item) {
    var slot = document.createElement('span');
    slot.className = 'mix-slot'; slots.appendChild(slot);
    var checkbox = item.querySelector('input');
    item.addEventListener('click', function (event) {
      if (event.target.closest('label, input, a, button')) return;
      checkbox.checked = !checkbox.checked;
      checkbox.dispatchEvent(new Event('change', { bubbles: true }));
    });
    checkbox.addEventListener('change', update);
  });
  categories.forEach(function (category) {
    var row = document.createElement('div'); row.className = 'mix-category';
    var label = document.createElement('div'); label.className = 'mix-label';
    var name = document.createElement('span'); name.textContent = category.label;
    category.count = document.createElement('span');
    label.append(name, category.count);
    var track = document.createElement('div'); track.className = 'mix-bar'; track.setAttribute('aria-hidden', 'true');
    category.fill = document.createElement('span'); track.appendChild(category.fill);
    row.append(label, track); breakdown.appendChild(row);
  });
  function update() {
    var chosen = items.filter(function (item, index) {
      var checked = item.querySelector('input').checked;
      item.classList.toggle('is-selected', checked);
      slots.children[index].classList.toggle('selected', checked);
      return checked;
    });
    document.getElementById('mixCount').textContent = String(chosen.length).padStart(2, '0');
    categories.forEach(function (category) {
      var count = chosen.filter(function (item) { return item.dataset.cat.split(' ').includes(category.key); }).length;
      var total = items.filter(function (item) { return item.dataset.cat.split(' ').includes(category.key); }).length;
      category.count.textContent = count + ' / ' + total;
      category.fill.style.width = (total ? count / total * 100 : 0) + '%';
    });
    document.getElementById('mixStatus').textContent = chosen.length
      ? chosen.length + (chosen.length === 1 ? ' nummer valgt. ' : ' numre valgt. ') + 'Tag ønskelisten med til booking nedenfor.'
      : 'Vælg jeres favoritter fra listen.';
  }
  update();
  window.addEventListener('pageshow', update);
})();

(function () {
  'use strict';
  // Jukebox rack: one tilted title card per SoundCloud track. Clicking a card skips the embedded player to it.
  var strip = document.getElementById('jukeStrip');
  var player = document.getElementById('jukePlayer');
  if (!strip || !player) return;
  var fallbackTitles = ['Checkbook', 'Tennessee Whiskey - bonus track', 'Baby Lets Play House', 'Hey Baby',
    "Honey Don't", 'Flint City', 'Bring it on home', 'Carol', 'Folsom prison blues', 'Summertime blues', 'Matchbox'];
  var photos = ['assets/band-live.jpg', 'assets/band-main.jpg', 'assets/band-hero.jpg'];
  var crops = ['22% 30%', '50% 35%', '78% 30%', '35% 60%', '65% 45%'];
  var rail = document.getElementById('jukeRailCode');
  var now = document.getElementById('jukeNow');
  var perSide = 6;
  var cards = [];
  var widget = null, ready = false, pending = -1;

  function code(i) { return String.fromCharCode(65 + Math.floor(i / perSide)) + (i % perSide + 1); }

  function buildCards(titles) {
    strip.textContent = '';
    cards = titles.map(function (title, i) {
      var card = document.createElement('button');
      card.type = 'button';
      card.className = 'juke-card';
      card.style.zIndex = String(titles.length - i);
      card.setAttribute('aria-label', 'Afspil ' + title);
      var img = document.createElement('img');
      img.src = photos[i % photos.length];
      img.alt = '';
      img.loading = 'lazy';
      img.decoding = 'async';
      img.style.objectPosition = crops[i % crops.length];
      var caption = document.createElement('span');
      caption.className = 'juke-cap';
      var label = document.createElement('b');
      label.textContent = code(i);
      caption.append(label, document.createTextNode(title));
      card.append(img, caption);
      card.addEventListener('click', function () { select(i); });
      strip.appendChild(card);
      return card;
    });
    if (rail && titles.length) rail.textContent = code(0) + ' – ' + code(titles.length - 1);
  }

  function setArtwork(sounds) {
    sounds.forEach(function (sound, i) {
      var url = sound && sound.artwork_url;
      if (url && cards[i]) cards[i].querySelector('img').src = url.replace('-large', '-t300x300');
    });
  }

  function markPlaying(index, title) {
    cards.forEach(function (card, i) { card.classList.toggle('is-playing', i === index); });
    if (now && title) { now.textContent = '▶ ' + code(index) + ' · ' + title; now.classList.add('is-live'); }
    if (index >= 0 && cards[index] && !document.body.classList.contains('motion-paused')) {
      cards[index].scrollIntoView({ block: 'nearest', inline: 'center', behavior: 'smooth' });
    }
  }

  function select(i) {
    if (!ready) { pending = i; return; }
    widget.skip(i);
    widget.play();
  }

  function syncCurrent() {
    widget.getCurrentSoundIndex(function (index) {
      widget.getCurrentSound(function (sound) { markPlaying(index, sound && sound.title); });
    });
  }

  function connect() {
    if (!window.SC || !window.SC.Widget) return;
    widget = window.SC.Widget(player);
    var Events = window.SC.Widget.Events;
    widget.bind(Events.READY, function () {
      ready = true;
      widget.getSounds(function (sounds) {
        var titles = sounds.map(function (sound, i) { return (sound && sound.title) || fallbackTitles[i] || 'Nummer ' + (i + 1); });
        if (titles.length) { buildCards(titles); setArtwork(sounds); }
        if (pending >= 0) { var p = pending; pending = -1; select(p); }
      });
    });
    widget.bind(Events.PLAY, syncCurrent);
    widget.bind(Events.PAUSE, function () {
      if (now) now.classList.remove('is-live');
    });
  }

  buildCards(fallbackTitles);
  var api = document.createElement('script');
  api.src = 'https://w.soundcloud.com/player/api.js';
  api.async = true;
  api.onload = connect;
  document.head.appendChild(api);

  // Pointer near either edge scrolls the rack, as in the original Jukebox-CSS demo.
  var finePointer = window.matchMedia('(pointer: fine)');
  var speed = 0, frameId = 0;
  function step() {
    frameId = 0;
    if (!speed || document.body.classList.contains('motion-paused')) return;
    strip.scrollLeft += speed;
    frameId = requestAnimationFrame(step);
  }
  strip.addEventListener('pointermove', function (event) {
    if (!finePointer.matches) return;
    var rect = strip.getBoundingClientRect();
    var x = (event.clientX - rect.left) / rect.width;
    var edge = .3, max = 6;
    speed = x < edge ? -((edge - x) / edge) * max : x > 1 - edge ? ((x - (1 - edge)) / edge) * max : 0;
    if (speed && !frameId) frameId = requestAnimationFrame(step);
  }, { passive: true });
  strip.addEventListener('pointerleave', function () { speed = 0; });
})();
