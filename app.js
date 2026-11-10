const main = document.querySelector('#main');
const searchForm = document.querySelector('#search-form');
const searchInput = document.querySelector('#search');
const searchResults = document.querySelector('#search-results');
const searchStatus = document.querySelector('#search-status');
const number = new Intl.NumberFormat('ru-RU', { maximumFractionDigits: 2 });
const topicById = Object.fromEntries(topics.map(topic => [topic.id, topic]));
const sections = Object.entries(sectionTitles).map(([id, title]) => {
  const entries = topics.filter(topic => topic.section === id);
  return { id, title, entries, page: entries[0].page };
});
const sectionById = Object.fromEntries(sections.map(section => [section.id, section]));

function formula(key) {
  return `<div class="formula">${formulas[key]}</div>`;
}

function sectionList(current) {
  return `<ol class="section-list">${sections.map(section => `<li>
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
      <div class="eyebrow"><span class="dot"></span> МИКРОЭКОНОМИКА <span class="divider"></span> ТЕМА&nbsp;06</div>
      <h1>Выбор<br>потребителя<span>.</span></h1>
      <p>Как сравнить наборы благ, учесть цены и бюджет и понять, какой выбор принесёт больше пользы.</p>
      <div class="hero-actions"><a class="button primary" href="#contents">К подтемам <span aria-hidden="true">↓</span></a></div>
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
    <div class="section-top"><div><div class="eyebrow ink">ТЕМА 6 · ПО УЧЕБНИКУ</div><h2 id="topic-heading">Подтемы</h2></div><span class="count">${sections.length} параграфов</span></div>
    <p class="contents-intro">Выбери параграф. Формулы, обозначения и графики собраны рядом с объяснениями.</p>
    ${sectionList()}
  </section>`;
}

function crumbs(label) {
  return `<nav class="crumbs" aria-label="Путь к странице"><a href="#contents">Выбор потребителя</a><span aria-hidden="true">/</span><span aria-current="page">${label}</span></nav>`;
}

function conceptMarkup(topic, showTitle) {
  const links = topic.related.map(id => topicById[id]).filter(link => link.section !== topic.section);
  return `<section id="concept-${topic.id}" class="concept" tabindex="-1" aria-label="${topic.title}">
    ${showTitle ? `<h2>${topic.title}</h2>` : ''}
    ${topic.id === 'marginal' ? `<div class="formula-group">${formula('marginal')}${formula('average')}</div>` : topic.key ? formula(topic.key) : ''}
    <p class="lead">${topic.plain}</p>
    <h3>${topic.key ? 'Обозначения' : 'Термины'}</h3>
    <dl class="symbol-list">${topic.symbols.map(([symbol, meaning]) => `<div><dt>${symbol}</dt><dd>${meaning}</dd></div>`).join('')}</dl>
    ${topic.note ? `<p class="note">${topic.note}</p>` : ''}
    ${topic.graph ? graphMarkup(topic.graph) : ''}
    ${links.length ? `<div class="concept-links"><span>Связано</span>${links.map(link => `<a href="#topic/${link.id}">§ ${link.section} · ${link.title}</a>`).join('')}</div>` : ''}
  </section>`;
}

function sectionPage(section) {
  const next = sections[sections.indexOf(section) + 1];
  return `${crumbs('§ ' + section.id)}
  <div class="reader-grid"><article class="reader">
    <div class="eyebrow ink">ТЕМА 6 <span class="divider"></span> § ${section.id} · С. ${section.page}</div>
    <h1>${section.title}</h1>
    ${section.entries.length > 1 ? `<nav class="concept-jumps" aria-label="В этой подтеме">${section.entries.map(topic => `<a href="#topic/${topic.id}">${topic.title}</a>`).join('')}</nav>` : ''}
    ${section.entries.map(topic => conceptMarkup(topic, section.entries.length > 1)).join('')}
    ${next ? `<a class="section-next" href="#section/${next.id}"><small>СЛЕДУЮЩАЯ ПОДТЕМА</small><strong>§ ${next.id} · ${next.title} ↗</strong></a>` : ''}
  </article><aside class="reader-aside">
    <h2>Подтемы главы</h2>${sectionList(section.id)}
  </aside></div>`;
}

function collection(type) {
  if (type === 'graphs') {
    return `${crumbs('Графики')}<section class="collection"><div class="eyebrow ink">ГРАФИКИ / ТЕМА 06</div><h1>Графики</h1>
      <p class="lead">Открой график, чтобы увидеть оси, прочитать пояснение и перейти к связанным понятиям.</p>${graphLinks()}</section>`;
  }
  const links = [...topics.filter(topic => topic.key), { ...topicById.marginal, title: 'Средняя полезность', key: 'average' }];
  return `${crumbs('Формулы')}<section class="collection"><div class="eyebrow ink">СПРАВОЧНИК / ТЕМА 06</div><h1>Формулы</h1>
    <p class="lead">Выбери формулу, чтобы открыть её в нужном параграфе.</p>
    <div class="formula-index">${links.map(topic => `<a href="#topic/${topic.id}"><span class="index-label">${topic.title} <small>§ ${topic.section} · с. ${topic.page}</small></span>${formula(topic.key)}</a>`).join('')}</div></section>`;
}

const graphs = {
  utility: { title: 'Совокупная полезность', caption: 'Наклон отрезка показывает, как изменилась полезность в расчёте на добавленную единицу.', x: 'Q', y: 'TU', max: [10, 20], points: [[0, 0], [2, 8], [4, 14], [6, 18], [8, 20], [10, 20]] },
  mrs: { title: 'Кривая безразличия', caption: 'Для кривой xy = 6 все наборы равноценны. При движении вправо за дополнительную единицу X отдают всё меньше Y.', x: 'Благо X', y: 'Благо Y', max: [8, 8] },
  optimum: { title: 'Оптимум потребителя', caption: 'При U = xy³ и бюджете 3x + y = 120 наилучшая доступная кривая безразличия касается бюджетной линии в точке (10; 90).', x: 'Благо X', y: 'Благо Y', max: [50, 130] },
  engel: { title: 'Пример кривой Энгеля', caption: 'В этом примере при большем доходе выбирают больше единиц X.', x: 'Доход I', y: 'Количество X', max: [1000, 50], points: [[0, 0], [1000, 50]] },
  demand: { title: 'Пример кривой спроса', caption: 'Каждая точка показывает выбранное количество X при своей цене.', x: 'Количество X', y: 'Цена X', max: [10, 10], points: [[2, 9], [4, 6], [6, 4], [8, 3], [10, 2]] },
  budget: { title: 'Бюджетная линия', caption: 'Изменяй доход и цены. Бледная линия показывает исходное положение.', x: 'Благо X', y: 'Благо Y', max: [100, 180] }
};

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
  const ticks = (max, count) => Array.from({ length: count + 1 }, (_, i) => max * i / count);
  const axes = [
    ...ticks(maxX, 5).map(x => `<path class="grid-line" d="M${sx(x)} ${top}V${bottom}"/><text text-anchor="middle" x="${sx(x)}" y="269">${number.format(x)}</text>`),
    ...ticks(maxY, 5).filter(y => y > 0).map(y => `<path class="grid-line" d="M${left} ${sy(y)}H${right}"/><text text-anchor="end" x="49" y="${sy(y) + 4}">${number.format(y)}</text>`),
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
    document.title = `${section?.title ?? (index === 'graphs' ? 'Графики' : index === 'formulas' ? 'Формулы' : 'Выбор потребителя')} · Микроэкономика`;
    main.querySelectorAll('[data-graph]').forEach(setupGraph);
  }

  const anchor = topic ? (target === 'graph' && topic.graph ? 'graph-' + topic.graph : 'concept-' + topic.id) : route === 'contents' ? 'contents' : null;
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
    `<a href="${item.href}"><strong>${item.title}</strong><small>${item.label}</small></a>`).join('') : '<p>Ничего не найдено. Попробуй «MU» или «график спроса».</p>';
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
