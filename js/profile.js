(function () {
  'use strict';

  var Arcade = window.Arcade = window.Arcade || {};
  var reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  function $(sel, root) { return (root || document).querySelector(sel); }
  function $$(sel, root) { return Array.prototype.slice.call((root || document).querySelectorAll(sel)); }
  function esc(value) {
    return String(value == null ? '' : value).replace(/[&<>"']/g, function (ch) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[ch];
    });
  }
  function clamp(num, min, max) { return Math.max(min, Math.min(max, Number(num) || 0)); }

  function segsHTML(value, total) {
    var out = '';
    for (var i = 0; i < total; i++) {
      out += '<i class="seg" data-on="' + (i < value ? 1 : 0) + '" style="--i:' + i + '"></i>';
    }
    return out;
  }

  var box = document.getElementById('prof');
  if (!box) return;

  var win = $('.prof__win', box);
  var el = {
    tag: $('#profTag', box),
    count: $('#profCount', box),
    stageTag: $('#profStageTag', box),
    sprite: $('#profSprite', box),
    klass: $('#profClass', box),
    name: $('#profName', box),
    bio: $('#profBio', box),
    group: $('#profGroup', box),
    role: $('#profRole', box),
    power: $('#profPower', box),
    stats: $('#profStats', box),
    inv: $('#profInv', box),
    contact: $('#profContact', box),
    noContact: $('#profNoContact', box),
    status: $('#profStatus', box)
  };

  var roster = [];
  var current = 0;
  var isOpen = false;
  var lastFocus = null;

  function crewData() {
    return (Arcade.data && Arcade.data.crew) || [];
  }

  function skillMap() {
    var map = {};
    var slots = (Arcade.data && Arcade.data.skills && Arcade.data.skills.slots) || [];
    slots.forEach(function (slot) {
      (slot.items || []).forEach(function (item) { map[item.id] = item; });
    });
    return map;
  }

  function contactOf(person) {
    var raw = String(person.contact || '').trim();
    var empty = !raw || raw === '#' || /^https?:\/\/t\.me\/?$/i.test(raw);
    if (!empty) return raw;
    if (/капитан/i.test(person.role || '')) {
      var contacts = (Arcade.data && Arcade.data.site && Arcade.data.site.contacts) || {};
      return String(contacts.telegram || '').trim();
    }
    return '';
  }

  function contactLabel(link) {
    if (/^mailto:/i.test(link)) return 'НАПИСАТЬ ↗';
    if (/t\.me/i.test(link)) return 'TELEGRAM ↗';
    return 'КОНТАКТ ↗';
  }

  function paint() {
    var person = roster[current] || {};
    var index = skillMap();
    var stats = person.stats || {};
    var names = Object.keys(stats);
    var total = names.reduce(function (sum, name) { return sum + clamp(stats[name], 0, 10); }, 0);
    var hand = 'P' + (current + 1);

    el.tag.textContent = hand;
    el.stageTag.textContent = hand;
    el.count.textContent = (current + 1) + ' / ' + roster.length;

    el.sprite.src = person.sprite || 'assets/sprites/mage.png';
    el.sprite.alt = 'Пиксельный портрет: ' + (person.name || 'игрок');
    el.klass.textContent = person['class'] || '—';

    el.name.textContent = person.name || 'PLAYER';
    el.bio.textContent = person.bio || 'Биография пока не заполнена.';

    el.group.textContent = person.group || '—';
    el.role.textContent = person.role || '—';
    el.power.innerHTML = '<b>' + total + '</b> <span class="prof__power-max">/ ' +
      (names.length ? names.length * 10 : 0) + '</span>';

    el.stats.innerHTML = names.length ? names.map(function (name) {
      var value = clamp(stats[name], 0, 10);
      return '<li class="stat">' +
        '<span class="stat__label">' + esc(name) + '</span>' +
        '<span class="stat__segs">' + segsHTML(value, 10) + '</span>' +
        '<span class="stat__num">' + value + '</span>' +
        '</li>';
    }).join('') : '<li class="prof__empty">Статы не указаны</li>';

    el.inv.innerHTML = (person.inventory || []).length ? person.inventory.map(function (id) {
      var skill = index[id] || {};
      var label = skill.label || String(id).toUpperCase();
      var icon = skill.icon || 'gem';
      var lvl = skill.level == null ? '' : '<span class="pitem__lvl">LVL ' + esc(skill.level) + '</span>';
      return '<li class="pitem" title="' + esc(label) + '">' +
        '<img class="pitem__icon" src="assets/sprites/icon-' + esc(icon) + '.png" alt="" width="16" height="16">' +
        '<span class="pitem__label">' + esc(label) + '</span>' + lvl +
        '</li>';
    }).join('') : '<li class="prof__empty">Инвентарь пуст</li>';

    var link = contactOf(person);
    if (link) {
      el.contact.hidden = false;
      el.contact.href = link;
      el.contact.textContent = contactLabel(link);
      el.contact.setAttribute('rel', 'noopener');
    } else {
      el.contact.hidden = true;
      el.contact.removeAttribute('href');
    }
    if (el.noContact) el.noContact.hidden = !!link;

    el.status.textContent = 'Профиль ' + (current + 1) + ' из ' + roster.length + ': ' +
      (person.name || '') + (person.role ? ', ' + person.role : '');

    var segs = $$('.seg[data-on="1"]', el.stats);
    var light = function () { segs.forEach(function (seg) { seg.classList.add('is-on'); }); };
    if (reduced) light();
    else requestAnimationFrame(function () { requestAnimationFrame(light); });
  }

  function focusTarget(opener) {
    if (!opener) return document.activeElement;
    if (opener.matches && opener.matches('a[href], button, [tabindex]')) return opener;
    var inner = opener.querySelector && opener.querySelector('a[href], button');
    return inner || opener;
  }

  var inertHosts = ['#screen', '#boot', '#term'];

  function setInert(on) {
    inertHosts.forEach(function (selector) {
      var node = document.querySelector(selector);
      if (!node) return;
      if (on) node.setAttribute('inert', '');
      else node.removeAttribute('inert');
    });
  }

  function show(index, opener) {
    roster = crewData().slice();
    if (!roster.length) return;

    current = ((index % roster.length) + roster.length) % roster.length;
    if (!isOpen) lastFocus = focusTarget(opener);
    paint();

    if (isOpen) return;

    isOpen = true;
    if (box.hidden) box.hidden = false;
    setInert(true);
    var shift = Math.max(0, window.innerWidth - document.documentElement.clientWidth);
    document.documentElement.style.setProperty('--prof-sb', shift + 'px');
    document.documentElement.classList.add('prof-open');
    void box.offsetWidth;                     // пересчёт перед включением перехода
    box.classList.add('is-open');
    setTimeout(function () {
      if (win && isOpen) win.focus({ preventScroll: true });
    }, reduced ? 0 : 40);
    if (Arcade.sfx) Arcade.sfx.select();
  }

  function hide() {
    if (!isOpen) return;
    isOpen = false;
    box.classList.remove('is-open');
    setInert(false);
    document.documentElement.classList.remove('prof-open');
    document.documentElement.style.removeProperty('--prof-sb');
    setTimeout(function () { if (!isOpen) box.hidden = true; }, reduced ? 0 : 190);
    if (lastFocus && document.contains(lastFocus)) lastFocus.focus({ preventScroll: true });
    lastFocus = null;
    if (Arcade.sfx) Arcade.sfx.move();
  }

  function step(delta) {
    if (!isOpen) return;
    roster = crewData().slice();
    if (roster.length < 2) return;
    current = (current + delta + roster.length) % roster.length;
    paint();
    if (Arcade.sfx) Arcade.sfx.select();
  }

  function focusables() {
    return $$('a[href], button:not([disabled]), [tabindex]:not([tabindex="-1"])', box)
      .filter(function (node) {
        return node === document.activeElement || node.offsetWidth > 0 || node.offsetHeight > 0;
      });
  }

  function trap(event) {
    var items = focusables();
    if (!items.length) return;
    var first = items[0];
    var last = items[items.length - 1];

    if (!box.contains(document.activeElement)) {
      event.preventDefault();
      first.focus();
      return;
    }
    if (event.shiftKey && document.activeElement === first) {
      event.preventDefault();
      last.focus();
    } else if (!event.shiftKey && document.activeElement === last) {
      event.preventDefault();
      first.focus();
    }
  }

  $$('[data-prof-close]', box).forEach(function (node) {
    node.addEventListener('click', hide);
  });
  ['#profClose', '#profCloseBtn'].forEach(function (selector) {
    var node = $(selector, box);
    if (node) node.addEventListener('click', hide);
  });
  var prevBtn = $('#profPrev', box);
  var nextBtn = $('#profNext', box);
  if (prevBtn) prevBtn.addEventListener('click', function () { step(-1); });
  if (nextBtn) nextBtn.addEventListener('click', function () { step(1); });

  document.addEventListener('keydown', function (event) {
    if (!isOpen) return;
    if (event.key === 'Escape') {
      event.preventDefault();
      hide();
    } else if (event.key === 'ArrowLeft') {
      event.preventDefault();
      step(-1);
    } else if (event.key === 'ArrowRight') {
      event.preventDefault();
      step(1);
    } else if (event.key === 'Tab') {
      trap(event);
    }
  });

  var touchStart = null;
  box.addEventListener('touchstart', function (event) {
    var t = event.touches && event.touches[0];
    if (t) touchStart = { x: t.clientX, y: t.clientY };
  }, { passive: true });
  box.addEventListener('touchend', function (event) {
    if (!touchStart || !event.changedTouches || !event.changedTouches[0]) return;
    var t = event.changedTouches[0];
    var dx = t.clientX - touchStart.x;
    var dy = t.clientY - touchStart.y;
    touchStart = null;
    if (Math.abs(dx) > 56 && Math.abs(dx) > Math.abs(dy) * 1.4) step(dx < 0 ? 1 : -1);
  }, { passive: true });

  Arcade.profile = {
    open: function (id, opener) {
      roster = crewData().slice();
      var index = 0;
      roster.forEach(function (person, i) { if (person.id === id) index = i; });
      show(index, opener);
    },
    close: hide,
    next: function () { step(1); },
    prev: function () { step(-1); },
    isOpen: function () { return isOpen; }
  };

  Arcade.openProfile = Arcade.profile.open;
})();
