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
const formulaState = { query: '', chapter: 'all' };
const formulaEntries = [];
const seenFormulas = new Set();
for (const section of sections) {
  for (const topic of section.entries) {
    for (const key of [topic.key, ...(topic.extraKeys ?? [])].filter(Boolean)) {
      if (seenFormulas.has(key)) continue;
      seenFormulas.add(key);
      formulaEntries.push({ key, topic, section });
    }
  }
}
let chartObservers = [];

function escapeHTML(value) {
  return String(value).replaceAll('&', '&amp;').replaceAll('<', '&lt;').replaceAll('>', '&gt;').replaceAll('"', '&quot;');
}

function icon(name) {
  const paths = {
    book: '<path d="M4 4h6a2 2 0 0 1 2 2v15a3 3 0 0 0-3-2H4V4Zm16 0h-6a2 2 0 0 0-2 2v15a3 3 0 0 1 3-2h5V4Z"/>',
    formula: '<path d="M16 4h-3a3 3 0 0 0-3 3l-2 10a3 3 0 0 1-3 3H4m3-10h9"/>',
    graph: '<path d="M4 4v16h16M7 15l4-5 4 3 5-7"/>',
    arrow: '<path d="M5 12h14m-6-6 6 6-6 6"/>',
    chevron: '<path d="m8 10 4 4 4-4"/>',
    close: '<path d="m6 6 12 12M6 18 18 6"/>'
  };
  return `<svg class="ui-icon" viewBox="0 0 24 24" aria-hidden="true" focusable="false">${paths[name]}</svg>`;
}

function formula(key, topicId) {
  return `<div class="formula" data-formula="${key}"${topicId ? ` id="formula-${topicId}-${key}" tabindex="-1"` : ''}>${formulas[key]}</div>`;
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
    <div class="index-toolbar"><p class="gallery-count" role="status"></p><button class="clear-filters" type="button" hidden>Сбросить фильтры</button></div>
    ${chapters.map(chapter => `<section class="gallery-group" data-gallery-group="${chapter}">
      <h2><span>ТЕМА ${chapter}</span>${chapterTitles[chapter]}</h2>
      <div class="gallery-grid">${galleryEntries.filter(entry => entry.section.chapter === chapter).map(({ kind, section }) => {
        const source = graphSource(kind);
        return `<a class="graph-card" href="#graph/${kind}" data-card="${kind}">
          ${graphPreview(kind)}<span class="graph-card-text">
            <small>§ ${section.id} · с. ${section.page}${source ? ' · Слайды' : ''}</small>
            <strong>${graphs[kind].title}</strong>
            <span>${graphs[kind].caption}</span>
          </span><span class="graph-arrow" aria-hidden="true">${icon('arrow')}</span>
        </a>`;
      }).join('')}</div>
    </section>`).join('')}
    <div class="gallery-empty empty-state" hidden><h2>Графики не найдены</h2><p>Сократи запрос или сбрось фильтры, чтобы увидеть все графики.</p><button type="button" class="button outline" data-reset-index>Показать все графики</button></div>
  </section>`;
}

function setupIndex(type) {
  const isGraph = type === 'graphs';
  const state = isGraph ? galleryState : formulaState;
  const input = main.querySelector(isGraph ? '#gallery-search' : '#formula-search');
  const select = main.querySelector(isGraph ? '#gallery-chapter' : '#formula-chapter');
  const cards = [...main.querySelectorAll(isGraph ? '[data-card]' : '[data-formula-card]')];
  const groups = [...main.querySelectorAll(isGraph ? '[data-gallery-group]' : '[data-formula-group]')];
  const count = main.querySelector('[role="status"]');
  const empty = main.querySelector('.empty-state');
  const resetButton = main.querySelector('.clear-filters');
  const entries = isGraph ? graphByKind : Object.fromEntries(formulaEntries.map(entry => [entry.key, entry]));
  const searchable = new Map(cards.map(card => {
    const entry = entries[isGraph ? card.dataset.card : card.dataset.formulaCard];
    const { topic, section } = entry;
    const text = isGraph ? [graphs[entry.kind].title, graphs[entry.kind].caption, graphSource(entry.kind)] :
      [formulaNames[entry.key], formulaText(entry.key)];
    return [card, { chapter: section.chapter, text: normalized([...text, topic.title, topic.tag, section.title, topic.symbols.flat().join(' ')].join(' ')) }];
  }));
  input.value = state.query;
  select.value = state.chapter;

  function filter() {
    state.query = input.value;
    state.chapter = select.value;
    const terms = normalized(input.value).split(' ').filter(Boolean);
    let visible = 0;
    for (const card of cards) {
      const { chapter, text } = searchable.get(card);
      const matchesChapter = select.value === 'all' || select.value === chapter;
      card.hidden = !matchesChapter || !terms.every(term => text.includes(term));
      if (!card.hidden) visible++;
    }
    for (const group of groups) group.hidden = !group.querySelector(isGraph ? '[data-card]:not([hidden])' : '[data-formula-card]:not([hidden])');
    empty.hidden = visible !== 0;
    count.textContent = `Показано ${visible} из ${cards.length}`;
    resetButton.hidden = !input.value && select.value === 'all';
  }

  for (const button of main.querySelectorAll('.clear-filters, [data-reset-index]')) {
    button.addEventListener('click', () => {
      input.value = '';
      select.value = 'all';
      filter();
      input.focus();
    });
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
    <p class="graph-meta">${chapterTitles[section.chapter]} · График ${i + 1} из ${chapterEntries.length}</p>
    <h1>${graphs[kind].title}</h1>
    ${graphMarkup(kind, null)}
    <div class="graph-actions">
      <a class="button primary" href="#topic/${topic.id}">К теории <span aria-hidden="true">↗</span></a>
      <a class="button outline" href="#graphs" data-restore-index>К списку графиков</a>
    </div>
    <nav class="graph-neighbors" aria-label="Графики этой темы">
      ${chapterEntries[i - 1] ? `<a href="#graph/${chapterEntries[i - 1].kind}"><small>← ПРЕДЫДУЩИЙ</small><strong>${graphs[chapterEntries[i - 1].kind].title}</strong></a>` : '<span></span>'}
      ${chapterEntries[i + 1] ? `<a href="#graph/${chapterEntries[i + 1].kind}"><small>СЛЕДУЮЩИЙ →</small><strong>${graphs[chapterEntries[i + 1].kind].title}</strong></a>` : ''}
    </nav>
  </article>`;
}

function home(showIntro) {
  const heading = showIntro ? 'h2' : 'h1';
  return `${showIntro ? `<section class="home-intro">
    <div class="eyebrow ink">УЧЕБНЫЙ СПРАВОЧНИК</div>
    <h1>Микроэкономика</h1>
    <p class="lead">Понятия, формулы и графики с объяснениями простыми словами.</p>
    <div class="home-shortcuts">
      ${[
        ['book', '#contents', 'Разобраться в теме', `${sections.length} параграфов по учебнику`],
        ['formula', '#formulas', 'Найти формулу', `${formulaEntries.length} формулы с обозначениями`],
        ['graph', '#graphs', 'Посмотреть график', `${galleryEntries.length} схем с пояснениями`]
      ].map(([name, href, title, text]) => `<a class="shortcut" href="${href}"><span class="shortcut-icon">${icon(name)}</span><span><strong>${title}</strong><small>${text}</small></span>${icon('arrow')}</a>`).join('')}
    </div>
  </section>` : ''}
  <section class="contents" id="table-of-contents" tabindex="-1" aria-labelledby="topic-heading">
    <div class="contents-header"><div class="contents-heading"><div class="eyebrow ink">ПО УЧЕБНИКУ</div><${heading} id="topic-heading">Оглавление</${heading}></div><span class="count">${Object.keys(chapterTitles).length} тем · ${sections.length} параграфов</span></div>
    <p class="contents-intro">Открой параграф, чтобы прочитать определения, формулы и пояснения к графикам.</p>
    ${!showIntro ? `<nav class="contents-tools" aria-label="Указатели справочника"><a class="button outline" href="#formulas">${icon('formula')}Формулы</a><a class="button outline" href="#graphs">${icon('graph')}Графики</a></nav>` : ''}
    <label class="chapter-selector">Перейти к теме<select id="chapter-select"><option value="">Выбрать тему</option>${Object.entries(chapterTitles).map(([id,title])=>`<option value="${id}">${id}. ${title}</option>`).join('')}</select></label>
    ${Object.entries(chapterTitles).map(([id, title]) => `<section class="chapter" id="chapter-${id}" tabindex="-1" aria-labelledby="chapter-title-${id}">
      <h${showIntro ? '3' : '2'} id="chapter-title-${id}"><span>ТЕМА ${id}</span>${title}</h${showIntro ? '3' : '2'}>${sectionList(sections.filter(section => section.chapter === id))}
    </section>`).join('')}
  </section>`;
}

function crumbs(label, parent) {
  return `<nav class="crumbs" aria-label="Путь к странице"><a href="#contents">Оглавление</a><span aria-hidden="true">/</span>${parent ? `<a href="${parent.href}">${parent.title}</a><span aria-hidden="true">/</span>` : ''}<span aria-current="page">${label}</span></nav>`;
}

function conceptMarkup(topic, showTitle) {
  const heading = showTitle ? 'h4' : 'h3';
  const links = topic.related.map(id => topicById[id]).filter(link => link.section !== topic.section);
  const kinds = graphKinds(topic);
  const primaryGraph = topic.graph ?? kinds[0];
  const otherGraphs = kinds.filter(kind => kind !== primaryGraph);
  return `<section id="concept-${topic.id}" class="concept" tabindex="-1" aria-label="${topic.title}">
    ${showTitle ? `<h3>${topic.title}</h3>` : ''}
    ${topic.key ? `<div class="formula-group">${[topic.key, ...(topic.extraKeys ?? [])].map(key => formula(key, topic.id)).join('')}</div>` : ''}
    <p class="lead">${topic.plain}</p>
    <${heading} class="terms-title">${topic.key ? 'Обозначения' : 'Термины'}</${heading}>
    <dl class="symbol-list">${topic.symbols.map(([symbol, meaning]) => `<div><dt>${symbol}</dt><dd>${meaning}</dd></div>`).join('')}</dl>
    ${topic.note ? `<p class="note">${topic.note}</p>` : ''}
    ${primaryGraph ? graphMarkup(primaryGraph, heading) : ''}
    ${otherGraphs.length ? `<details class="related-graphs"><summary>Все графики по этому понятию <span class="count">${kinds.length}</span>${icon('chevron')}</summary><div class="related-graph-list">${kinds.map(kind => `<a class="related-graph-card" href="#graph/${kind}">${icon('graph')}<span><strong>${graphs[kind].title}</strong><small>${graphs[kind].caption}</small></span>${icon('arrow')}</a>`).join('')}</div></details>` : ''}
    ${links.length ? `<div class="concept-links"><span>Связано</span>${links.map(link => `<a href="#topic/${link.id}">§ ${link.section} · ${link.title}</a>`).join('')}</div>` : ''}
  </section>`;
}

function chapterPage(chapter) {
  const chapterSections = sections.filter(item => item.chapter === chapter);
  return `${crumbs('Тема ' + chapter)}
  <div class="reader-grid"><article class="reader">
    <div class="eyebrow ink">ТЕМА ${chapter}</div>
    <h1>${chapterTitles[chapter]}</h1>
    <details class="chapter-picker"><summary>${icon('book')}<span>Параграфы темы<small class="current-section" data-current-section></small></span>${icon('chevron')}</summary><nav data-reader-nav aria-label="Параграфы текущей темы">${sectionList(chapterSections)}</nav></details>
    ${chapterSections.map(section => `<section class="reader-section" id="section-${section.id}" tabindex="-1" aria-labelledby="heading-${section.id}">
      <div class="eyebrow ink">§ ${section.id} <span class="divider"></span> С. ${section.page}</div>
      <h2 id="heading-${section.id}">${section.title}</h2>
      ${section.entries.length > 1 ? `<nav class="concept-jumps" aria-label="Понятия параграфа ${section.id}">${section.entries.map(topic => `<a href="#topic/${topic.id}">${topic.title}</a>`).join('')}</nav>` : ''}
      ${section.entries.map(topic => conceptMarkup(topic, section.entries.length > 1)).join('')}
      ${sectionNeighbors(section)}
    </section>`).join('')}
  </article><aside class="reader-aside">
    <nav data-reader-nav aria-label="Параграфы текущей темы"><h2>В этой теме</h2>${sectionList(chapterSections)}</nav>
    <a class="button outline" href="#contents">${icon('book')}Все темы</a>
  </aside></div>`;
}

function sectionNeighbors(section) {
  const index = sections.indexOf(section);
  return `<nav class="section-neighbors" aria-label="Соседние параграфы">${[
    [sections[index - 1], 'Предыдущий параграф', '←'],
    [sections[index + 1], 'Следующий параграф', '→']
  ].map(([item, label, arrow]) => item ? `<a href="#section/${item.id}"><small>${label} ${arrow}</small><strong>§ ${item.id} · ${item.title}</strong></a>` : '<span></span>').join('')}</nav>`;
}

function collection(type) {
  if (type === 'graphs') return graphGallery();
  const chapters = [...new Set(formulaEntries.map(entry => entry.section.chapter))];
  return `${crumbs('Формулы')}<section class="collection formula-collection"><div class="eyebrow ink">УКАЗАТЕЛЬ ФОРМУЛ</div><h1>Формулы</h1>
    <p class="lead">Найди формулу и открой её, чтобы посмотреть обозначения и условия применения.</p>
    <div class="index-controls"><label>Найти формулу<input id="formula-search" type="search" placeholder="Например, MU, издержки или эластичность" autocomplete="off"></label>
      <label><span id="formula-chapter-label">Тема</span><select id="formula-chapter" aria-labelledby="formula-chapter-label"><option value="all">Все темы</option>${chapters.map(chapter => `<option value="${chapter}">${chapter}. ${chapterTitles[chapter]}</option>`).join('')}</select></label>
    </div>
    <div class="index-toolbar"><p role="status"></p><button class="clear-filters" type="button" hidden>Сбросить фильтры</button></div>
    ${chapters.map(chapter => `<section class="formula-chapter" data-formula-group="${chapter}"><h2><span>ТЕМА ${chapter}</span>${chapterTitles[chapter]}</h2><div class="formula-index">${formulaEntries.filter(entry => entry.section.chapter === chapter).map(({key, topic}) => `<a class="formula-card" data-formula-card="${key}" href="#topic/${topic.id}/formula-${key}"><span class="index-label">${formulaNames[key]}<small>§ ${topic.section} · ${topic.title}</small></span>${formula(key)}${icon('arrow')}</a>`).join('')}</div></section>`).join('')}
    <div class="empty-state" hidden><h2>Формулы не найдены</h2><p>Попробуй название понятия или обозначение. Например, MU или AVC.</p><button class="button outline" type="button" data-reset-index>Показать все формулы</button></div>
    </section>`;
}

function graphMarkup(kind, heading) {
  const graph = graphs[kind];
  const source = graphSource(kind);
  const legend = kind === 'budget' ? [
    { style: 'reference-line', label: 'Исходная линия' },
    { style: 'curve', label: 'Текущая линия' },
    { style: 'area-peach', label: 'Доступные наборы' }
  ] : [...(graph.series ?? []), ...(graph.regions ?? [])];
  return `<figure id="graph-${kind}" tabindex="-1" class="study-chart" data-graph="${kind}">
    ${heading ? `<div class="chart-header"><${heading} class="chart-title">${graph.title}</${heading}>
      <a class="chart-open" href="#graph/${kind}" aria-label="Открыть крупно: ${graph.title}">Крупно <span aria-hidden="true">↗</span></a></div>` : ''}
    <svg viewBox="0 0 590 320" role="img" aria-label="${graph.title}" aria-describedby="caption-${kind} axes-${kind}"></svg>
    <span class="sr" id="axes-${kind}">По горизонтали — ${graph.x}. По вертикали — ${graph.y}.</span>
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
    <figcaption id="caption-${kind}">${graph.caption}${source ? `<small class="chart-source">Фото слайда · ${source}</small>` : ''}</figcaption>
  </figure>`;
}

function setupGraph(figure) {
  if (figure.dataset.ready) return;
  figure.dataset.ready = 'true';
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
    svg.style.aspectRatio = `${width} / ${height}`;
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

function setupCharts() {
  const figures = [...main.querySelectorAll('[data-graph]')];
  const observer = new IntersectionObserver(entries => {
    for (const entry of entries) {
      if (!entry.isIntersecting) continue;
      observer.unobserve(entry.target);
      setupGraph(entry.target);
    }
  }, { rootMargin: '400px' });
  figures.forEach(figure => observer.observe(figure));
  chartObservers.push(observer);
}

function updateFormulaOverflow() {
  for (const element of main.querySelectorAll('.concept .formula')) {
    const overflow = element.scrollWidth > element.clientWidth + 1;
    element.tabIndex = overflow ? 0 : -1;
    if (overflow) {
      element.setAttribute('role', 'region');
      element.setAttribute('aria-label', formulaNames[element.dataset.formula] + '. Прокрутка стрелками влево и вправо.');
    } else {
      element.removeAttribute('role');
      element.removeAttribute('aria-label');
    }
  }
}

function notFound() {
  return `${crumbs('Страница не найдена')}<section class="collection not-found"><div class="eyebrow ink">НЕ УДАЛОСЬ ОТКРЫТЬ МАТЕРИАЛ</div><h1>Страница не найдена</h1><p class="lead">Возможно, ссылка изменилась. Найди материал в справочнике или открой нужный раздел.</p><div class="graph-actions"><a class="button primary" href="#contents">К оглавлению</a><a class="button outline" href="#formulas">Формулы</a><a class="button outline" href="#graphs">Графики</a></div></section>`;
}

function decodeQuery(value) {
  try { return decodeURIComponent(value ?? ''); }
  catch { return ''; }
}

function render({ moveFocus = false, restore = null } = {}) {
  const [route, id, target] = location.hash.slice(1).split('/');
  const topic = route === 'topic' && Object.hasOwn(topicById, id) ? topicById[id] : null;
  const sectionId = topic?.section ?? (route === 'section' ? id : null);
  const section = Object.hasOwn(sectionById, sectionId) ? sectionById[sectionId] : null;
  const index = route === 'graphs' || route === 'formulas' ? route : null;
  const graph = route === 'graph' && Object.hasOwn(graphByKind, id) ? graphByKind[id] : null;
  const contentsView = route === 'contents' || (route === 'chapter' && Object.hasOwn(chapterTitles, id));
  const homeView = (!route || route === 'home') && !id;
  const query = route === 'search' ? decodeQuery(id) : null;
  const valid = section || graph || index || contentsView || homeView || query;
  const view = !valid ? 'not-found' : section ? 'reader-' + section.chapter : graph ? 'graph-' + id : index ?? (contentsView ? 'contents' : query ? 'search-' + query : 'home');

  if (main.dataset.view !== view) {
    chartObservers.forEach(observer => observer.disconnect());
    chartObservers = [];
    main.dataset.view = view;
    main.innerHTML = !valid ? notFound() : section ? chapterPage(section.chapter) : graph ? graphPage(graph) : index ? collection(index) : query ? searchPage(query) : home(!contentsView);
    setupCharts();
    if (index) setupIndex(index);
    main.querySelector('#chapter-select')?.addEventListener('change', event => {
      const chapter = event.target.value;
      event.target.value = '';
      if (chapter) navigate('#chapter/' + chapter);
    });
    main.querySelector('[data-refine-search]')?.addEventListener('click', () => {
      searchInput.focus();
      searchInput.select();
    });
  }

  if (query !== null) searchInput.value = query;
  document.querySelector('#clear-search').hidden = !searchInput.value;
  document.title = `${!valid ? 'Страница не найдена' : (graph ? graphs[graph.kind].title : topic?.title ?? section?.title) ?? (index === 'graphs' ? 'Графики' : index === 'formulas' ? 'Формулы' : query ? 'Поиск' : contentsView ? 'Оглавление' : 'Учебный справочник')} · Микроэкономика`;

  let anchor;
  if (topic) {
    const topicGraph = topic.graph ?? graphKinds(topic)[0];
    if (target?.startsWith('formula-') && [topic.key, ...(topic.extraKeys ?? [])].includes(target.slice(8))) anchor = 'formula-' + topic.id + '-' + target.slice(8);
    else anchor = target === 'graph' && topicGraph ? 'graph-' + topicGraph : 'concept-' + topic.id;
  } else if (section) anchor = 'section-' + section.id;
  else if (route === 'chapter' && Object.hasOwn(chapterTitles, id)) anchor = 'chapter-' + id;

  main.querySelectorAll('.chapter-picker').forEach(picker => { picker.open = false; });
  const activeNav = graph || index === 'graphs' ? '#graphs' : index === 'formulas' ? '#formulas' : '#contents';
  document.querySelectorAll('.primary-nav a').forEach(link => {
    if (valid && !query && link.hash === activeNav) link.setAttribute('aria-current', 'page');
    else link.removeAttribute('aria-current');
  });

  const expectedHash = location.hash;
  requestAnimationFrame(() => {
    if (location.hash !== expectedHash) return;
    updateFormulaOverflow();
    if (restore) {
      const focus = restore.focusId ? document.getElementById(restore.focusId) :
        [...main.querySelectorAll('a')].find(link => link.getAttribute('href') === restore.focusHref);
      if (focus && !focus.closest('[hidden]')) {
        let details = focus.closest('details');
        while (details) {
          details.open = true;
          details = details.parentElement.closest('details');
        }
        focus.focus({ preventScroll: true });
      } else main.focus({ preventScroll: true });
      window.scrollTo(0, restore.y);
    } else {
      const destination = anchor ? document.getElementById(anchor) : null;
      if (destination) {
        destination.focus({ preventScroll: true });
        destination.scrollIntoView({ block: 'start' });
      } else if (moveFocus || contentsView) {
        main.focus({ preventScroll: true });
        window.scrollTo(0, 0);
      }
    }
    updateReadingPosition();
  });
}

function normalized(value) {
  return value.normalize('NFKC').toLowerCase().replaceAll('ё', 'е').replaceAll('№', ' ').replaceAll(/[^\p{L}\p{N}∂]+/gu, ' ').trim();
}

function formulaText(key) {
  return formulas[key].replaceAll(/<[^>]*>/g, ' ').replaceAll(/&[^;]+;/g, ' ');
}

const searchItems = [
  ...sections.flatMap(section => section.entries.map(topic => ({
    href: '#topic/' + topic.id, title: topic.title, label: 'Понятие · § ' + topic.section + ' · с. ' + topic.page,
    description: topic.summary,
    aliases: [topic.tag, topic.symbols.map(item => item[0]).join(' ')].join(' '),
    text: [topic.title, section.title, topic.tag, topic.summary, topic.plain, topic.note, topic.section, topic.symbols.flat().join(' ')].join(' ')
  }))),
  ...formulaEntries.map(({ key, topic }) => ({
    href: '#topic/' + topic.id + '/formula-' + key, title: formulaNames[key], label: 'Формула · § ' + topic.section + ' · с. ' + topic.page,
    description: topic.title,
    aliases: formulaText(key),
    text: ['формула', formulaNames[key], formulaText(key), topic.title, topic.tag, topic.symbols.flat().join(' ')].join(' ')
  })),
  ...galleryEntries.map(({ kind, topic }) => ({
    href: '#graph/' + kind, title: graphs[kind].title, label: 'График · § ' + topic.section,
    description: graphs[kind].caption,
    aliases: graphSource(kind),
    text: ['график', graphs[kind].title, graphs[kind].caption, topic.title, topic.tag, graphSource(kind)].join(' ')
  }))
].map(item => ({ ...item, titleWords: normalized(item.title), aliasWords: normalized(item.aliases), keywords: normalized(item.text) }));

function findMaterials(query) {
  const value = normalized(query);
  if (!value) return [];
  const terms = value.split(' ');
  return searchItems.filter(item => terms.every(term => item.keywords.includes(term))).map(item => ({
    ...item,
    score: (item.titleWords === value ? 1000 : item.titleWords.startsWith(value) ? 500 : item.titleWords.includes(value) ? 250 : 0) +
      (item.aliasWords.split(' ').includes(value) ? 350 : 0) + terms.filter(term => item.titleWords.includes(term)).length * 20
  })).sort((a,b) => b.score - a.score);
}

function searchPage(query) {
  const results = findMaterials(query);
  return `${crumbs('Поиск')}<section class="collection search-page"><div class="eyebrow ink">ПО ВСЕМУ СПРАВОЧНИКУ</div><h1>Результаты поиска</h1><p class="lead">«${escapeHTML(query)}» · Найдено ${results.length}</p>${results.length ? `<div class="search-page-results">${results.map(item => `<a href="${item.href}"><small>${item.label}</small><strong>${item.title}</strong><span>${item.description}</span>${icon('arrow')}</a>`).join('')}</div>` : `<div class="empty-state"><h2>Материалы не найдены</h2><p>Попробуй более короткий запрос, название понятия или обозначение. Например, «издержки» или «MU».</p><button type="button" class="button primary" data-refine-search>Изменить запрос</button><a class="button outline" href="#contents">Открыть оглавление</a></div>`}</section>`;
}

let matches = [];
let searchSelection = -1;

function hideSearch() {
  searchResults.hidden = true;
  searchResults.querySelectorAll('[aria-selected="true"]').forEach(option => option.setAttribute('aria-selected', 'false'));
  searchInput.setAttribute('aria-expanded', 'false');
  searchInput.removeAttribute('aria-activedescendant');
  searchSelection = -1;
  searchStatus.textContent = '';
}

function showSearch() {
  document.querySelector('#clear-search').hidden = !searchInput.value;
  const query = searchInput.value.trim();
  if (!normalized(query)) {
    matches = [];
    hideSearch();
    return;
  }
  matches = findMaterials(query);
  searchSelection = -1;
  searchInput.removeAttribute('aria-activedescendant');
  const suggestions = matches.slice(0, 6);
  const searchHref = '#search/' + encodeURIComponent(query);
  searchResults.innerHTML = `<div class="search-results-header">${matches.length ? `Найдено ${matches.length} · Выбери материал` : 'Ничего не найдено'}</div><div id="search-options" role="listbox" aria-label="Найденные материалы">${suggestions.map((item,i) => `<a id="search-option-${i}" role="option" aria-selected="false" tabindex="-1" href="${item.href}"><strong>${item.title}</strong><small>${item.label}</small></a>`).join('')}<a id="search-option-${suggestions.length}" role="option" aria-selected="false" tabindex="-1" class="search-all" href="${escapeHTML(searchHref)}">${matches.length ? 'Все результаты' : 'Изменить запрос'} ${icon('arrow')}</a></div>`;
  searchResults.hidden = false;
  searchInput.setAttribute('aria-expanded', 'true');
  searchStatus.textContent = `Найдено ${matches.length} материалов. Используй стрелки для выбора или Enter для всех результатов.`;
}

function selectSearchResult(direction) {
  if (searchResults.hidden) showSearch();
  const options = [...searchResults.querySelectorAll('[role="option"]')];
  if (!options.length || searchResults.hidden) return;
  searchSelection = Math.max(-1, Math.min(options.length - 1, searchSelection + direction));
  options.forEach((option,i) => option.setAttribute('aria-selected', String(i === searchSelection)));
  if (searchSelection < 0) searchInput.removeAttribute('aria-activedescendant');
  else {
    searchInput.setAttribute('aria-activedescendant', options[searchSelection].id);
    options[searchSelection].scrollIntoView({ block: 'nearest' });
  }
}

let historySequence = Date.now();
let activeHistoryKey = history.state?.microeconomicKey ?? ++historySequence;
let activeHash = location.hash || '#home';
const historyPositions = new Map();
const routePositions = new Map();
history.scrollRestoration = 'manual';
history.replaceState({ ...history.state, microeconomicKey: activeHistoryKey }, '');

function savePosition() {
  const focus = document.activeElement;
  const previous = historyPositions.get(activeHistoryKey);
  const position = {
    y: window.scrollY,
    focusId: main.contains(focus) && focus.id ? focus.id : null,
    focusHref: main.contains(focus) && focus.closest('a') ? focus.closest('a').getAttribute('href') : previous?.focusHref
  };
  historyPositions.set(activeHistoryKey, position);
  routePositions.set(activeHash, position);
}

function navigate(href, restoreIndex = false) {
  savePosition();
  hideSearch();
  const restore = restoreIndex ? routePositions.get(href) : null;
  if (href !== location.hash) {
    activeHistoryKey = ++historySequence;
    history.pushState({ microeconomicKey: activeHistoryKey }, '', href);
    activeHash = href;
  }
  render({ moveFocus: true, restore });
}

function updateReadingPosition() {
  const readerSections = [...main.querySelectorAll('.reader-section')];
  if (!readerSections.length) return;
  const current = readerSections.filter(section => section.getBoundingClientRect().top <= 100).at(-1) ?? readerSections[0];
  const currentLabel = main.querySelector('[data-current-section]');
  if (currentLabel) currentLabel.textContent = '§ ' + current.id.slice(8) + ' · ' + current.querySelector('h2').textContent;
  main.querySelectorAll('[data-reader-nav] a').forEach(link => {
    if (link.hash === '#section/' + current.id.slice(8)) link.setAttribute('aria-current', 'location');
    else link.removeAttribute('aria-current');
  });
}

let scrollFrame = 0;
window.addEventListener('scroll', () => {
  if (scrollFrame) return;
  scrollFrame = requestAnimationFrame(() => {
    scrollFrame = 0;
    savePosition();
    updateReadingPosition();
  });
}, { passive: true });
window.addEventListener('pagehide', savePosition);
window.addEventListener('resize', updateFormulaOverflow);
window.addEventListener('beforeprint', () => main.querySelectorAll('[data-graph]').forEach(setupGraph));
window.addEventListener('popstate', event => {
  savePosition();
  activeHistoryKey = event.state?.microeconomicKey ?? ++historySequence;
  activeHash = location.hash || '#home';
  history.replaceState({ ...event.state, microeconomicKey: activeHistoryKey }, '');
  hideSearch();
  render({ moveFocus: true, restore: historyPositions.get(activeHistoryKey) });
});
window.addEventListener('hashchange', () => {
  if (activeHash === (location.hash || '#home')) return;
  savePosition();
  activeHash = location.hash || '#home';
  activeHistoryKey = ++historySequence;
  history.replaceState({ microeconomicKey: activeHistoryKey }, '');
  hideSearch();
  render({ moveFocus: true });
});

searchInput.addEventListener('input', showSearch);
searchInput.addEventListener('focus', showSearch);
searchInput.addEventListener('keydown', event => {
  if (event.key === 'ArrowDown' || event.key === 'ArrowUp') {
    event.preventDefault();
    selectSearchResult(event.key === 'ArrowDown' ? 1 : -1);
  }
});
searchForm.addEventListener('submit', event => {
  event.preventDefault();
  const selected = searchResults.hidden ? null : searchResults.querySelector('[aria-selected="true"]');
  const query = searchInput.value.trim();
  if (selected || query) navigate(selected?.getAttribute('href') ?? '#search/' + encodeURIComponent(query));
});
document.querySelector('#clear-search').addEventListener('click', () => {
  searchInput.value = '';
  showSearch();
  searchInput.focus();
});
document.addEventListener('click', event => {
  if (!event.target.closest('.search')) hideSearch();
  const link = event.target.closest('a');
  const href = link?.getAttribute('href');
  if (event.defaultPrevented || event.button !== 0 || event.metaKey || event.ctrlKey || event.altKey || event.shiftKey || link?.target === '_blank' || !href?.startsWith('#')) return;
  event.preventDefault();
  navigate(href, link.hasAttribute('data-restore-index'));
});
document.addEventListener('focusin', event => {
  if (!event.target.closest('.search')) hideSearch();
});
document.addEventListener('keydown', event => {
  if (event.key === 'Escape' && !searchResults.hidden) {
    event.preventDefault();
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

render();
setupPullRefresh();
