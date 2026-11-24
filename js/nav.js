(function () {
  'use strict';

  var Arcade = window.Arcade = window.Arcade || {};
  var reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  function $(sel, root) { return (root || document).querySelector(sel); }
  function $$(sel, root) { return Array.prototype.slice.call((root || document).querySelectorAll(sel)); }

  var soundOn = true;
  try {
    var savedSound = localStorage.getItem('arcade:sound');
    if (savedSound === 'off') soundOn = false;
  } catch (e) {}

  var audioCtx = null;

  function beep(freq, duration, type, volume) {
    if (!soundOn) return;
    try {
      var Ctx = window.AudioContext || window.webkitAudioContext;
      if (!Ctx) return;
      audioCtx = audioCtx || new Ctx();
      if (audioCtx.state === 'suspended') audioCtx.resume();
      var osc = audioCtx.createOscillator();
      var gain = audioCtx.createGain();
      var now = audioCtx.currentTime;
      osc.type = type || 'square';
      osc.frequency.setValueAtTime(freq, now);
      gain.gain.setValueAtTime(volume || 0.045, now);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + duration);
      osc.connect(gain);
      gain.connect(audioCtx.destination);
      osc.start(now);
      osc.stop(now + duration + 0.02);
    } catch (e) {}
  }

  Arcade.sfx = {
    coin: function () { beep(880, 0.09); setTimeout(function () { beep(1320, 0.14); }, 90); },
    move: function () { beep(440, 0.05, 'square', 0.03); },
    select: function () { beep(660, 0.08); setTimeout(function () { beep(990, 0.1); }, 70); },
    error: function () { beep(160, 0.16, 'sawtooth', 0.035); },
    pull: function () {
      beep(120, 0.09, 'square', 0.05);
      setTimeout(function () { beep(70, 0.13, 'sawtooth', 0.045); }, 45);
      for (var i = 0; i < 10; i++) {
        (function (n) {
          setTimeout(function () {
            beep(820 + Math.random() * 1100, 0.06, 'square', 0.022);
          }, 130 + n * 65 + Math.random() * 60);
        })(i);
      }
    }
  };

  var soundBtn = document.getElementById('soundToggle');
  function paintSoundBtn() {
    if (!soundBtn) return;
    soundBtn.setAttribute('aria-pressed', soundOn ? 'true' : 'false');
    soundBtn.setAttribute('aria-label', 'Звук интерфейса: ' + (soundOn ? 'включён' : 'выключен'));
    soundBtn.textContent = soundOn ? '♪' : '×';
  }
  paintSoundBtn();
  if (soundBtn) {
    soundBtn.addEventListener('click', function () {
      soundOn = !soundOn;
      paintSoundBtn();
      try { localStorage.setItem('arcade:sound', soundOn ? 'on' : 'off'); } catch (e) {}
      if (soundOn) Arcade.sfx.select();
    });
  }

  var boot = document.getElementById('boot');
  var bootOpen = !!boot && !document.documentElement.classList.contains('boot-seen');
  var bootStage = 0;      // 0 — INSERT COIN, 1 — PRESS START
  var booting = false;
  var coinHost = document.getElementById('bootCoins');

  function focusBootButton() {
    var btn = document.getElementById('bootStart');
    if (btn) btn.focus({ preventScroll: true });
  }

  function spawnCoins(count) {
    if (!coinHost || reduced) return;
    coinHost.textContent = '';
    var frag = document.createDocumentFragment();
    for (var i = 0; i < count; i++) {
      var coin = document.createElement('i');
      coin.className = 'coin';
      var side = Math.random() < 0.5 ? -1 : 1;
      coin.style.setProperty('--xf', (side * (0.05 + Math.random() * 0.34)).toFixed(3));
      coin.style.setProperty('--yf', (-0.18 - Math.random() * 0.62).toFixed(3));
      coin.style.setProperty('--spin', Math.round(Math.random() * 900 - 450) + 'deg');
      coin.style.setProperty('--dur', Math.round(880 + Math.random() * 520) + 'ms');
      coin.style.setProperty('--delay', Math.round(i * 24 + Math.random() * 60) + 'ms');
      frag.appendChild(coin);
    }
    coinHost.appendChild(frag);
    setTimeout(function () { coinHost.textContent = ''; }, 2600);
  }

  function showPressStart() {
    if (!boot || booting || boot.classList.contains('is-done')) return;
    bootStage = 1;
    boot.classList.add('is-start');
    var line = boot.querySelector('.boot__insert');
    var hint = boot.querySelector('.boot__hint');
    var btn = document.getElementById('bootStart');
    if (line) line.textContent = 'PRESS START';
    if (hint) hint.textContent = 'нажмите, чтобы войти';
    if (btn) {
      btn.textContent = 'GO';
      btn.setAttribute('aria-label', 'Войти на уровень 0');
    }
    focusBootButton();
  }

  function pullLever() {
    if (bootStage !== 0) return;
    bootStage = 1;
    Arcade.sfx.pull();
    boot.classList.add('is-pulling');
    spawnCoins(30);
    setTimeout(function () { boot.classList.remove('is-pulling'); }, 780);
    if (reduced) {
      showPressStart();
      return;
    }
    setTimeout(showPressStart, 900);
  }

  function finishBoot() {
    if (!boot || booting) return;
    booting = true;
    bootOpen = false;
    boot.classList.add('is-done');
    document.body.classList.remove('boot-open');
    try { localStorage.setItem('arcade:boot', 'done'); } catch (e) {}
    var main = document.getElementById('main');
    if (main) {
      main.setAttribute('tabindex', '-1');
      main.focus({ preventScroll: true });
    }
    var first = document.getElementById('lvl0');
    if (first) first.scrollIntoView({ behavior: reduced ? 'auto' : 'smooth', block: 'start' });
  }

  function bootActivate() {
    if (!bootOpen || booting) return;
    if (bootStage === 0) pullLever();
    else finishBoot();
  }

  if (boot) {
    if (!bootOpen) boot.classList.add('is-done');
    if (bootOpen) {
      document.body.classList.add('boot-open');
      setTimeout(focusBootButton, 60);

      boot.addEventListener('click', function (event) {
        if (event.target.closest('#bootSkip')) return;
        bootActivate();
      });

      var skip = document.getElementById('bootSkip');
      if (skip) {
        skip.addEventListener('click', function (event) {
          event.preventDefault();
          Arcade.sfx.move();
          finishBoot();
        });
      }
    }
  }

  var hud = document.getElementById('hud');
  var levels = $$('.lvl');
  var sections = $$('.lvl-sec');
  var activeIndex = 0;

  function hudHeight() { return hud ? hud.offsetHeight : 64; }

  function setActive(index, silent) {
    if (index < 0 || index >= levels.length) return;
    activeIndex = index;
    levels.forEach(function (link, i) {
      var on = i === index;
      link.classList.toggle('is-active', on);
      if (on) link.setAttribute('aria-current', 'true');
      else link.removeAttribute('aria-current');
    });
    if (!silent) Arcade.sfx.move();
  }

  function scrollToLevel(index) {
    var section = sections[index];
    if (!section) return;
    setActive(index);
    var top = section.getBoundingClientRect().top + window.pageYOffset - hudHeight() - 8;
    window.scrollTo({ top: Math.max(0, top), behavior: reduced ? 'auto' : 'smooth' });
  }

  levels.forEach(function (link, index) {
    link.addEventListener('click', function (event) {
      event.preventDefault();
      if (bootOpen) finishBoot();
      closeMenu();
      scrollToLevel(index);
      Arcade.sfx.select();
    });
  });

  var ticking = false;
  function updateActive() {
    ticking = false;
    var probe = window.pageYOffset + hudHeight() + 60;
    var current = 0;
    sections.forEach(function (section, i) {
      var top = section.getBoundingClientRect().top + window.pageYOffset;
      if (top <= probe) current = i;
    });
    if (current !== activeIndex) setActive(current, true);
  }
  window.addEventListener('scroll', function () {
    if (ticking) return;
    ticking = true;
    window.requestAnimationFrame(updateActive);
  }, { passive: true });
  updateActive();

  var term = document.getElementById('term');
  var termOpen = false;

  function isTypingTarget(target) {
    if (!target) return false;
    var tag = (target.tagName || '').toLowerCase();
    return tag === 'input' || tag === 'textarea' || tag === 'select' || target.isContentEditable;
  }

  document.addEventListener('keydown', function (event) {
    if (event.altKey || event.ctrlKey || event.metaKey) return;

    if (document.documentElement.classList.contains('prof-open')) return;

    if (bootOpen) {
      if (isTypingTarget(event.target)) return;
      if (event.key === 'Enter' || event.key === ' ') {
        event.preventDefault();       // отменяет и «клик» кнопки — двойного срабатывания нет
        bootActivate();
      } else if (event.key === 'Escape') {
        event.preventDefault();
        finishBoot();
      }
      return;
    }

    var key = event.key;

    if (key === 't' || key === 'T' || key === 'т' || key === 'Т') {
      if (isTypingTarget(event.target)) return;
      event.preventDefault();
      toggleTerminal();
      return;
    }

    if (key === 'Escape') {
      if (termOpen) { toggleTerminal(false); return; }
      closeMenu();
      return;
    }

    if (isTypingTarget(event.target)) return;

    if (key === 'ArrowDown' || key === 'ArrowRight') {
      event.preventDefault();
      scrollToLevel(Math.min(levels.length - 1, activeIndex + 1));
    } else if (key === 'ArrowUp' || key === 'ArrowLeft') {
      event.preventDefault();
      scrollToLevel(Math.max(0, activeIndex - 1));
    } else if (key === 'Enter') {
      var target = event.target;
      if (target && target.closest && target.closest('button, a, [role="button"], input, textarea, select')) return;
      event.preventDefault();
      scrollToLevel(activeIndex);
    }
  });

  var menuBtn = document.getElementById('menuBtn');
  var levelsNav = document.getElementById('levels');

  function closeMenu() {
    document.body.classList.remove('nav-open');
    if (menuBtn) menuBtn.setAttribute('aria-expanded', 'false');
  }

  if (menuBtn) {
    menuBtn.addEventListener('click', function (event) {
      event.stopPropagation();
      var open = document.body.classList.toggle('nav-open');
      menuBtn.setAttribute('aria-expanded', open ? 'true' : 'false');
      Arcade.sfx.move();
    });
    document.addEventListener('click', function (event) {
      if (!document.body.classList.contains('nav-open')) return;
      if (event.target.closest('#levels') || event.target.closest('#menuBtn')) return;
      closeMenu();
    });
  }

  $$('[data-scroll]').forEach(function (button) {
    button.addEventListener('click', function () {
      Arcade.sfx.select();
      if (button.getAttribute('data-scroll') === 'top') {
        window.scrollTo({ top: 0, behavior: reduced ? 'auto' : 'smooth' });
        setActive(0);
      } else {
        scrollToLevel(Math.min(levels.length - 1, activeIndex + 1));
      }
    });
  });

  var termOut = document.getElementById('termOut');
  var termInput = document.getElementById('termInput');
  var termForm = document.getElementById('termForm');
  var history = [];
  var historyIndex = 0;

  function print(text, cls) {
    if (!termOut) return;
    var line = document.createElement('div');
    if (cls) line.className = cls;
    line.textContent = text;
    termOut.appendChild(line);
    termOut.scrollTop = termOut.scrollHeight;
  }

  function termHelp() {
    print('ДОСТУПНЫЕ КОМАНДЫ:', 'warn');
    print('  help     — этот список');
    print('  crew     — состав команды');
    print('  skills   — навыки и уровни');
    print('  scores   — таблица рекордов');
    print('  contact  — контакты капитана и репозиторий');
    print('  clear    — очистить экран');
    print('  exit     — закрыть терминал');
    print('подсказка: T открывает и закрывает терминал', 'dim');
  }

  function termCrew() {
    var crew = (Arcade.data && Arcade.data.crew) || [];
    if (!crew.length) { print('данные ещё не загружены, попробуйте через секунду', 'dim'); return; }
    print('CREW:', 'warn');
    crew.forEach(function (person, i) {
      print('  P' + (i + 1) + '  ' + person.name + '  [' + (person.role || '') + ']  ' + (person.group || ''));
    });
  }

  function termSkills() {
    var slots = (Arcade.data && Arcade.data.skills && Arcade.data.skills.slots) || [];
    if (!slots.length) { print('данные ещё не загружены', 'dim'); return; }
    slots.forEach(function (slot) {
      print(slot.label + ':', 'warn');
      (slot.items || []).forEach(function (item) {
        var filled = Math.round((Number(item.level) || 0));
        var bar = '';
        for (var i = 0; i < 10; i++) bar += i < filled ? '█' : '░';
        print('  ' + item.label + ' ' + bar + ' LVL ' + item.level);
      });
    });
  }

  function termScores() {
    var scores = (Arcade.data && Arcade.data.scores) || [];
    if (!scores.length) { print('данные ещё не загружены', 'dim'); return; }
    print('HIGH SCORES:', 'warn');
    scores.forEach(function (project, i) {
      print('  ' + String(i + 1).padStart(2, '0') + '  ' + project.status.padEnd(8) + '  ' + project.name);
    });
  }

  function termContact() {
    var data = (Arcade.data && Arcade.data.site) || {};
    var contacts = data.contacts || {};
    print('CONTACTS:', 'warn');
    print('  капитан:  ' + (contacts.captain || '—'));
    print('  email:    ' + (contacts.email || '—'));
    if (contacts.telegram) print('  telegram: ' + contacts.telegram);
    print('  repo:     ' + (contacts.repo || '—'));
    print('  copyright: ' + ((data.site && data.site.copyright) || '—'));
  }

  function runCommand(raw) {
    var cmd = String(raw || '').trim().toLowerCase();
    print('> ' + raw, 'dim');
    if (!cmd) return;
    history.push(raw);
    historyIndex = history.length;

    switch (cmd) {
      case 'help': case '?': termHelp(); break;
      case 'crew': case 'team': termCrew(); break;
      case 'skills': case 'skill': termSkills(); break;
      case 'scores': case 'score': termScores(); break;
      case 'contact': case 'contacts': termContact(); break;
      case 'ls': print('index.html  css/  js/  data/  assets/  Dockerfile  compose.yml'); break;
      case 'clear': if (termOut) termOut.innerHTML = ''; break;
      case 'exit': case 'quit': toggleTerminal(false); break;
      default:
        print('неизвестная команда: ' + cmd, 'err');
        print('введите help', 'dim');
        Arcade.sfx.error();
    }
  }

  function toggleTerminal(force) {
    if (!term) return;
    var open = typeof force === 'boolean' ? force : !termOpen;
    termOpen = open;
    term.hidden = !open;
    if (open) {
      window.requestAnimationFrame(function () { term.classList.add('is-open'); });
      if (termOut && !termOut.childElementCount) {
        print('TERMINAL v1.0 — пасхалка автомата. Введите help.', 'ok');
      }
      if (termInput) setTimeout(function () { termInput.focus(); }, 40);
      Arcade.sfx.select();
    } else {
      term.classList.remove('is-open');
      setTimeout(function () { if (!termOpen) term.hidden = true; }, 160);
      if (termInput) termInput.blur();
    }
  }

  if (termForm) {
    termForm.addEventListener('submit', function (event) {
      event.preventDefault();
      runCommand(termInput ? termInput.value : '');
      if (termInput) termInput.value = '';
    });
  }
  if (termInput) {
    termInput.addEventListener('keydown', function (event) {
      if (event.key === 'ArrowUp' && history.length) {
        event.preventDefault();
        historyIndex = Math.max(0, historyIndex - 1);
        termInput.value = history[historyIndex] || '';
      } else if (event.key === 'ArrowDown' && history.length) {
        event.preventDefault();
        historyIndex = Math.min(history.length, historyIndex + 1);
        termInput.value = history[historyIndex] || '';
      }
    });
  }
  var termClose = document.getElementById('termClose');
  if (termClose) termClose.addEventListener('click', function () { toggleTerminal(false); });

  try {
    console.log('%cINSERT COIN', 'color:#39ff6a;font:700 16px monospace');
    console.log('%cПасхалка: нажмите T — откроется терминал команды.', 'color:#ffb347;font:12px monospace');
  } catch (e) {}
})();
