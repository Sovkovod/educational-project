(function () {
  'use strict';

  var Arcade = window.Arcade = window.Arcade || {};
  Arcade.data = {};
  Arcade.rendered = false;

  var reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  function esc(value) {
    return String(value == null ? '' : value).replace(/[&<>"']/g, function (ch) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[ch];
    });
  }
  function $(sel, root) { return (root || document).querySelector(sel); }
  function $$(sel, root) { return Array.prototype.slice.call((root || document).querySelectorAll(sel)); }
  function pick(obj, path) {
    return path.split('.').reduce(function (acc, key) {
      return (acc && acc[key] != null) ? acc[key] : undefined;
    }, obj);
  }
  function pad2(n) { return (n < 10 ? '0' : '') + n; }
  function clamp(num, min, max) { return Math.max(min, Math.min(max, Number(num) || 0)); }

  function segsHTML(value, total) {
    var out = '';
    for (var i = 0; i < total; i++) {
      out += '<i class="seg" data-on="' + (i < value ? 1 : 0) + '" style="--i:' + i + '"></i>';
    }
    return out;
  }
  function fillSegs(container) {
    $$('.seg[data-on="1"]', container).forEach(function (seg) { seg.classList.add('is-on'); });
  }

  var FALLBACK = {
    site: {
      team: { title: 'TATARINNOVATION', shortName: 'TATAR TEAM', motto: 'ДЕВИЗ КОМАНДЫ — НАШИ БАГИ ЭТО ВАШИ ФИЧИ', university: 'КНИТУ-КХТИ', group: '861-ТОП862' },
      site: {
        event: 'ВОЛГА.ТОП 2026', copyright: '© 2026 Команда', levelCaption: 'STAGE 0 — RIVER VALLEY',
        crewLead: 'Четыре игрока в составе. Выберите карточку — откроется профиль с контактом.',
        about: [
          'Мы — TATARINNOVATION: четыре студента КНИТУ-КХТИ с программы «ТОП\u00A0АЙТИ» — капитан, фронтенд, инфраструктура и дизайн.',
          'На «Волга.ТОП 2026» мы пришли проверить себя на реальной задаче и жёстком сроке — и показать, что умеем командой доводить проект до работающего результата.',
          'Мы пишем код, работаем ночами и пьем кофе литрами',
          'У каждого участника свои суперспособности и уровни силы — как в настоящей RPG.',
          'Прокрутите дальше — там профили экипажа, доска проектов и канал для связи с капитаном.'
        ]
      },
      contacts: { captain: 'Зиганшин Равиль', email: 'ziganshinraw@yandex.ru', telegram: 'https://t.me/ravil_cfmoto', repo: 'https://github.com/Sovkovod/educational-project', repoLabel: 'https://github.com/Sovkovod/educational-project' }
    },
    crew: [
      { id: 'player1', name: 'Зиганшин Равиль', 'class': 'Idea', group: '861-ТОП862 · 1 КУРС', role: 'Капитан', stats: { Python: 8, Docker: 6, PostgreSQL: 5 }, inventory: ['python', 'postgresql', 'docker', 'git'], sprite: 'assets/sprites/mage.png', contact: 'https://t.me/ravil_cfmoto', bio: 'Отвечает за идею и сам продукт: придумывает фичи и координирует движения внутри команды. Ведет проект' },
      { id: 'player2', name: 'Галеев Григорий', 'class': 'Front', group: '861-ТОП862 · 1 КУРС', role: 'Frontend', stats: { JavaScript: 8, React: 7, CSS: 7 }, inventory: ['javascript', 'react', 'git', 'figma'], sprite: 'assets/sprites/ranger.png', contact: 'https://t.me/varzi', bio: 'Отвечает за фронтенд: React, вёрстка и анимации интерфейса.' },
      { id: 'player3', name: 'Сафин Реаль', 'class': 'Back', group: '861-ТОП862 · 1 КУРС', role: 'DevOps', stats: { Docker: 8, Bash: 7, Nginx: 6 }, inventory: ['docker', 'bash', 'git', 'nginx'], sprite: 'assets/sprites/knight.png', contact: 'https://t.me/RevaForU', bio: 'Отвечает за инфраструктуру.' },
      { id: 'player4', name: 'Загриев Амир', 'class': 'Design Cleric', group: '861-ТОП862 · 1 КУРС', role: 'Дизайн', stats: { Figma: 8, UI: 7, Typography: 6 }, inventory: ['figma', 'css', 'javascript', 'git'], sprite: 'assets/sprites/engineer.png', contact: 'https://t.me/N1kxADG', bio: 'Отвечает за дизайн.' }
    ],
    skills: {
      directions: [
        { id: 'frontend', label: 'FRONTEND', value: 7 },
        { id: 'backend', label: 'BACKEND', value: 8 },
        { id: 'devops', label: 'DEVOPS', value: 6 },
        { id: 'design', label: 'DESIGN', value: 5 }
      ],
      slots: [
        { id: 'languages', label: 'ЯЗЫКИ', items: [
          { id: 'python', label: 'PYTHON', level: 8, icon: 'scroll', owners: ['player1', 'player3'] },
          { id: 'javascript', label: 'JAVASCRIPT', level: 7, icon: 'gem', owners: ['player2', 'player4'] },
          { id: 'sql', label: 'SQL', level: 6, icon: 'key', owners: ['player1'] },
          { id: 'bash', label: 'BASH', level: 6, icon: 'sword', owners: ['player3'] }
        ] },
        { id: 'frameworks', label: 'ФРЕЙМВОРКИ', items: [
          { id: 'fastapi', label: 'FASTAPI', level: 7, icon: 'scroll', owners: ['player1'] },
          { id: 'react', label: 'REACT', level: 7, icon: 'gem', owners: ['player2'] },
          { id: 'postgresql', label: 'POSTGRESQL', level: 6, icon: 'key', owners: ['player1', 'player3'] },
          { id: 'nginx', label: 'NGINX', level: 5, icon: 'shield', owners: ['player3'] }
        ] },
        { id: 'tools', label: 'ИНСТРУМЕНТЫ', items: [
          { id: 'docker', label: 'DOCKER', level: 7, icon: 'shield', owners: ['player1', 'player3'] },
          { id: 'git', label: 'GIT', level: 7, icon: 'key', owners: ['player1', 'player2', 'player3', 'player4'] },
          { id: 'figma', label: 'FIGMA', level: 6, icon: 'potion', owners: ['player4'] },
          { id: 'css', label: 'CSS / АНИМАЦИИ', level: 7, icon: 'potion', owners: ['player2', 'player4'] }
        ] }
      ]
    },
    scores: [
      { id: 'project1', name: 'КЕЙС-ЧЕМПИОНАТ МОСКВА — 2 МЕСТО', status: 'CLEARED', stack: [], role: '', desc: 'Кейс-чемпионат в Москве: команда заняла 2 место.', shot: '', link: '' }
    ]
  };

  var FILES = [
    ['site', 'data/site.json'],
    ['crew', 'data/crew.json'],
    ['skills', 'data/skills.json'],
    ['scores', 'data/scores.json']
  ];

  function loadData() {
    return Promise.all(FILES.map(function (file) {
      return fetch(file[1], { cache: 'no-store' })
        .then(function (res) {
          if (!res.ok) throw new Error('HTTP ' + res.status);
          return res.json();
        })
        .catch(function () { return null; });
    })).then(function (results) {
      var offline = false;
      results.forEach(function (value, i) {
        if (value == null) {
          offline = true;
          value = FALLBACK[FILES[i][0]];
        }
        Arcade.data[FILES[i][0]] = value;
      });
      Arcade.offline = offline;
    });
  }

  function applyTexts() {
    var data = Arcade.data.site || {};
    $$('[data-site-text]').forEach(function (node) {
      var value = pick(data, node.getAttribute('data-site-text'));
      if (typeof value === 'string' && value.trim()) node.textContent = value;
    });

    var team = data.team || {};
    var meta = data.site || {};
    if (team.title) {
      document.title = team.title + ' — аркадный автомат · ' + (meta.event || '');
    }
    if (meta.crewLead) {
      var lead = $('[data-site-text="site.crewLead"]');
      if (lead) lead.textContent = meta.crewLead;
    }

    var contacts = data.contacts || {};
    var play = $('#playAgain');
    if (play && contacts.email) {
      play.href = 'mailto:' + contacts.email;
      play.setAttribute('aria-label', 'Написать капитану: ' + contacts.email);
    }
    var tg = $('#telegramLink');
    if (tg && contacts.telegram) {
      tg.href = contacts.telegram;
      tg.hidden = false;
    }
    var repo = $('#repoLink');
    if (repo && contacts.repo) {
      repo.href = contacts.repo;
      if (contacts.repoLabel) repo.textContent = contacts.repoLabel;
    }
    var cap = $('[data-site-text="contacts.captain"]');
    if (cap && contacts.captain) cap.textContent = contacts.captain;
  }

  function renderAbout() {
    var host = document.getElementById('aboutText');
    var site = Arcade.data.site || {};
    if (!host) return;

    var lines = (site.site && site.site.about) || [];
    host.innerHTML = lines.map(function (text) {
      return '<p class="typer__line">' + esc(text) + '</p>';
    }).join('');

    startTypewriter(host);

    var totals = {
      statPlayers: (Arcade.data.crew || []).length,
      statSkills: countSkills(),
      statScores: (Arcade.data.scores || []).length
    };
    Object.keys(totals).forEach(function (id) {
      var node = document.getElementById(id);
      if (!node) return;
      node.textContent = pad2(totals[id]);
      countUp(node, totals[id]);
    });
  }

  function countSkills() {
    var slots = (Arcade.data.skills && Arcade.data.skills.slots) || [];
    return slots.reduce(function (sum, slot) { return sum + (slot.items || []).length; }, 0);
  }

  function countUp(node, target) {
    if (reduced || target === 0) { node.textContent = pad2(target); return; }
    var start = 0;
    var step = function () {
      start += 1;
      node.textContent = pad2(start);
      if (start < target) setTimeout(step, 90);
    };
    node.textContent = pad2(0);
    onVisible(node, step);
  }

  function startTypewriter(host) {
    var lines = $$('.typer__line', host);
    if (!lines.length) return;
    var started = false;

    function type() {
      if (started) return;
      started = true;
      if (reduced) return;

      host.classList.add('is-typing');
      var index = 0;

      function nextLine() {
        if (index >= lines.length) {
          host.classList.remove('is-typing');
          host.classList.add('is-typed');
          return;
        }
        var line = lines[index++];
        var text = line.textContent;
        line.textContent = '';
        var i = 0;
        (function tick() {
          i += 1;
          line.textContent = text.slice(0, i);
          if (i < text.length) {
            setTimeout(tick, 12);
          } else {
            setTimeout(nextLine, 200);
          }
        })();
      }
      nextLine();
    }

    onVisible(host, type, 0.25);
  }

  function skillIndex() {
    var map = {};
    var slots = (Arcade.data.skills && Arcade.data.skills.slots) || [];
    slots.forEach(function (slot) {
      (slot.items || []).forEach(function (item) { map[item.id] = item; });
    });
    return map;
  }

  function renderCrew() {
    var grid = document.getElementById('crewGrid');
    if (!grid) return;
    var crew = Arcade.data.crew || [];
    var index = skillIndex();

    grid.innerHTML = crew.map(function (person, i) {
      var stats = Object.keys(person.stats || {}).map(function (name) {
        var value = clamp(person.stats[name], 0, 10);
        return '<li class="stat">' +
          '<span class="stat__label" title="' + esc(name) + '">' + esc(name) + '</span>' +
          '<span class="stat__segs" data-fill-segs>' + segsHTML(value, 10) + '</span>' +
          '</li>';
      }).join('');

      var inventory = (person.inventory || []).map(function (id) {
        var skill = index[id] || {};
        var label = skill.label || id;
        return '<li class="inv__item" title="' + esc(label) + '">' +
          '<img src="assets/sprites/icon-' + esc(skill.icon || 'gem') + '.png" alt="' + esc(label) + '" width="16" height="16">' +
          '</li>';
      }).join('');

      var skills = (person.inventory || []).join(' ');

      return '<article class="card" id="card-' + esc(person.id) + '" data-crew="' + esc(person.id) + '" data-skills="' + esc(skills) + '">' +
        '<div class="card__portrait">' +
          '<span class="card__tag">P' + (i + 1) + '</span>' +
          '<img class="card__sprite" src="' + esc(person.sprite) + '" alt="Пиксельный портрет: ' + esc(person.name) + '" width="96" height="96">' +
          '<span class="card__class">' + esc(person['class'] || '') + '</span>' +
        '</div>' +
        '<h3 class="card__name">' + esc(person.name) + '</h3>' +
        '<p class="card__meta">' + esc(person.group || '') + ' · <b>' + esc(person.role || '') + '</b></p>' +
        '<ul class="stats">' + stats + '</ul>' +
        '<ul class="inv">' + inventory + '</ul>' +
        '<button class="btn btn--ghost btn--sm card__open" type="button" aria-haspopup="dialog">PROFILE ▶</button>' +
        '</article>';
    }).join('');

    $$('[data-fill-segs]', grid).forEach(observeFill);

    grid.addEventListener('click', function (event) {
      if (event.target.closest('a')) return;
      var card = event.target.closest('.card');
      if (!card || !Arcade.openProfile) return;
      Arcade.openProfile(card.getAttribute('data-crew'), card);
    });
  }

  function renderSkills() {
    var data = Arcade.data.skills || {};
    var dirHost = document.getElementById('directions');
    var slotHost = document.getElementById('skillSlots');

    if (dirHost) {
      dirHost.innerHTML = (data.directions || []).map(function (dir) {
        var value = clamp(dir.value, 0, 10);
        return '<div class="dir">' +
          '<div class="dir__top"><span>' + esc(dir.label) + '</span>' +
          '<span class="dir__val">' + (value * 10) + '%</span></div>' +
          '<div class="dir__segs" data-fill-segs>' + segsHTML(Math.round(value * 2), 20) + '</div>' +
          '</div>';
      }).join('');
      $$('[data-fill-segs]', dirHost).forEach(observeFill);
    }

    var allSkills = {};
    if (slotHost) {
      slotHost.innerHTML = (data.slots || []).map(function (slot) {
        var plates = (slot.items || []).map(function (item) {
          allSkills[item.id] = item;
          return '<button class="plate" type="button" data-skill="' + esc(item.id) + '" aria-pressed="false">' +
            '<img class="plate__icon" src="assets/sprites/icon-' + esc(item.icon || 'gem') + '.png" alt="" width="16" height="16">' +
            '<span class="plate__label">' + esc(item.label) + '</span>' +
            '<span class="plate__mini" data-fill-segs aria-hidden="true">' + segsHTML(clamp(item.level, 0, 10), 10) + '</span>' +
            '<span class="plate__lvl">LVL ' + esc(item.level) + '</span>' +
            '</button>';
        }).join('');
        return '<div class="slot"><h3 class="slot__title">' + esc(slot.label) + '</h3>' +
          '<div class="plates">' + plates + '</div></div>';
      }).join('');
      $$('[data-fill-segs]', slotHost).forEach(observeFill);

      slotHost.addEventListener('click', function (event) {
        var plate = event.target.closest('.plate');
        if (!plate) return;
        setSkillFilter(plate.getAttribute('data-skill'), allSkills);
      });
    }

    var reset = document.getElementById('filterReset');
    if (reset) reset.addEventListener('click', clearSkillFilter);
  }

  var activeSkill = null;

  function setSkillFilter(id, index) {
    var grid = document.getElementById('crewGrid');
    var bar = document.getElementById('filterbar');
    if (!grid || !bar) return;

    if (activeSkill === id) { clearSkillFilter(); return; }
    activeSkill = id;

    var owners = [];
    $$('.card', grid).forEach(function (card) {
      var owns = (' ' + (card.getAttribute('data-skills') || '') + ' ').indexOf(' ' + id + ' ') > -1;
      card.classList.toggle('is-match', owns);
      card.classList.toggle('is-dimmed', !owns);
      if (owns) {
        var nameNode = $('.card__name', card);
        if (nameNode) owners.push(nameNode.textContent);
      }
    });

    $$('.plate').forEach(function (plate) {
      var on = plate.getAttribute('data-skill') === id;
      plate.classList.toggle('is-active', on);
      plate.setAttribute('aria-pressed', on ? 'true' : 'false');
    });

    var skill = index[id] || {};
    $('#filterName').textContent = skill.label || id;
    $('#filterOwners').textContent = owners.length
      ? owners.join(', ')
      : 'никто не отметил этот навык в crew.json';
    bar.hidden = false;
  }

  function clearSkillFilter() {
    activeSkill = null;
    $$('.card').forEach(function (card) {
      card.classList.remove('is-match', 'is-dimmed');
    });
    $$('.plate').forEach(function (plate) {
      plate.classList.remove('is-active');
      plate.setAttribute('aria-pressed', 'false');
    });
    var bar = document.getElementById('filterbar');
    if (bar) bar.hidden = true;
  }

  function renderScores() {
    var body = document.getElementById('scoresBody');
    if (!body) return;
    var scores = Arcade.data.scores || [];

    if (!scores.length) {
      body.innerHTML = '<tr><td colspan="3" class="scores__empty">Проектов пока нет — добавьте их в data/scores.json</td></tr>';
      return;
    }

    body.innerHTML = scores.map(function (project, i) {
      var cleared = project.status === 'CLEARED';
      var detailId = 'det-' + project.id;
      var stack = (project.stack || []).map(function (tech) {
        return '<span class="chip">' + esc(tech) + '</span>';
      }).join('');

      return '<tr class="is-clickable" data-row="' + esc(project.id) + '">' +
          '<td class="score__rank">' + pad2(i + 1) + '</td>' +
          '<td class="score__name">' +
            '<button class="score__toggle" type="button" aria-expanded="false" aria-controls="' + esc(detailId) + '">' +
              '<span>' + esc(project.name) + '</span><span class="chev" aria-hidden="true">▶</span>' +
            '</button>' +
            (project.role ? '<small>' + esc(project.role) + '</small>' : '') +
          '</td>' +
          '<td class="score__status"><span class="badge badge--' + (cleared ? 'cleared' : 'locked') + '">' +
            (cleared ? 'CLEARED' : '<img class="badge__icon" src="assets/sprites/icon-lock.png" alt="" width="12" height="12">LOCKED') +
          '</span></td>' +
        '</tr>' +
        '<tr class="details-row" id="' + esc(detailId) + '" hidden>' +
          '<td colspan="3">' +
            '<div class="details' + (project.shot ? '' : ' details--noimg') + '">' +
              (project.shot
                ? '<img class="details__shot" src="' + esc(project.shot) + '" alt="Скриншот проекта ' + esc(project.name) + '" width="180" height="101">'
                : '') +
              '<div class="details__body">' +
                '<div class="details__row"><span class="details__k">ЧТО ЭТО</span><p>' + esc(project.desc || '') + '</p></div>' +
                (stack ? '<div class="details__row"><span class="details__k">СТЕК</span><div class="chips">' + stack + '</div></div>' : '') +
                (project.role ? '<div class="details__row"><span class="details__k">РОЛЬ КОМАНДЫ</span><p>' + esc(project.role) + '</p></div>' : '') +
                (project.link ? '<div class="details__row"><a class="link-plain" href="' + esc(project.link) + '" rel="noopener">открыть проект →</a></div>' : '') +
              '</div>' +
            '</div>' +
          '</td>' +
        '</tr>';
    }).join('');

    body.addEventListener('click', function (event) {
      var toggle = event.target.closest('.score__toggle');
      var row = event.target.closest('tr[data-row]');
      if (!row) return;
      if (!toggle && event.target.closest('.details-row')) return;
      event.preventDefault();
      var detail = document.getElementById('det-' + row.getAttribute('data-row'));
      var btn = $('.score__toggle', row);
      if (!detail || !btn) return;
      var open = btn.getAttribute('aria-expanded') === 'true';
      btn.setAttribute('aria-expanded', open ? 'false' : 'true');
      row.classList.toggle('is-open', !open);
      detail.hidden = open;
    });
  }

  function initCountdown() {
    var box = $('.gameover');
    var line = document.getElementById('continueLine');
    if (!box || !line) return;
    var fired = false;

    function finish() {
      line.classList.add('is-yes');
      line.innerHTML = 'CONTINUE? <span class="blink">YES</span>';
    }

    function run() {
      if (fired) return;
      fired = true;
      if (reduced) { finish(); return; }
      var num = document.getElementById('continueNum');
      var n = 9;
      var timer = setInterval(function () {
        n -= 1;
        if (n <= 0) { clearInterval(timer); finish(); return; }
        if (num) num.textContent = n;
      }, 420);
    }

    onVisible(box, run, 0.4);
  }

  var fillObserver = null;
  if ('IntersectionObserver' in window) {
    fillObserver = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) return;
        fillSegs(entry.target);
        fillObserver.unobserve(entry.target);
      });
    }, { threshold: 0.25 });
  }

  function observeFill(container) {
    if (fillObserver) fillObserver.observe(container);
    else fillSegs(container);
  }

  function onVisible(node, callback, threshold) {
    if (!('IntersectionObserver' in window)) { callback(); return; }
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) return;
        io.unobserve(entry.target);
        callback();
      });
    }, { threshold: threshold || 0.15 });
    io.observe(node);
  }

  function initReveal() {
    var nodes = $$('[data-reveal]');
    if (!('IntersectionObserver' in window)) {
      nodes.forEach(function (node) { node.classList.add('is-in'); });
      return;
    }
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) return;
        entry.target.classList.add('is-in');
        io.unobserve(entry.target);
      });
    }, { rootMargin: '0px 0px -6% 0px', threshold: 0.06 });
    nodes.forEach(function (node) { io.observe(node); });
  }

  function offlineNotice() {
    if (!Arcade.offline) return;
    var main = document.getElementById('main');
    if (!main) return;
    var note = document.createElement('p');
    note.className = 'notice';
    note.innerHTML = 'ДЕМО-РЕЖИМ: файлы data/*.json не загрузились (страница открыта как файл ' +
      'или папка data недоступна), показаны встроенные демо-данные. ' +
      'Запустите сервер — <code>python -m http.server 8080</code> или <code>docker compose up</code> — ' +
      'и весь контент будет читаться из JSON.';
    main.insertBefore(note, main.firstChild);
  }

  function init() {
    try {
      applyTexts();
      renderAbout();
      renderCrew();
      renderSkills();
      renderScores();
      initCountdown();
      initReveal();
      offlineNotice();
      Arcade.rendered = true;
      document.dispatchEvent(new CustomEvent('arcade:ready'));
    } catch (error) {
      console.error('[arcade:data]', error);
      $$('[data-reveal]').forEach(function (node) { node.classList.add('is-in'); });
    }
  }

  loadData().then(init).catch(function (error) {
    console.error('[arcade:data]', error);
    init();
  });
})();
