/**
 * Mr. Dean & The Rebels — Interactive Scripts
 * Genuine Rockabilly & Rock'n'Roll fra Aarhus
 * Pure Vanilla JavaScript — Zero External Dependencies (Optimized for GitHub Pages)
 */

(function () {
  'use strict';

  // 1. Scroll Reveal & Fade Animations
  if ('IntersectionObserver' in window) {
    var observer = new IntersectionObserver(function (entries, io) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add('in');
          io.unobserve(entry.target);
        }
      });
    }, { threshold: 0.12 });

    document.querySelectorAll('.rv, .fade').forEach(function (el) {
      observer.observe(el);
    });
  } else {
    // Fallback for browsers without IntersectionObserver
    document.querySelectorAll('.rv, .fade').forEach(function (el) {
      el.classList.add('in');
    });
  }

  // 2. Dynamic Copyright Year in Footer
  var yearEl = document.getElementById('y');
  if (yearEl) {
    yearEl.textContent = new Date().getFullYear();
  }

  // 3. Mobile Navigation Drawer Toggle
  var navToggle = document.getElementById('navToggle');
  var navLinks = document.getElementById('navLinks');
  if (navToggle && navLinks) {
    navToggle.addEventListener('click', function () {
      var isOpen = navLinks.classList.toggle('open');
      navToggle.classList.toggle('open', isOpen);
      navToggle.setAttribute('aria-expanded', String(isOpen));
    });

    navLinks.querySelectorAll('a').forEach(function (link) {
      link.addEventListener('click', function () {
        navLinks.classList.remove('open');
        navToggle.classList.remove('open');
        navToggle.setAttribute('aria-expanded', 'false');
      });
    });
  }

  // 4. Setlist Repertoire Filter
  var filterBtns = document.querySelectorAll('.set-filter');
  var songItems = document.querySelectorAll('#songList li');
  if (filterBtns.length > 0 && songItems.length > 0) {
    filterBtns.forEach(function (btn) {
      btn.addEventListener('click', function () {
        filterBtns.forEach(function (b) { b.classList.remove('active'); });
        btn.classList.add('active');
        var filter = btn.getAttribute('data-filter');
        songItems.forEach(function (li) {
          if (filter === 'all') {
            li.style.display = 'flex';
          } else {
            var cats = (li.getAttribute('data-cat') || '').split(' ');
            li.style.display = cats.indexOf(filter) !== -1 ? 'flex' : 'none';
          }
        });
      });
    });
  }

  // 5. Interactive Song Wishlist
  var songCheckboxes = document.querySelectorAll('#songList input[type="checkbox"]');
  var wlNotice = document.getElementById('wishlistNotice');
  var wlCount = document.getElementById('wlCount');
  var fMessage = document.getElementById('fMessage');
  var wlBtn = document.getElementById('wlBtn');

  function updateWishlist() {
    var selected = [];
    songCheckboxes.forEach(function (cb) {
      if (cb.checked) selected.push(cb.value);
    });
    if (wlNotice && wlCount) {
      if (selected.length > 0) {
        wlNotice.style.display = 'flex';
        wlCount.textContent = String(selected.length);
      } else {
        wlNotice.style.display = 'none';
      }
    }
  }

  songCheckboxes.forEach(function (cb) {
    cb.addEventListener('change', updateWishlist);
  });

  if (wlBtn && fMessage) {
    wlBtn.addEventListener('click', function () {
      var selected = [];
      songCheckboxes.forEach(function (cb) {
        if (cb.checked) selected.push(cb.value);
      });
      if (selected.length > 0) {
        var wishText = 'Vi kunne vildt godt tænke os at høre følgende numre: ' + selected.join(', ') + '.\n\n';
        if (fMessage.value.indexOf(selected[0]) === -1) {
          fMessage.value = wishText + fMessage.value;
        }
      }
    });
  }

  // 6. Booking Inquiry Form Handler (Pre-formatted Email Composer)
  var bookingForm = document.getElementById('bookingForm');
  var formFeedback = document.getElementById('formFeedback');
  if (bookingForm) {
    bookingForm.addEventListener('submit', function (e) {
      e.preventDefault();
      var name = ((document.getElementById('fName') || {}).value || '').trim();
      var contact = ((document.getElementById('fContact') || {}).value || '').trim();
      var date = ((document.getElementById('fDate') || {}).value || '').trim();
      var city = ((document.getElementById('fCity') || {}).value || '').trim();
      var type = (document.getElementById('fType') || {}).value || '';
      var msg = ((document.getElementById('fMessage') || {}).value || '').trim();

      var subject = encodeURIComponent('Forespørgsel til Mr. Dean & The Rebels - ' + date + ' (' + city + ')');
      var body = encodeURIComponent(
        'Hej Mr. Dean & The Rebels,\n\n' +
        'Vi vil gerne forhøre os om jeres ledighed og pris til vores arrangement:\n\n' +
        '• Navn: ' + name + '\n' +
        '• Kontakt: ' + contact + '\n' +
        '• Dato: ' + date + '\n' +
        '• By / Sted: ' + city + '\n' +
        '• Type arrangement: ' + type + '\n\n' +
        'Yderligere besked og ønsker:\n' +
        (msg || 'Ingen specifikke ønsker endnu') + '\n\n' +
        'Vi glæder os til at høre fra jer!\n' +
        'Mvh. ' + name
      );

      window.location.href = 'mailto:mrdean.booking@gmail.com?subject=' + subject + '&body=' + body;

      if (formFeedback) {
        formFeedback.style.display = 'block';
        formFeedback.innerHTML = '<strong>Tak for din forespørgsel, ' + name + '!</strong><br>' +
          'Din mailklient åbnes nu med de udfyldte oplysninger. ' +
          'Hvis den ikke åbner automatisk, kan du skrive direkte til <a href="mailto:mrdean.booking@gmail.com">mrdean.booking@gmail.com</a> ' +
          'eller ringe til vores booking-agent på <a href="tel:+4523657560">tlf. 23 65 75 60</a>.';
      }
    });
  }

  // 7. 1950s Retro TV Channel Switcher
  var tvChannels = [
    {
      id: 'GHBGn1WVwRw',
      title: '1: Live Promo (UsCarCamp)',
      url: 'https://www.youtube.com/watch?v=GHBGn1WVwRw'
    },
    {
      id: 'fLNmCa8nqls',
      title: '2: Live Koncert (Rønde)',
      url: 'https://www.youtube.com/watch?v=fLNmCa8nqls'
    },
    {
      id: 'S2VJXobNOI4',
      title: '3: Autentisk Rockabilly',
      url: 'https://www.youtube.com/watch?v=S2VJXobNOI4'
    },
    {
      id: '_pD5uvtqgxc',
      title: '4: Live fra Scenen',
      url: 'https://www.youtube.com/watch?v=_pD5uvtqgxc'
    }
  ];

  var currentCh = 0;
  var dialAngle = 0;
  var tvScreen = document.getElementById('tvScreen');
  var tvIframe = document.getElementById('tvIframe');
  var tvChannelTitle = document.getElementById('tvChannelTitle');
  var dialChannel = document.getElementById('dialChannel');
  var btnChangeChannel = document.getElementById('btnChangeChannel');
  var tvYtLink = document.getElementById('tvYtLink');
  var tvPresetBtns = document.querySelectorAll('.tv-presets .tv-btn');
  var staticCanvas = document.getElementById('tvStaticCanvas');
  var staticCtx = staticCanvas ? staticCanvas.getContext('2d') : null;
  var staticTimer = null;
  var staticAnimId = null;

  // Real Black & White CRT TV Snow Generator
  function renderStaticNoise() {
    if (!staticCanvas || !staticCtx) return;
    var w = staticCanvas.width = 240;
    var h = staticCanvas.height = 135;
    var imgData = staticCtx.createImageData(w, h);
    var buf = new Uint32Array(imgData.data.buffer);
    function frame() {
      for (var i = 0; i < buf.length; i++) {
        // 50/50 pure white (0xFFFFFFFF) or black (0xFF000000)
        buf[i] = Math.random() < 0.5 ? 0xFF000000 : 0xFFFFFFFF;
      }
      staticCtx.putImageData(imgData, 0, 0);
      staticAnimId = requestAnimationFrame(frame);
    }
    frame();
  }

  function stopStaticNoise() {
    if (staticAnimId) {
      cancelAnimationFrame(staticAnimId);
      staticAnimId = null;
    }
  }

  function switchChannel(nextIndex) {
    if (nextIndex === undefined) {
      currentCh = (currentCh + 1) % tvChannels.length;
    } else {
      currentCh = nextIndex;
    }
    var ch = tvChannels[currentCh];

    // Rotate physical dial knob
    dialAngle += 45;
    if (dialChannel) {
      dialChannel.style.transform = 'rotate(' + dialAngle + 'deg)';
    }

    // Trigger white/black CRT static noise for a brief moment (350ms)
    stopStaticNoise();
    clearTimeout(staticTimer);
    if (tvScreen) {
      tvScreen.classList.add('switching');
      renderStaticNoise();
      staticTimer = setTimeout(function () {
        tvScreen.classList.remove('switching');
        stopStaticNoise();
      }, 350);
    }

    // Update iframe video source with autoplay
    if (tvIframe) {
      tvIframe.src = 'https://www.youtube-nocookie.com/embed/' + ch.id + '?autoplay=1&rel=0';
    }

    // Update button caption
    if (tvChannelTitle) {
      tvChannelTitle.textContent = ch.title;
    }

    // Update YouTube link below TV
    if (tvYtLink) {
      tvYtLink.href = ch.url;
    }

    // Update preset button active highlight
    tvPresetBtns.forEach(function (b, idx) {
      b.classList.toggle('active', idx === currentCh);
    });
  }

  if (dialChannel) {
    dialChannel.addEventListener('click', function () { switchChannel(); });
  }
  if (btnChangeChannel) {
    btnChangeChannel.addEventListener('click', function () { switchChannel(); });
  }
  tvPresetBtns.forEach(function (btn) {
    btn.addEventListener('click', function () {
      var chIdx = parseInt(btn.getAttribute('data-ch'), 10);
      switchChannel(chIdx);
    });
  });

  // 8. Flaming Microphone Custom Cursor (Touch & Motion Protected)
  if (window.matchMedia && matchMedia('(pointer:fine)').matches && !matchMedia('(prefers-reduced-motion:reduce)').matches) {
    var m = document.getElementById('firemic');
    if (m) {
      document.documentElement.classList.add('js-cursor');
      m.classList.add('on');
      document.addEventListener('mousemove', function (e) {
        m.style.transform = 'translate(' + (e.clientX - 3) + 'px,' + (e.clientY - 2) + 'px)';
      }, { passive: true });
      document.addEventListener('mousedown', function () { m.classList.add('press'); });
      document.addEventListener('mouseup', function () { m.classList.remove('press'); });
      document.documentElement.addEventListener('mouseleave', function () { m.classList.remove('on'); });
      document.documentElement.addEventListener('mouseenter', function () { m.classList.add('on'); });
    }
  }

})();
