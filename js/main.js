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
      light: '#8A5936', base: '#5A3520', dark: '#331B0D'
    },
    {
      id: 'cream-soda',
      name: 'Cream Soda',
      species: 'Hard maple',
      desc: 'Nearly blonde, with a fine close grain. Disappears into pale walls until you get near it, then shows all its figure.',
      light: '#F0DCB4', base: '#DFC08B', dark: '#B9925C'
    },
    {
      id: 'slow-jam',
      name: 'Slow Jam',
      species: 'Cherry',
      desc: 'Starts warm pink-brown and deepens for years. The only one in the lineup that keeps changing after you hang it.',
      light: '#C97A4E', base: '#9C4F2C', dark: '#67301A'
    },
    {
      id: 'sunroom',
      name: 'Sunroom',
      species: 'White oak',
      desc: 'Golden and open-grained, with long straight rays. Reads the most midcentury of the four, especially in a triple.',
      light: '#DDB57C', base: '#C49A5E', dark: '#946B3C'
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
      previewTitle.textContent = 'Preview of a ' + state.gang + '-gang cover in ' +
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
