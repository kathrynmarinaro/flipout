/* ==========================================================================
   Flipout — landing page behavior
   No dependencies, no build step. Everything degrades gracefully.
   ========================================================================== */
(function () {
  'use strict';

  /* ======================================================================
     1. EMAIL SIGNUP  —  THE ONE THING YOU MUST CONFIGURE
     ----------------------------------------------------------------------
     Paste your Kit (formerly ConvertKit) form ID between the quotes below.

     Where to find it:
       Kit dashboard → Grow → Landing Pages & Forms → create/open a form
       → Embed → HTML. The ID is the number in the action URL, e.g.
       https://app.kit.com/forms/1234567/subscriptions  →  '1234567'

     Until this is filled in, the forms stay visibly disabled and say so
     rather than pretending to accept signups.
     ====================================================================== */
  var KIT_FORM_ID = '';

  var KIT_ENDPOINT = 'https://app.kit.com/forms/' + KIT_FORM_ID + '/subscriptions';
  var isConfigured = /^\d+$/.test(KIT_FORM_ID);

  var MESSAGES = {
    unconfigured: 'Signup isn’t switched on yet — add your Kit form ID in js/main.js.',
    invalid:      'That email doesn’t look quite right — mind checking it?',
    sending:      'Adding you…',
    success:      'You’re on the list. I’ll email you when the first batch is ready.',
    failure:      'Something went wrong on our end. Try again in a moment?',
    offline:      'Looks like you’re offline — try again once you’re reconnected.'
  };

  function setStatus(el, message, state) {
    if (!el) return;
    el.textContent = message;
    el.classList.remove('is-error', 'is-ok');
    if (state) el.classList.add(state);
  }

  function initSignup(form) {
    var input  = form.querySelector('.signup-input');
    var button = form.querySelector('button[type="submit"]');
    var status = form.querySelector('[data-status]');
    var honeypot = form.querySelector('input[name="website"]');

    if (!isConfigured) {
      setStatus(status, MESSAGES.unconfigured, 'is-error');
      if (button) button.disabled = true;
      if (input) input.disabled = true;
    }

    form.addEventListener('submit', function (event) {
      event.preventDefault();
      if (!isConfigured) return;

      // Bots fill the hidden field; humans can't see it. Pretend all is well.
      if (honeypot && honeypot.value) {
        setStatus(status, MESSAGES.success, 'is-ok');
        return;
      }

      var email = (input.value || '').trim();
      if (!email || !input.checkValidity()) {
        input.setAttribute('aria-invalid', 'true');
        setStatus(status, MESSAGES.invalid, 'is-error');
        input.focus();
        return;
      }
      input.removeAttribute('aria-invalid');

      if (navigator.onLine === false) {
        setStatus(status, MESSAGES.offline, 'is-error');
        return;
      }

      button.disabled = true;
      setStatus(status, MESSAGES.sending, null);

      var payload = new FormData();
      payload.append('email_address', email);

      fetch(KIT_ENDPOINT, {
        method: 'POST',
        body: payload,
        headers: { 'Accept': 'application/json' }
      })
        .then(function (response) {
          if (!response.ok) throw new Error('HTTP ' + response.status);
          return response.json().catch(function () { return {}; });
        })
        .then(function () {
          form.reset();
          setStatus(status, MESSAGES.success, 'is-ok');
          button.disabled = false;
        })
        .catch(function () {
          setStatus(status, MESSAGES.failure, 'is-error');
          button.disabled = false;
        });
    });
  }

  Array.prototype.forEach.call(document.querySelectorAll('[data-signup]'), initSignup);


  /* ======================================================================
     2. WOOD + CAP MOOD PICKER
     ----------------------------------------------------------------------
     Edit these two arrays to change the lineup. Nothing else needs to move:
     swatches, descriptions, the readout and the live preview all build
     themselves from this data.
     ====================================================================== */
  var WOODS = [
    {
      id: 'deep-groove',
      name: 'Deep Groove',
      species: 'Black walnut',
      desc: 'Dark, chocolatey and a little smoky. The one that looks best against a white wall, and the reason the whole thing started.',
      light: '#8A5936', base: '#563220', dark: '#2E180C'
    },
    {
      id: 'cream-soda',
      name: 'Cream Soda',
      species: 'Hard maple',
      desc: 'Warm honey-tan with a fine, close grain and almost no figure, so the shape does all the talking.',
      light: '#E8C88C', base: '#D2A868', dark: '#A87F49'
    },
    {
      id: 'sunroom',
      name: 'Sunroom',
      species: 'White oak',
      desc: 'Light tan with long straight rays running through it. The most openly grained of the three, and the most midcentury in a triple.',
      light: '#E7D6B6', base: '#CFB890', dark: '#A08760'
    }
  ];

  var CAPS = [
    { id: 'pool-party',  name: 'Pool Party',   color: '#8FC9E9', desc: 'The house blue. Pulled straight off the first prototype and never seriously questioned since.' },
    { id: 'cherry-bomb', name: 'Cherry Bomb',  color: '#D9452F', desc: 'Loud, in a good way. Best on the dark woods, where it reads as a deliberate spark rather than a mistake.' },
    { id: 'butter',      name: 'Butter Lounge',color: '#EFC04A', desc: 'Warm yellow that sits somewhere between mustard and lamplight. Quietly the most retro option here.' },
    { id: 'rumpus',      name: 'Rumpus Room',  color: '#7C8F4B', desc: 'Avocado green, unrepentantly. If you know, you know.' },
    { id: 'meringue',    name: 'Meringue',     color: '#F3E7D4', desc: 'Near-cream. The closest thing to invisible hardware — for when you want the shape to do all the talking.' },
    { id: 'tuxedo',      name: 'Tuxedo',       color: '#23201E', desc: 'Flat near-black. Turns the screws into two deliberate dots instead of hiding them.' }
  ];

  var preview      = document.querySelector('[data-preview]');
  var previewTitle = document.querySelector('[data-preview-title]');
  var woodRow      = document.querySelector('[data-wood-row]');
  var capRow       = document.querySelector('[data-cap-row]');
  var woodDesc     = document.querySelector('[data-wood-desc]');
  var capDesc      = document.querySelector('[data-cap-desc]');
  var readoutWood  = document.querySelector('[data-readout-wood]');
  var readoutCap   = document.querySelector('[data-readout-cap]');
  var shapeSingle  = document.querySelector('[data-shape-single]');
  var shapeTriple  = document.querySelector('[data-shape-triple]');

  var state = { wood: WOODS[0], cap: CAPS[0], gang: 'single' };

  function buildSwatch(item, kind) {
    var button = document.createElement('button');
    button.type = 'button';
    button.className = 'swatch';
    button.setAttribute('aria-pressed', 'false');
    button.dataset.id = item.id;

    var chip = document.createElement('span');
    chip.className = 'swatch-chip';
    chip.style.background = kind === 'wood'
      ? 'linear-gradient(140deg, ' + item.light + ', ' + item.base + ' 55%, ' + item.dark + ')'
      : item.color;

    var label = document.createElement('span');
    label.className = 'swatch-label';
    label.textContent = item.name;

    button.appendChild(chip);
    button.appendChild(label);

    button.addEventListener('click', function () {
      state[kind] = item;
      render();
    });
    return button;
  }

  // SVG elements have no `hidden` IDL property (that's HTMLElement only), so
  // assigning el.hidden would silently do nothing. Set the attribute instead.
  function setShapeVisible(el, visible) {
    if (!el) return;
    if (visible) el.removeAttribute('hidden');
    else el.setAttribute('hidden', '');
  }

  function render() {
    if (!preview) return;

    preview.style.setProperty('--wood-light', state.wood.light);
    preview.style.setProperty('--wood-base',  state.wood.base);
    preview.style.setProperty('--wood-dark',  state.wood.dark);
    preview.style.setProperty('--cap-color',  state.cap.color);

    setShapeVisible(shapeSingle, state.gang === 'single');
    setShapeVisible(shapeTriple, state.gang === 'triple');

    if (woodDesc) woodDesc.textContent = state.wood.species + ' — ' + state.wood.desc;
    if (capDesc)  capDesc.textContent  = state.cap.desc;
    if (readoutWood) readoutWood.textContent = state.wood.name;
    if (readoutCap)  readoutCap.textContent  = state.cap.name;

    if (previewTitle) {
      previewTitle.textContent = 'Preview of a ' + state.gang + '-gang toggle cover in ' +
        state.wood.name + ' ' + state.wood.species.toLowerCase() +
        ' with ' + state.cap.name + ' caps';
    }

    Array.prototype.forEach.call(document.querySelectorAll('[data-wood-row] .swatch'), function (el) {
      el.setAttribute('aria-pressed', String(el.dataset.id === state.wood.id));
    });
    Array.prototype.forEach.call(document.querySelectorAll('[data-cap-row] .swatch'), function (el) {
      el.setAttribute('aria-pressed', String(el.dataset.id === state.cap.id));
    });
  }

  if (woodRow && capRow) {
    WOODS.forEach(function (wood) { woodRow.appendChild(buildSwatch(wood, 'wood')); });
    CAPS.forEach(function (cap) { capRow.appendChild(buildSwatch(cap, 'cap')); });
    render();
  }

  Array.prototype.forEach.call(document.querySelectorAll('[data-gang]'), function (button) {
    button.addEventListener('click', function () {
      state.gang = button.dataset.gang;
      Array.prototype.forEach.call(document.querySelectorAll('[data-gang]'), function (other) {
        var active = other === button;
        other.classList.toggle('is-active', active);
        other.setAttribute('aria-pressed', String(active));
      });
      render();
    });
  });


  /* ======================================================================
     3. ODDS AND ENDS
     ====================================================================== */

  /* ----------------------------------------------------------------------
     The cycling word in "Flip on some ___".
     Edit WORDS to change what it rotates through. Without JS the line just
     reads "Flip on some color", which is a perfectly good headline on its own.
     ---------------------------------------------------------------------- */
  var WORDS = ['color', 'shape', 'art', 'form', 'curves', 'character'];
  var WORD_HOLD = 2200;   // ms each word stays up
  var WORD_FADE = 260;    // ms of the swap itself — keep in sync with the CSS transition

  var cycle = document.querySelector('[data-cycle]');
  var cycleWord = document.querySelector('[data-cycle-word]');
  var stillMotion = window.matchMedia('(prefers-reduced-motion: reduce)');

  if (cycle && cycleWord && !stillMotion.matches) {
    // Hidden twin used to measure each word, so the container can size to it.
    var ruler = document.createElement('span');
    ruler.setAttribute('aria-hidden', 'true');
    ruler.style.cssText = 'position:absolute;visibility:hidden;white-space:nowrap;left:0;top:0;';
    cycle.appendChild(ruler);

    var index = 0;
    var timer = null;

    function widthOf(word) {
      ruler.textContent = word;
      return Math.ceil(ruler.getBoundingClientRect().width);
    }

    // Hold the width of the LONGEST word at all times. Sizing to the current
    // word instead would let a short one like "art" pull the headline back onto
    // fewer lines, shunting the whole page up and down as it cycles. The word
    // sits at the end of a left-aligned line, so the reserved space is just
    // trailing whitespace — invisible.
    function fit() {
      var widest = 0;
      for (var i = 0; i < WORDS.length; i++) {
        widest = Math.max(widest, widthOf(WORDS[i]));
      }
      cycle.style.width = widest + 'px';
    }

    function advance() {
      cycleWord.style.opacity = '0';
      cycleWord.style.transform = 'translateY(-0.3em)';

      window.setTimeout(function () {
        index = (index + 1) % WORDS.length;
        cycleWord.textContent = WORDS[index];

        // Drop in from below without animating the reset itself.
        cycleWord.style.transition = 'none';
        cycleWord.style.transform = 'translateY(0.3em)';
        window.requestAnimationFrame(function () {
          cycleWord.style.transition = '';
          cycleWord.style.opacity = '1';
          cycleWord.style.transform = 'translateY(0)';
        });
      }, WORD_FADE);
    }

    function start() {
      if (!timer) timer = window.setInterval(advance, WORD_HOLD);
    }
    function stop() {
      window.clearInterval(timer);
      timer = null;
    }

    // Measure once the display face is actually loaded, or the width is wrong.
    if (document.fonts && document.fonts.ready) document.fonts.ready.then(fit);
    else window.addEventListener('load', fit);
    fit();

    window.addEventListener('resize', fit);
    // Don't animate against a tab nobody is looking at.
    document.addEventListener('visibilitychange', function () {
      if (document.hidden) stop(); else start();
    });
    start();
  }

  // Duplicate the ticker content so the marquee loops without a visible seam.
  var ticker = document.querySelector('[data-ticker]');
  if (ticker && !window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    ticker.innerHTML += ticker.innerHTML;
  }

  // Give the sticky header an edge once the page has scrolled under it.
  var header = document.querySelector('.site-header');
  if (header) {
    var onScroll = function () {
      header.classList.toggle('is-stuck', window.scrollY > 12);
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();
  }

  var year = document.querySelector('[data-year]');
  if (year) year.textContent = String(new Date().getFullYear());
}());
