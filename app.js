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
const graphKinds = topic => slideGraphGroups[topic.id] ?? (topic.graph ? [topic.graph] : []);
const galleryEntries = sections.flatMap(section => section.entries.flatMap(topic =>
  graphKinds(topic).map(kind => ({ kind, topic, section }))
));
const graphByKind = Object.fromEntries(galleryEntries.map(entry => [entry.kind, entry]));
const galleryState = { query: '', chapter: 'all' };
let chartObservers = [];

function formula(key) {
  return `<div class="formula">${formulas[key]}</div>`;
}

function sectionList(items) {
  return `<ol class="section-list">${items.map(section => `<li>
    <a href="#section/${section.id}">
      <span class="section-number">${section.id}</span>
      <span class="section-name"><strong>${section.title}</strong><small>${section.entries.length === 1 ? section.entries[0].summary : section.entries.map(topic => topic.title).join(' · ')}</small></span>
      <span class="section-page">с. ${section.page}</span>
      <span class="section-arrow" aria-hidden="true">↗</span>
    </a>
  </li>`).join('')}</ol>`;
}

function graphSource(kind) {
  return (slideGraphSources[kind] ?? '').split(' ').filter(Boolean).map(id => 'IMG_' + id).join(', ');
}

function graphPreview(kind) {
  const graph = graphs[kind];
  const [minX, minY] = graph.min ?? [0, 0];
  const [maxX, maxY] = graph.max;
  const series = graph.series?.filter(line => line.style !== 'guide-line')
    ?? [{ style: 'curve', points: graph.points ?? [[0, 120], [40, 0]] }];
  const x = value => 7 + (value - minX) / (maxX - minX) * 87;
  const y = value => 58 - (value - minY) / (maxY - minY) * 48;
  return `<svg class="graph-preview" viewBox="0 0 100 64" aria-hidden="true" focusable="false">
    <path class="axis" d="M7 8V58H95"/>
    ${series.slice(0, 3).map(line => `<polyline class="${line.style}" points="${line.points.map(([px, py]) =>
      `${x(px).toFixed(1)},${y(py).toFixed(1)}`).join(' ')}"/>`).join('')}
  </svg>`;
}

function graphGallery() {
  const chapters = [...new Set(galleryEntries.map(entry => entry.section.chapter))];
  return `${crumbs('Графики')}
  <section class="collection graph-gallery">
    <div class="eyebrow ink">АТЛАС ГРАФИКОВ</div><h1>Графики</h1>
    <p class="lead">Выбери тему или введи название либо номер фото.</p>
    <div class="gallery-controls">
      <label>Найти график<input type="search" id="gallery-search" placeholder="Например, изокоста или IMG_1131" autocomplete="off"></label>
      <label><span id="gallery-chapter-label">Тема</span><select id="gallery-chapter" aria-labelledby="gallery-chapter-label"><option value="all">Все темы</option>
        ${chapters.map(chapter => `<option value="${chapter}">${chapter}. ${chapterTitles[chapter]}</option>`).join('')}
      </select></label>
    </div>
    <p class="gallery-count" role="status"></p>
    ${chapters.map(chapter => `<section class="gallery-group" data-gallery-group="${chapter}">
      <h2><span>ТЕМА ${chapter}</span>${chapterTitles[chapter]}</h2>
      <div class="gallery-grid">${galleryEntries.filter(entry => entry.section.chapter === chapter).map(({ kind, section }) => {
        const source = graphSource(kind);
        return `<a class="graph-card" href="#graph/${kind}" data-card="${kind}">
          ${graphPreview(kind)}<span class="graph-card-text">
            <small>§ ${section.id} · с. ${section.page}${source ? ' · Слайды' : ''}</small>
            <strong>${graphs[kind].title}</strong>
            <span>${graphs[kind].caption}</span>
          </span><span class="graph-arrow" aria-hidden="true">↗</span>
        </a>`;
      }).join('')}</div>
    </section>`).join('')}
    <p class="gallery-empty" hidden>Подходящих графиков нет. Попробуй короткий запрос или выбери все темы.</p>
  </section>`;
}

function setupGraphGallery() {
  const input = main.querySelector('#gallery-search');
  const select = main.querySelector('#gallery-chapter');
  const cards = [...main.querySelectorAll('[data-card]')];
  const groups = [...main.querySelectorAll('[data-gallery-group]')];
  const count = main.querySelector('.gallery-count');
  const empty = main.querySelector('.gallery-empty');
  input.value = galleryState.query;
  select.value = galleryState.chapter;

  function filter() {
    galleryState.query = input.value;
    galleryState.chapter = select.value;
    const terms = normalized(input.value).split(' ').filter(Boolean);
    let visible = 0;
    for (const card of cards) {
      const { kind, topic, section } = graphByKind[card.dataset.card];
      const graph = graphs[kind];
      const text = normalized([graph.title, graph.caption, topic.title, topic.tag, section.title, graphSource(kind)].join(' '));
      const matchesChapter = select.value === 'all' || select.value === section.chapter;
      card.hidden = !matchesChapter || !terms.every(term => text.includes(term));
      if (!card.hidden) visible++;
    }
    for (const group of groups) group.hidden = !group.querySelector('[data-card]:not([hidden])');
    empty.hidden = visible !== 0;
    count.textContent = `Показано ${visible} из ${cards.length}`;
  }

  input.addEventListener('input', filter);
  select.addEventListener('change', filter);
  filter();
}

function graphPage(entry) {
  const { kind, topic, section } = entry;
  const chapterEntries = galleryEntries.filter(item => item.section.chapter === section.chapter);
  const i = chapterEntries.indexOf(entry);
  return `${crumbs('§ ' + section.id + ' · График', { title: 'Графики', href: '#graphs' })}
  <article class="collection graph-reader">
    <div class="eyebrow ink">ТЕМА ${section.chapter} <span class="divider"></span> § ${section.id} · С. ${section.page}</div>
    <h1>${graphs[kind].title}</h1>
    ${graphMarkup(kind, null)}
    <div class="graph-actions">
      <a class="button primary" href="#topic/${topic.id}">К теории <span aria-hidden="true">↗</span></a>
      <a class="button outline" href="#graphs">Все графики</a>
    </div>
    <nav class="graph-neighbors" aria-label="Графики этой темы">
      ${chapterEntries[i - 1] ? `<a href="#graph/${chapterEntries[i - 1].kind}"><small>← ПРЕДЫДУЩИЙ</small><strong>${graphs[chapterEntries[i - 1].kind].title}</strong></a>` : '<span></span>'}
      ${chapterEntries[i + 1] ? `<a href="#graph/${chapterEntries[i + 1].kind}"><small>СЛЕДУЮЩИЙ →</small><strong>${graphs[chapterEntries[i + 1].kind].title}</strong></a>` : ''}
    </nav>
  </article>`;
}

function home(showHero) {
  return `${showHero ? `<section class="hero">
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
  </section>` : ''}
  <section class="contents" id="table-of-contents" tabindex="-1" aria-labelledby="topic-heading">
    <div class="section-top"><div><div class="eyebrow ink">ПО УЧЕБНИКУ</div><h2 id="topic-heading">Оглавление</h2></div><span class="count">${sections.length} параграфов</span></div>
    <p class="contents-intro">Выбери тему, затем нужный параграф.</p>
    <nav class="contents-tools" aria-label="Указатели справочника">
      <a class="button" href="#formulas">Формулы <span aria-hidden="true">↗</span></a>
      <a class="button" href="#graphs">Графики <span aria-hidden="true">↗</span></a>
    </nav>
    <nav class="chapter-jumps" aria-label="Темы справочника">${Object.keys(chapterTitles).map(id => `<a href="#chapter/${id}" aria-label="Тема ${id}. ${chapterTitles[id]}">Тема ${id}</a>`).join('')}</nav>
    ${Object.entries(chapterTitles).map(([id, title]) => `<section class="chapter" id="chapter-${id}" tabindex="-1">
      <h3><span>ТЕМА ${id}</span>${title}</h3>${sectionList(sections.filter(section => section.chapter === id))}
    </section>`).join('')}
  </section>`;
}

function crumbs(label, parent) {
  return `<nav class="crumbs" aria-label="Путь к странице"><a href="#contents">Оглавление</a><span aria-hidden="true">/</span>${parent ? `<a href="${parent.href}">${parent.title}</a><span aria-hidden="true">/</span>` : ''}<span aria-current="page">${label}</span></nav>`;
}

function conceptMarkup(topic, showTitle) {
  const heading = showTitle ? 'h4' : 'h3';
  const links = topic.related.map(id => topicById[id]).filter(link => link.section !== topic.section);
  return `<section id="concept-${topic.id}" class="concept" tabindex="-1" aria-label="${topic.title}">
    ${showTitle ? `<h3>${topic.title}</h3>` : ''}
    ${topic.key ? `<div class="formula-group">${[topic.key, ...(topic.extraKeys ?? [])].map(formula).join('')}</div>` : ''}
    <p class="lead">${topic.plain}</p>
    <${heading} class="terms-title">${topic.key ? 'Обозначения' : 'Термины'}</${heading}>
    <dl class="symbol-list">${topic.symbols.map(([symbol, meaning]) => `<div><dt>${symbol}</dt><dd>${meaning}</dd></div>`).join('')}</dl>
    ${topic.note ? `<p class="note">${topic.note}</p>` : ''}
    ${graphKinds(topic).map(kind => graphMarkup(kind, heading)).join('')}
    ${links.length ? `<div class="concept-links"><span>Связано</span>${links.map(link => `<a href="#topic/${link.id}">§ ${link.section} · ${link.title}</a>`).join('')}</div>` : ''}
  </section>`;
}

function chapterPage(chapter) {
  const chapterSections = sections.filter(item => item.chapter === chapter);
  return `${crumbs('Тема ' + chapter)}
  <div class="reader-grid"><article class="reader">
    <div class="eyebrow ink">ТЕМА ${chapter}</div>
    <h1>${chapterTitles[chapter]}</h1>
    ${chapterSections.map(section => `<section class="reader-section" id="section-${section.id}" tabindex="-1" aria-labelledby="heading-${section.id}">
      <div class="eyebrow ink">§ ${section.id} <span class="divider"></span> С. ${section.page}</div>
      <h2 id="heading-${section.id}">${section.title}</h2>
      ${section.entries.length > 1 ? `<nav class="concept-jumps" aria-label="Понятия параграфа ${section.id}">${section.entries.map(topic => `<a href="#topic/${topic.id}">${topic.title}</a>`).join('')}</nav>` : ''}
      ${section.entries.map(topic => conceptMarkup(topic, section.entries.length > 1)).join('')}
    </section>`).join('')}
  </article><aside class="reader-aside">
    <h2>Подтемы главы</h2>${sectionList(chapterSections)}
  </aside></div>`;
}

function collection(type) {
  if (type === 'graphs') return graphGallery();
  const links = sections.flatMap(section => section.entries.filter(topic => topic.key));
  return `${crumbs('Формулы')}<section class="collection"><div class="eyebrow ink">УКАЗАТЕЛЬ ФОРМУЛ</div><h1>Формулы</h1>
    <p class="lead">Выбери формулу, чтобы открыть её в нужном параграфе.</p>
    <div class="formula-index">${links.map(topic => `<a href="#topic/${topic.id}"><span class="index-label">${topic.title} <small>§ ${topic.section} · с. ${topic.page}</small></span><div class="formula-group">${[topic.key, ...(topic.extraKeys ?? [])].map(formula).join('')}</div></a>`).join('')}</div></section>`;
}

function graphMarkup(kind, heading) {
  const graph = graphs[kind];
  const source = graphSource(kind);
  const legend = [...(graph.series ?? []), ...(graph.regions ?? [])];
  return `<figure id="graph-${kind}" tabindex="-1" class="study-chart" data-graph="${kind}">
    ${heading ? `<div class="chart-header"><${heading} class="chart-title">${graph.title}</${heading}>
      <a class="chart-open" href="#graph/${kind}" aria-label="Открыть крупно: ${graph.title}">Крупно <span aria-hidden="true">↗</span></a></div>` : ''}
    <svg viewBox="0 0 590 302" role="img" aria-label="${graph.title}"></svg>
    ${kind === 'budget' ? `<div class="controls">${[
      ['income', 'Доход I', 60, 180, 120, 10],
      ['px', 'Цена Pₓ', 2, 6, 3, 1],
      ['py', 'Цена Pᵧ', 1, 6, 1, 1]
    ].map(([id, label, min, max, value, step]) => `<label><span>${label}<output for="${id}">${value}</output></span><input id="${id}" type="range" min="${min}" max="${max}" value="${value}" step="${step}"></label>`).join('')}</div>
    <p class="chart-status" aria-live="polite"></p><button class="reset" type="button">Сбросить значения</button>` : ''}
    ${legend.some(item => item.label) ? `<ul class="chart-legend" aria-label="Условные обозначения">${legend.map((item, i) => {
      if (!item.label) return '';
      const swatch = `<span class="legend-${item.style}"></span>${item.label}`;
      return `<li>${graph.toggleSeries && i < graph.series.length ? `<button type="button" aria-pressed="true" data-curve="${i}">${swatch}</button>` : swatch}</li>`;
    }).join('')}</ul>` : ''}
    <figcaption>${graph.caption}${source ? `<small class="chart-source">Слайды: ${source}</small>` : ''}</figcaption>
  </figure>`;
}

function setupGraph(figure) {
  const kind = figure.dataset.graph;
  const graph = graphs[kind];
  const [maxX, maxY] = graph.max;
  const [minX, minY] = graph.min ?? [0, 0];
  const svg = figure.querySelector('svg');
  const inputs = [...figure.querySelectorAll('input')];
  const hiddenCurves = new Set();
  let renderedWidth = 0;

  function draw() {
    renderedWidth = svg.clientWidth;
    const width = Math.max(240, renderedWidth);
    const height = width < 400 ? 248 : 320;
    const left = width < 400 ? 39 : 53;
    const right = width - 16, top = 29, bottom = height - 46;
    const sx = x => left + (right - left) * (x - minX) / (maxX - minX);
    const sy = y => bottom - (bottom - top) * (y - minY) / (maxY - minY);
    const pos = ([x, y]) => `${sx(x).toFixed(2)},${sy(y).toFixed(2)}`;
    const line = (points, cls) => `<polyline class="${cls}" points="${points.map(pos).join(' ')}"/>`;
    const dot = ([x, y]) => `<circle class="chart-dot" cx="${sx(x)}" cy="${sy(y)}" r="4"/>`;
    const ticks = (min, max, step = (max - min) / 5) =>
      Array.from({ length: Math.floor((max - min) / step + 1e-8) + 1 }, (_, i) => min + i * step);
    const xTicks = ticks(minX, maxX, graph.step?.[0]);
    const zeroY = sy(Math.max(0, minY));
    const axes = [
      ...xTicks.map((x, i) => `<path class="grid-line" d="M${sx(x)} ${top}V${bottom}"/>${width >= 400 || xTicks.length <= 7 || i % 2 === 0 ? `<text text-anchor="middle" x="${sx(x)}" y="${bottom + 17}">${number.format(x)}</text>` : ''}`),
      ...ticks(minY, maxY, graph.step?.[1]).filter(y => y !== 0).map(y => `<path class="grid-line" d="M${left} ${sy(y)}H${right}"/><text text-anchor="end" x="${left - 7}" y="${sy(y) + 4}">${number.format(y)}</text>`),
      `<path class="axis" d="M${left} ${top}V${bottom} M${left} ${zeroY}H${right}"/><text class="axis-label" x="${left}" y="15">${graph.y}</text><text class="axis-label" text-anchor="end" x="${right}" y="${height - 7}">${graph.x}</text>`
    ].join('');

    let marks;
    if (kind === 'budget') {
      const [income, px, py] = inputs.map(input => Number(input.value));
      inputs.forEach(input => { input.parentElement.querySelector('output').value = number.format(input.value); });
      const points = [[0, income / py], [income / px, 0]];
      marks = `<polygon class="budget-area" points="${[[0, 0], ...points].map(pos).join(' ')}"/>`;
      marks += line([[0, 120], [40, 0]], 'reference-line') + line(points, 'curve') + points.map(dot).join('');
      figure.querySelector('.chart-status').textContent = `Пересечения с осями · X: ${number.format(income / px)} · Y: ${number.format(income / py)}`;
    } else if (graph.series) {
      marks = (graph.regions ?? []).map(region =>
        `<polygon class="${region.style}" points="${region.points.map(pos).join(' ')}"/>`).join('');
      marks += graph.series.map((series, i) => hiddenCurves.has(i) ? '' : line(series.points, series.style)).join('');
      marks += (graph.labels ?? []).filter(label => !label.requires?.some(i => hiddenCurves.has(i)))
        .map(({ at, label, dx, dy, anchor }) => {
          const nearRight = sx(at[0]) + label.length * 7 > right;
          const x = sx(at[0]) + (dx ?? (nearRight ? -7 : 7));
          const y = sy(at[1]) + (dy ?? -8);
          return dot(at) + `<text class="point-label" x="${x}" y="${y}" text-anchor="${anchor ?? (nearRight ? 'end' : 'start')}">${label}</text>`;
        }).join('');
    } else {
      marks = line(graph.points, 'curve') + graph.points.map(dot).join('');
    }
    svg.setAttribute('viewBox', `0 0 ${width} ${height}`);
    svg.innerHTML = axes + marks;
  }

  inputs.forEach(input => input.addEventListener('input', draw));
  figure.querySelector('.reset')?.addEventListener('click', () => {
    inputs.forEach(input => { input.value = input.defaultValue; });
    draw();
  });
  for (const button of figure.querySelectorAll('[data-curve]')) {
    button.addEventListener('click', () => {
      const i = Number(button.dataset.curve);
      if (!hiddenCurves.delete(i)) hiddenCurves.add(i);
      button.setAttribute('aria-pressed', String(!hiddenCurves.has(i)));
      draw();
    });
  }
  draw();
  const observer = new ResizeObserver(() => { if (svg.clientWidth !== renderedWidth) draw(); });
  observer.observe(svg);
  chartObservers.push(observer);
}

function render(moveFocus = false) {
  const [route, id, target] = location.hash.slice(1).split('/');
  const topic = route === 'topic' && Object.hasOwn(topicById, id) ? topicById[id] : null;
  const sectionId = topic?.section ?? (route === 'section' ? id : null);
  const section = Object.hasOwn(sectionById, sectionId) ? sectionById[sectionId] : null;
  const index = route === 'graphs' || route === 'formulas' ? route : null;
  const graph = route === 'graph' && Object.hasOwn(graphByKind, id) ? graphByKind[id] : null;
  const contentsView = route === 'contents' || route === 'chapter';
  const view = section ? 'reader-' + section.chapter : graph ? 'graph-' + id : index ?? (contentsView ? 'contents' : 'home');

  if (main.dataset.view !== view) {
    chartObservers.forEach(observer => observer.disconnect());
    chartObservers = [];
    main.dataset.view = view;
    main.innerHTML = section ? chapterPage(section.chapter) : graph ? graphPage(graph) : index ? collection(index) : home(!contentsView);
    main.querySelectorAll('[data-graph]').forEach(setupGraph);
    if (index === 'graphs') setupGraphGallery();
  }

  document.title = `${(graph ? graphs[graph.kind].title : section?.title) ?? (index === 'graphs' ? 'Графики' : index === 'formulas' ? 'Формулы' : 'Учебный справочник')} · Микроэкономика`;

  let anchor;
  if (topic) {
    const topicGraph = topic.graph ?? graphKinds(topic)[0];
    anchor = target === 'graph' && topicGraph ? 'graph-' + topicGraph : 'concept-' + topic.id;
  }
  else if (section) anchor = 'section-' + section.id;
  else if (route === 'chapter' && Object.hasOwn(chapterTitles, id)) anchor = 'chapter-' + id;

  main.querySelectorAll('.reader-aside .section-list a').forEach(link => {
    if (link.hash === '#section/' + section?.id) link.setAttribute('aria-current', 'location');
    else link.removeAttribute('aria-current');
  });

  const activeNav = graph || index === 'graphs' ? '#graphs' : index === 'formulas' ? '#formulas' : '#contents';
  document.querySelectorAll('.primary-nav a').forEach(link => {
    if (link.hash === activeNav) link.setAttribute('aria-current', 'page');
    else link.removeAttribute('aria-current');
  });

  const destination = anchor ? document.getElementById(anchor) : null;
  if (destination) {
    destination.focus({ preventScroll: true });
    destination.scrollIntoView();
  } else if (moveFocus || route === 'contents') {
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
  ...galleryEntries.map(({ kind, topic }) => ({
    href: '#graph/' + kind, title: graphs[kind].title, label: 'График · § ' + topic.section,
    keywords: normalized(['график', graphs[kind].title, topic.tag, graphSource(kind)].join(' '))
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
  const href = event.target.closest('a')?.getAttribute('href');
  if (href?.startsWith('#') && href === location.hash && !event.metaKey && !event.ctrlKey && !event.altKey && !event.shiftKey) {
    event.preventDefault();
    render(true);
  }
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
function setupPullRefresh() {
  const status = document.querySelector('.refresh-status');
  const threshold = 72;
  const atTop = () => (document.scrollingElement?.scrollTop ?? window.scrollY) <= 1;
  let gesture = null;
  let reloading = false;

  function show(message) {
    status.dataset.active = String(Boolean(message));
    if (status.textContent !== message) status.textContent = message;
  }

  function reset() {
    gesture = null;
    if (!reloading) show('');
  }

  // Register before the first touch so the browser can let us cancel panning.
  document.addEventListener('touchmove', event => {
    if (!gesture) return;
    if (event.touches.length !== 1 || !atTop()) {
      reset();
      return;
    }
    const touch = event.touches[0];
    const dx = Math.abs(touch.clientX - gesture.x);
    const dy = touch.clientY - gesture.y;
    if (dy < -3 || dx > Math.max(8, dy)) {
      reset();
      return;
    }
    if (dy <= 0) {
      show('');
      return;
    }

    if (event.cancelable) event.preventDefault();
    gesture.pulling = true;
    show(dy < 16 ? '' : dy >= threshold ? 'Отпусти для обновления' : 'Потяни для обновления');
  }, { passive: false, capture: true });

  document.addEventListener('touchstart', event => {
    reset();
    if (reloading || event.touches.length !== 1 || !atTop() ||
        event.target.closest?.('input, textarea, select, button, [contenteditable], .search-results, .primary-nav')) return;
    const touch = event.touches[0];
    gesture = { x: touch.clientX, y: touch.clientY, pulling: false };
  }, { passive: true });

  document.addEventListener('touchend', event => {
    const touch = event.changedTouches[0];
    if (!gesture?.pulling || !atTop() || !touch ||
        touch.clientY - gesture.y < threshold ||
        Math.abs(touch.clientX - gesture.x) > touch.clientY - gesture.y) {
      reset();
      return;
    }
    reloading = true;
    reset();
    show('Обновляю страницу…');
    location.reload();
  }, { passive: true });
  document.addEventListener('touchcancel', reset, { passive: true });
}

window.addEventListener('hashchange', () => render(true));
render();
setupPullRefresh();
