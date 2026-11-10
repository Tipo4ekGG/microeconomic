const main = document.querySelector('#main');
const searchForm = document.querySelector('#search-form');
const searchInput = document.querySelector('#search');
const searchResults = document.querySelector('#search-results');
const searchStatus = document.querySelector('#search-status');
const number = new Intl.NumberFormat('ru-RU', { maximumFractionDigits: 2 });
const topicById = Object.fromEntries(topics.map(topic => [topic.id, topic]));
const sections = Object.entries(sectionTitles).sort(([a], [b]) => a.localeCompare(b, 'ru', { numeric: true })).map(([id, title]) => {
  const entries = topics.filter(topic => topic.section === id);
  return { id, title, entries, page: entries[0].page, chapter: id.split('.')[0] };
});
const sectionById = Object.fromEntries(sections.map(section => [section.id, section]));

function formula(key) {
  return `<div class="formula">${formulas[key]}</div>`;
}

function sectionList(items, current) {
  return `<ol class="section-list">${items.map(section => `<li>
    <a href="#section/${section.id}"${section.id === current ? ' aria-current="page"' : ''}>
      <span class="section-number">${section.id}</span>
      <span class="section-name"><strong>${section.title}</strong><small>${section.entries.length === 1 ? section.entries[0].summary : section.entries.map(topic => topic.title).join(' · ')}</small></span>
      <span class="section-page">с. ${section.page}</span>
      <span class="section-arrow" aria-hidden="true">↗</span>
    </a>
  </li>`).join('')}</ol>`;
}

function graphLinks() {
  const linked = topics.filter(topic => topic.graph);
  return `<div class="graph-list">${linked.map(topic => `<a href="#topic/${topic.id}/graph">
    <span class="graph-icon" aria-hidden="true">⌁</span><strong>${graphs[topic.graph].title}</strong><span aria-hidden="true">↗</span>
  </a>`).join('')}</div>`;
}

function home() {
  return `<section class="hero">
    <div class="hero-content">
      <div class="eyebrow"><span class="dot"></span> УЧЕБНЫЙ СПРАВОЧНИК</div>
      <h1>Микроэкономика<span>.</span></h1>
      <p>Определения, формулы и графики в порядке глав учебника.</p>
      <div class="hero-actions"><a class="button primary" href="#contents">К оглавлению <span aria-hidden="true">↓</span></a></div>
    </div>
    <figure class="hero-chart" aria-label="Схема оптимального выбора: бюджетная линия касается кривой безразличия">
      <div class="chart-meta"><span><i></i> МОДЕЛЬ ВЫБОРА</span><span>РИС. 01</span></div>
      <svg viewBox="0 0 390 246" aria-hidden="true">
        <defs><pattern id="hero-grid" width="36" height="36" patternUnits="userSpaceOnUse"><path d="M 36 0 L 0 0 0 36" fill="none" stroke="#475b67" stroke-width="1"/></pattern></defs>
        <path d="M46 20H366V209H46Z" fill="url(#hero-grid)"/>
        <path d="M46 23V209H363" fill="none" stroke="#a2b1b8"/>
        <path d="M46 43L336 209" stroke="#fd9c7c" stroke-width="2" fill="none"/>
        <path d="M101 37C126 80 149 102 191 126C233 150 278 167 345 173" stroke="#b8d9ca" stroke-width="2.4" fill="none"/>
        <path d="M191 126V209M46 126H191" stroke="#a2b1b8" stroke-dasharray="4 5" opacity=".75"/>
        <circle cx="191" cy="126" r="11" fill="#fd9c7c" opacity=".2"/><circle cx="191" cy="126" r="4.5" fill="#fd9c7c"/>
        <text x="207" y="116">оптимум</text><text x="27" y="28">Y</text><text x="355" y="230">X</text>
      </svg>
      <figcaption><span><i></i> Бюджетная линия</span><span><i></i> Кривая безразличия</span></figcaption>
    </figure>
  </section>
  <section class="contents" id="contents" tabindex="-1" aria-labelledby="topic-heading">
    <div class="section-top"><div><div class="eyebrow ink">ПО УЧЕБНИКУ</div><h2 id="topic-heading">Оглавление</h2></div><span class="count">${sections.length} параграфов</span></div>
    <p class="contents-intro">Выбери тему, затем нужный параграф.</p>
    <nav class="chapter-jumps" aria-label="Темы справочника">${Object.keys(chapterTitles).map(id => `<a href="#chapter/${id}" aria-label="Тема ${id}. ${chapterTitles[id]}">Тема ${id}</a>`).join('')}</nav>
    ${Object.entries(chapterTitles).map(([id, title]) => `<section class="chapter" id="chapter-${id}" tabindex="-1">
      <h3><span>ТЕМА ${id}</span>${title}</h3>${sectionList(sections.filter(section => section.chapter === id))}
    </section>`).join('')}
  </section>`;
}

function crumbs(label, chapter) {
  return `<nav class="crumbs" aria-label="Путь к странице"><a href="#contents">Оглавление</a><span aria-hidden="true">/</span>${chapter ? `<a href="#chapter/${chapter}">Тема ${chapter}</a><span aria-hidden="true">/</span>` : ''}<span aria-current="page">${label}</span></nav>`;
}

function conceptMarkup(topic, showTitle) {
  const links = topic.related.map(id => topicById[id]).filter(link => link.section !== topic.section);
  return `<section id="concept-${topic.id}" class="concept" tabindex="-1" aria-label="${topic.title}">
    ${showTitle ? `<h2>${topic.title}</h2>` : ''}
    ${topic.key ? `<div class="formula-group">${[topic.key, ...(topic.extraKeys ?? [])].map(formula).join('')}</div>` : ''}
    <p class="lead">${topic.plain}</p>
    <h3>${topic.key ? 'Обозначения' : 'Термины'}</h3>
    <dl class="symbol-list">${topic.symbols.map(([symbol, meaning]) => `<div><dt>${symbol}</dt><dd>${meaning}</dd></div>`).join('')}</dl>
    ${topic.note ? `<p class="note">${topic.note}</p>` : ''}
    ${topic.graph ? graphMarkup(topic.graph) : ''}
    ${links.length ? `<div class="concept-links"><span>Связано</span>${links.map(link => `<a href="#topic/${link.id}">§ ${link.section} · ${link.title}</a>`).join('')}</div>` : ''}
  </section>`;
}

function sectionPage(section) {
  const chapterSections = sections.filter(item => item.chapter === section.chapter);
  const next = chapterSections[chapterSections.indexOf(section) + 1];
  return `${crumbs('§ ' + section.id, section.chapter)}
  <div class="reader-grid"><article class="reader">
    <div class="eyebrow ink">ТЕМА ${section.chapter} <span class="divider"></span> § ${section.id} · С. ${section.page}</div>
    <h1>${section.title}</h1>
    ${section.entries.length > 1 ? `<nav class="concept-jumps" aria-label="В этой подтеме">${section.entries.map(topic => `<a href="#topic/${topic.id}">${topic.title}</a>`).join('')}</nav>` : ''}
    ${section.entries.map(topic => conceptMarkup(topic, section.entries.length > 1)).join('')}
    ${next ? `<a class="section-next" href="#section/${next.id}"><small>СЛЕДУЮЩАЯ ПОДТЕМА</small><strong>§ ${next.id} · ${next.title} ↗</strong></a>` : ''}
  </article><aside class="reader-aside">
    <h2>Подтемы главы</h2>${sectionList(chapterSections, section.id)}
  </aside></div>`;
}

function collection(type) {
  if (type === 'graphs') {
    return `${crumbs('Графики')}<section class="collection"><div class="eyebrow ink">УКАЗАТЕЛЬ ГРАФИКОВ</div><h1>Графики</h1>
      <p class="lead">Открой график, чтобы увидеть оси, прочитать пояснение и перейти к связанным понятиям.</p>${graphLinks()}</section>`;
  }
  const links = sections.flatMap(section => section.entries.filter(topic => topic.key));
  return `${crumbs('Формулы')}<section class="collection"><div class="eyebrow ink">УКАЗАТЕЛЬ ФОРМУЛ</div><h1>Формулы</h1>
    <p class="lead">Выбери формулу, чтобы открыть её в нужном параграфе.</p>
    <div class="formula-index">${links.map(topic => `<a href="#topic/${topic.id}"><span class="index-label">${topic.title} <small>§ ${topic.section} · с. ${topic.page}</small></span><div class="formula-group">${[topic.key, ...(topic.extraKeys ?? [])].map(formula).join('')}</div></a>`).join('')}</div></section>`;
}

function graphMarkup(kind) {
  const graph = graphs[kind];
  return `<figure id="graph-${kind}" tabindex="-1" class="study-chart" data-graph="${kind}">
    <div class="eyebrow ink">ГРАФИК</div><h2>${graph.title}</h2>
    <svg viewBox="0 0 590 302" role="img" aria-label="${graph.title}"></svg>
    ${kind === 'budget' ? `<div class="controls">${[
      ['income', 'Доход I', 60, 180, 120, 10],
      ['px', 'Цена Pₓ', 2, 6, 3, 1],
      ['py', 'Цена Pᵧ', 1, 6, 1, 1]
    ].map(([id, label, min, max, value, step]) => `<label><span>${label}<output for="${id}">${value}</output></span><input id="${id}" type="range" min="${min}" max="${max}" value="${value}" step="${step}"></label>`).join('')}</div>
    <p class="chart-status" aria-live="polite"></p><button class="reset" type="button">Сбросить значения</button>` : ''}
    ${graph.series ? `<ul class="chart-legend" aria-label="Условные обозначения">${[...graph.series, ...(graph.regions ?? [])].map(item => `<li><span class="legend-${item.style}"></span>${item.label}</li>`).join('')}</ul>` : ''}
    <figcaption>${graph.caption}</figcaption>
  </figure>`;
}

function setupGraph(figure) {
  const kind = figure.dataset.graph;
  const graph = graphs[kind];
  const [maxX, maxY] = graph.max;
  const left = 59, right = 558, top = 34, bottom = 245;
  const sx = x => left + (right - left) * x / maxX;
  const sy = y => bottom - (bottom - top) * y / maxY;
  const pos = ([x, y]) => `${sx(x)},${sy(y)}`;
  const line = (points, cls) => `<polyline class="${cls}" points="${points.map(pos).join(' ')}"/>`;
  const dot = ([x, y], cls) => `<circle class="${cls}" cx="${sx(x)}" cy="${sy(y)}" r="4.5"/>`;
  const ticks = (max, step = max / 5) => Array.from({ length: Math.floor(max / step) + 1 }, (_, i) => i * step);
  const axes = [
    ...ticks(maxX, graph.step?.[0]).map(x => `<path class="grid-line" d="M${sx(x)} ${top}V${bottom}"/><text text-anchor="middle" x="${sx(x)}" y="269">${number.format(x)}</text>`),
    ...ticks(maxY, graph.step?.[1]).filter(y => y > 0).map(y => `<path class="grid-line" d="M${left} ${sy(y)}H${right}"/><text text-anchor="end" x="49" y="${sy(y) + 4}">${number.format(y)}</text>`),
    `<path class="axis" d="M${left} ${top}V${bottom}H${right}"/><text x="${left}" y="19">${graph.y}</text><text text-anchor="end" x="${right}" y="293">${graph.x}</text>`
  ].join('');
  const svg = figure.querySelector('svg');
  const inputs = [...figure.querySelectorAll('input')];

  function draw() {
    let marks;
    if (kind === 'budget') {
      const [income, px, py] = inputs.map(input => Number(input.value));
      inputs.forEach(input => { input.parentElement.querySelector('output').value = number.format(input.value); });
      const points = [[0, income / py], [income / px, 0]];
      marks = `<polygon class="budget-area" points="${[[0, 0], ...points].map(pos).join(' ')}"/>`;
      marks += line([[0, 120], [40, 0]], 'reference-line') + line(points, 'curve') + points.map(point => dot(point, 'chart-dot')).join('');
      figure.querySelector('.chart-status').textContent = `Пересечения с осями · X: ${number.format(income / px)} · Y: ${number.format(income / py)}`;
    } else if (kind === 'optimum') {
      const u = 10 * 90 ** 3;
      const start = u / maxY ** 3;
      const curve = Array.from({ length: 100 }, (_, i) => {
        const x = start + (maxX - start) * i / 99;
        return [x, Math.cbrt(u / x)];
      });
      marks = line([[0, 120], [40, 0]], 'curve') + line(curve, 'green-line') + dot([10, 90], 'chart-dot');
      marks += `<text x="${sx(10) + 10}" y="${sy(90) - 9}">Оптимум</text>`;
    } else if (kind === 'mrs') {
      const start = 6 / maxY;
      const curve = Array.from({ length: 60 }, (_, i) => {
        const x = start + (maxX - start) * i / 59;
        return [x, 6 / x];
      });
      marks = line(curve, 'green-line');
    } else if (graph.series) {
      marks = (graph.regions ?? []).map(region =>
        `<polygon class="${region.style}" points="${region.points.map(pos).join(' ')}"/>`).join('');
      marks += graph.series.map(series => line(series.points, series.style)).join('');
      marks += (graph.labels ?? []).map(({ at, label }) =>
        dot(at, 'chart-dot') + `<text x="${sx(at[0]) + 9}" y="${sy(at[1]) - 8}">${label}</text>`).join('');
    } else {
      marks = line(graph.points, 'curve') + graph.points.map(point => dot(point, 'chart-dot')).join('');
    }
    svg.innerHTML = axes + marks;
  }

  inputs.forEach(input => input.addEventListener('input', draw));
  figure.querySelector('.reset')?.addEventListener('click', () => {
    inputs.forEach(input => { input.value = input.defaultValue; });
    draw();
  });
  draw();
}

function render(moveFocus = false) {
  const [route, id, target] = location.hash.slice(1).split('/');
  const topic = route === 'topic' && Object.hasOwn(topicById, id) ? topicById[id] : null;
  const sectionId = topic?.section ?? (route === 'section' ? id : null);
  const section = Object.hasOwn(sectionById, sectionId) ? sectionById[sectionId] : null;
  const index = route === 'graphs' || route === 'formulas' ? route : null;
  const view = section?.id ?? index ?? 'home';

  if (main.dataset.view !== view) {
    main.dataset.view = view;
    main.innerHTML = section ? sectionPage(section) : index ? collection(index) : home();
    document.title = `${section?.title ?? (index === 'graphs' ? 'Графики' : index === 'formulas' ? 'Формулы' : 'Учебный справочник')} · Микроэкономика`;
    main.querySelectorAll('[data-graph]').forEach(setupGraph);
  }

  const anchor = topic ? (target === 'graph' && topic.graph ? 'graph-' + topic.graph : 'concept-' + topic.id) : route === 'chapter' && Object.hasOwn(chapterTitles, id) ? 'chapter-' + id : route === 'contents' ? 'contents' : null;
  const destination = anchor ? document.getElementById(anchor) : null;
  if (destination) {
    destination.focus({ preventScroll: true });
    destination.scrollIntoView();
  } else if (moveFocus) {
    main.focus({ preventScroll: true });
    window.scrollTo(0, 0);
  }
}

function normalized(value) {
  return value.toLowerCase().replaceAll('ё', 'е').replaceAll('№', ' ').replaceAll(/[^\p{L}\p{N}∂]+/gu, ' ').trim();
}

const searchItems = [
  ...topics.map(topic => ({
    href: '#topic/' + topic.id, title: topic.title, label: '§ ' + topic.section + ' · с. ' + topic.page,
    keywords: normalized([topic.title, sectionTitles[topic.section], topic.tag, topic.summary, topic.section, topic.symbols.map(item => item[0]).join(' '),
      { marginal: 'mu tu au мю предельная', derivative: 'mux muy частные производные дельта ∂', optimum: 'оптимальный равновесие mu px', budget: 'бюджетное ограничение доход px py' }[topic.id] ?? ''].join(' '))
  })),
  ...topics.filter(topic => topic.graph).map(topic => ({
    href: '#topic/' + topic.id + '/graph', title: graphs[topic.graph].title, label: 'График · § ' + topic.section,
    keywords: normalized('график ' + graphs[topic.graph].title)
  }))
];

let matches = [];

function hideSearch() {
  searchResults.hidden = true;
  searchStatus.textContent = '';
}

function showSearch() {
  const query = normalized(searchInput.value);
  if (!query) {
    matches = [];
    hideSearch();
    return;
  }
  matches = searchItems.filter(item => query.split(' ').every(term => item.keywords.includes(term)));
  searchResults.innerHTML = matches.length ? matches.map(item =>
    `<a href="${item.href}"><strong>${item.title}</strong><small>${item.label}</small></a>`).join('') : '<p>Ничего не найдено. Попробуй «MRTS», «КПВ» или «налог».</p>';
  searchResults.hidden = false;
  searchStatus.textContent = `Найдено материалов: ${matches.length}`;
}

searchInput.addEventListener('input', showSearch);
searchInput.addEventListener('focus', showSearch);
searchForm.addEventListener('submit', event => {
  event.preventDefault();
  if (matches.length) {
    const href = matches[0].href;
    hideSearch();
    if (location.hash === href) render(true);
    else location.hash = href;
  }
});
searchResults.addEventListener('click', event => {
  if (event.target.closest('a')) hideSearch();
});
document.addEventListener('click', event => {
  if (!event.target.closest('.search')) hideSearch();
});
document.addEventListener('keydown', event => {
  if (event.key === 'Escape' && !searchResults.hidden) {
    searchInput.focus();
    hideSearch();
  }
  if (event.key === '/' && !event.target.closest('input, textarea, select, [contenteditable]') && !event.altKey && !event.ctrlKey && !event.metaKey) {
    event.preventDefault();
    searchInput.focus();
  }
});
document.querySelector('.skip').addEventListener('click', event => {
  event.preventDefault();
  main.focus();
  main.scrollIntoView();
});
window.addEventListener('hashchange', () => render(true));
render();
