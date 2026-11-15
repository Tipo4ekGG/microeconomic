const practiceBank = Object.fromEntries([...practiceQuestions, ...practiceProblems, ...homeworkTasks].map(item => [item.id, item]));
const practiceStorageKey = 'microeconomic.practice.v1';

function loadPractice() {
  try {
    const saved = JSON.parse(sessionStorage.getItem(practiceStorageKey));
    if (saved?.items.length && saved.items.every(item => Object.hasOwn(practiceBank, item.id))) return saved;
  } catch {
    // The current attempt still works if browser storage is unavailable.
  }
  return null;
}

let practiceAttempt = loadPractice();

function savePractice() {
  try {
    sessionStorage.setItem(practiceStorageKey, JSON.stringify(practiceAttempt));
  } catch {
    // Keep the current attempt in memory.
  }
}

function practiceShuffle(items) {
  const shuffled = [...items];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}

function practiceVariant() {
  const pick = items => items[Math.floor(Math.random() * items.length)];
  const tests = Object.keys(practiceChapters).slice(0, 8).map(chapter =>
    pick(practiceQuestions.filter(item => item.chapter === Number(chapter))));
  const market = pick(practiceProblems.filter(item => [4, 5].includes(item.chapter)));
  const production = pick(practiceProblems.filter(item => [6, 8].includes(item.chapter) && item.points === 2));
  const costs = pick(practiceProblems.filter(item => item.chapter === 9));
  return [...practiceShuffle(tests), market, production, costs];
}

function startPractice(mode, chapter) {
  let items;
  if (mode === 'mock') items = practiceVariant();
  else if (mode === 'homework') items = homeworkTasks.filter(item => chapter === 'all' || item.set === chapter);
  else {
    const pool = mode === 'tests' ? practiceQuestions : mode === 'problems' ? [...practiceProblems, ...homeworkTasks] :
      [...practiceQuestions, ...practiceProblems];
    items = practiceShuffle(pool.filter(item => chapter === 'all' || item.chapter === chapter));
  }
  practiceAttempt = {
    mode, chapter, index: 0, finished: false,
    items: items.map(item => ({
      id: item.id,
      order: item.choices ? practiceShuffle(item.choices.map((_, index) => index)) : null,
      answer: null
    }))
  };
  savePractice();
}

function parsePracticeNumber(value) {
  const cleaned = value.trim().replaceAll('−', '-').replaceAll(',', '.')
    .replace(/^(?<sign>[+-]?)(?<whole>\d{1,3}(?:[ \u00a0\u202f]\d{3})+)(?<decimal>\.\d+)?$/, (_, sign, whole, decimal = '') =>
      sign + whole.replaceAll(/\s/g, '') + decimal);
  if (/^[+-]?(?:\d+(?:\.\d*)?|\.\d+)$/.test(cleaned)) return Number(cleaned);
  const fraction = cleaned.match(/^([+-]?\d+)\s*\/\s*(\d+)$/);
  if (fraction && Number(fraction[2])) return Number(fraction[1]) / Number(fraction[2]);
  return NaN;
}

function practiceCorrect(item, entry) {
  if (entry.answer === null) return false;
  return item.choices ? entry.answer === 0 :
    item.fields.every((field, index) => practiceFieldCorrect(item, entry, field, index));
}

function practiceFieldCorrect(item, entry, [, expected], index) {
  const actual = entry.answer[index];
  if (typeof expected === 'string') return actual === expected;
  const tolerance = item.set && !Number.isInteger(expected) ? 0.005000001 : 1e-8;
  return Math.abs(actual - expected) <= tolerance;
}

function practiceAnswerText(value) {
  return typeof value === 'number' ? number.format(value) : escapeHTML(value);
}

function practiceSetLabel(set) {
  return 'ДЗ ' + (set === '2а' ? '2а_1' : set);
}

function practiceTable(table) {
  return `<div class="practice-table" tabindex="0" role="region" aria-label="${table.caption}"><table>
    <caption>${table.caption}</caption><thead><tr>${table.headers.map(value => `<th scope="col">${value}</th>`).join('')}</tr></thead>
    <tbody>${table.rows.map(row => `<tr><th scope="row">${practiceAnswerText(row[0])}</th>${row.slice(1).map(value => `<td>${practiceAnswerText(value)}</td>`).join('')}</tr>`).join('')}</tbody>
  </table></div>`;
}

function practiceChart(chart) {
  const styles = ['curve', 'green-line', 'blue-line', 'violet-line'];
  const minY = chart.minY ?? 0;
  const sx = x => 42 + 237 * x / chart.max[0];
  const sy = y => 161 - 136 * (y - minY) / (chart.max[1] - minY);
  const plotPoints = points => points.map(([x, y]) => `${sx(x).toFixed(2)},${sy(y).toFixed(2)}`).join(' ');
  const markedPoints = chart.lines.filter(line => line.mark).flatMap(line => line.points)
    .map(([x, y]) => `<circle class="chart-dot" cx="${sx(x)}" cy="${sy(y)}" r="3"><title>${number.format(x)} · ${number.format(y)}</title></circle>`).join('');
  const ticks = (axis, max) => [...new Set([
    max, ...chart.lines.filter(line => line.mark).flatMap(line => line.points.map(point => point[axis]))
  ])].filter(value => value > 0).sort((a, b) => a - b);
  const areas = chart.areas ?? [];
  return `<figure class="homework-chart"><figcaption>${chart.title}</figcaption>
    <svg viewBox="0 0 300 200" role="img" aria-label="${chart.title}. По горизонтали ${chart.x}, по вертикали ${chart.y}.">
      ${ticks(0, chart.max[0]).map(value => `<path class="grid-line" d="M${sx(value)} 25V161"/><text x="${sx(value)}" y="176" text-anchor="middle">${number.format(value)}</text>`).join('')}
      ${ticks(1, chart.max[1]).map(value => `<path class="grid-line" d="M42 ${sy(value)}H279"/><text x="37" y="${sy(value) + 3}" text-anchor="end">${number.format(value)}</text>`).join('')}
      <path class="axis" d="M42 25V161H279"/>
      <text x="42" y="176" text-anchor="middle">0</text>${minY ? `<text x="37" y="164" text-anchor="end">${number.format(minY)}</text>` : ''}<text x="42" y="15">${chart.y}</text><text x="279" y="193" text-anchor="end">${chart.x}</text>
      ${areas.map((area, i) => `<polygon class="${i ? 'area-mint' : 'area-peach'}" points="${plotPoints(area.points)}"/>`).join('')}
      ${chart.lines.map((line, i) => line.pointsOnly ? '' : `<polyline class="${styles[i]}" points="${plotPoints(line.points)}"/>`).join('')}
      ${markedPoints}
    </svg>
    <ul class="chart-legend">${chart.lines.map((line, i) => `<li><span class="legend-${line.pointsOnly ? 'point' : styles[i]}"></span>${line.name}</li>`).join('')}${areas.map((area, i) => `<li><span class="legend-area-${i ? 'mint' : 'peach'}"></span>${area.name}</li>`).join('')}</ul>
  </figure>`;
}

function practiceReference(reference) {
  if (typeof reference !== 'string') return `<p class="note">Учебник · § ${reference.section}, с. ${reference.page}</p>`;
  const topic = topicById[reference];
  return `<a class="button outline" href="#topic/${topic.id}">К теории · § ${topic.section}, с. ${topic.page}</a>`;
}

function practiceExplanation(item, entry) {
  const correctAnswer = item.choices ? item.choices[0] :
    item.fields.map(([label, value]) => `${label} — ${practiceAnswerText(value)}`).join(' · ');
  const given = item.choices ? item.choices[entry.answer] : entry.answer?.map(practiceAnswerText).join(' · ');
  const formulasMarkup = [...(item.keys ?? []).map(key => formula(key)),
    ...(item.formulas ?? []).map(value => `<div class="formula">${value}</div>`)];
  return `
    ${formulasMarkup.length ? `<div class="practice-formulas"><h3>Исходные формулы</h3><div class="formula-group">${formulasMarkup.join('')}</div></div>` : ''}
    ${item.set ? `<dl class="practice-answer-list">${item.fields.map(([label, expected], index) => {
      const wrong = entry.answer && !practiceFieldCorrect(item, entry, item.fields[index], index);
      return `<div><dt>${label}</dt><dd>${practiceAnswerText(expected)}${wrong ? `<small>Твой ответ · ${practiceAnswerText(entry.answer[index])}</small>` : ''}</dd></div>`;
    }).join('')}</dl>` : `<p><strong>Правильный ответ</strong> · ${correctAnswer}</p>
    ${given && !practiceCorrect(item, entry) ? `<p><strong>Твой ответ</strong> · ${given}</p>` : ''}`}
    ${item.steps ? `<ol class="practice-steps">${item.steps.map(step => `<li>${step}</li>`).join('')}</ol>` : `<p>${item.explanation}</p>`}
    ${item.solutionChart ? practiceChart(item.solutionChart) : ''}
    ${practiceReference(item.reference)}`;
}

function practiceStartMarkup() {
  const chapterOptions = pool => Object.entries(practiceChapters).filter(([id]) =>
    pool.some(item => item.chapter === Number(id))).map(([id, title]) => `<option value="${id}">${title}</option>`).join('');
  return `
    <p class="lead">Подготовка к контрольной по темам до издержек производства включительно.</p>
    <div class="practice-modes">
      <article class="practice-mode">
        <h2>Тесты</h2>
        <p>Вопросы с вариантами ответа и объяснением после проверки.</p>
        <form data-practice-topic="tests">
          <label for="practice-test-chapter">Тема тестов</label>
          <select name="chapter" id="practice-test-chapter"><option value="all">Все темы</option>${chapterOptions(practiceQuestions)}</select>
          <button class="button primary" type="submit">Решать тесты</button>
        </form>
      </article>
      <article class="practice-mode">
        <h2>Задачи</h2>
        <p>Решай задачи из ДЗ по порядку или выбери тему для тренировки.</p>
        <form data-practice-topic="problems">
          <label for="practice-problem-chapter">Подборка задач</label>
          <select name="chapter" id="practice-problem-chapter">
            <optgroup label="Домашние задания">
              <option value="hw/all">Все задачи из ДЗ · ${homeworkTasks.length}</option>
              ${Object.entries(homeworkSets).sort(([a], [b]) => a.localeCompare(b, 'ru', { numeric: true }))
                .map(([id, title]) => `<option value="hw/${id}">${practiceSetLabel(id)} · ${title}</option>`).join('')}
            </optgroup>
            <optgroup label="Тренировка по теме">
              <option value="all">Все задачи тренажёра</option>${chapterOptions([...practiceProblems, ...homeworkTasks])}
            </optgroup>
          </select>
          <button class="button primary" type="submit">Решать задачи</button>
        </form>
      </article>
      <article class="practice-mode">
        <h2>Пробный вариант</h2>
        <p>8 вопросов теста и 3 задачи на 15 баллов. Разбор и баллы появятся в конце.</p>
        <button class="button outline" type="button" data-practice-start="mock">Начать вариант</button>
      </article>
    </div>
    <p class="note">Номера страниц в разборах даны по изданию 2011 года. Пробный вариант составлен для подготовки, формат контрольной может отличаться.</p>`;
}

function practiceExerciseMarkup(attempt) {
  const entry = attempt.items[attempt.index];
  const item = practiceBank[entry.id];
  const answered = Object.hasOwn(entry, 'checked');
  const isMock = attempt.mode === 'mock';
  const heading = isMock ? 'Пробный вариант' : attempt.mode === 'tests' ? 'Тесты' : 'Задачи';
  return `
    <div class="practice-progress"><span>${heading}</span><span>Задание ${attempt.index + 1} из ${attempt.items.length}</span></div>
    <progress value="${attempt.index + Number(answered)}" max="${attempt.items.length}" aria-label="Завершено заданий"></progress>
    <div class="practice-exercise">
      <div class="eyebrow ink">${item.set ? `${practiceSetLabel(item.set)} · № ${item.no}` :
        `${item.choices ? 'ТЕСТ' : 'ЗАДАЧА'}${isMock ? ` · ${item.points} ${item.points === 1 ? 'БАЛЛ' : 'БАЛЛА'}` : ''}`}</div>
      <h2 tabindex="-1" data-practice-heading id="practice-question">${item.title ?? item.prompt}</h2>
      ${item.title ? `<p>${item.prompt}</p>` : ''}
      ${item.table ? practiceTable(item.table) : ''}
      ${item.promptChart ? practiceChart(item.promptChart) : ''}
      ${answered ? `
        <div class="practice-explanation" data-correct="${practiceCorrect(item, entry)}">
          <h3>${entry.answer === null ? 'Пропущено' : practiceCorrect(item, entry) ? 'Верно' : 'Проверь ответы'}</h3>
          ${practiceExplanation(item, entry)}
        </div>
        <button class="button primary" type="button" data-practice-next>${attempt.index + 1 === attempt.items.length ? 'Итог тренировки' : 'Следующее задание'}</button>
      ` : `
        <form data-practice-answer aria-labelledby="practice-question">
          ${item.choices ? `<fieldset class="practice-options"><legend class="sr">Выбери один ответ</legend>${entry.order.map(index =>
            `<label><input name="choice" value="${index}" type="radio"><span>${item.choices[index]}</span></label>`).join('')}</fieldset>` :
            `${item.solutionChart ? '<p class="note">Построй график на бумаге и сравни его с графиком в разборе.</p>' : ''}
              <div class="practice-fields">${item.fields.map(([label, , choices], index) => `<label>${label}${choices ?
                `<select name="value-${index}" aria-label="${label}"><option value="">Выбрать</option>${choices.map(choice => `<option>${choice}</option>`).join('')}</select>` :
                `<input type="text" name="value-${index}" maxlength="32" autocomplete="off" spellcheck="false" aria-describedby="practice-number-help">`}</label>`).join('')}</div>
              <p class="note" id="practice-number-help">Запятая, точка и дробь через «/» подходят.${item.set ? ' При необходимости округли до сотых.' : ''}</p>`}
          <p class="practice-error" role="alert"></p>
          <div class="practice-actions">
            <button class="button primary" type="submit">${isMock ? (attempt.index + 1 === attempt.items.length ? 'Завершить вариант' : 'Сохранить и дальше') : 'Проверить ответ'}</button>
            <button class="button outline" type="button" data-practice-skip>Пропустить</button>
          </div>
        </form>`}
    </div>
    <button class="button practice-secondary" type="button" data-practice-menu>К режимам</button>`;
}

function practiceResultsMarkup(attempt) {
  const total = attempt.items.reduce((sum, entry) => sum + practiceBank[entry.id].points, 0);
  const showPoints = attempt.mode === 'mock' || attempt.mode === 'topic';
  const score = attempt.items.reduce((sum, entry) => {
    const item = practiceBank[entry.id];
    return sum + (practiceCorrect(item, entry) ? (showPoints ? item.points : 1) : 0);
  }, 0);
  return `
    <h2 tabindex="-1" data-practice-heading>${showPoints ? 'Результат' : 'Решено верно'} · ${score} из ${showPoints ? total : attempt.items.length}</h2>
    <p class="lead">Открой задание, чтобы посмотреть решение.</p>
    <div class="practice-review">${attempt.items.map((entry, index) => {
      const item = practiceBank[entry.id];
      const correct = practiceCorrect(item, entry);
      const status = entry.answer === null ? 'Пропущено' : correct ? 'Верно' : 'Есть ошибка';
      return `<details><summary><span>${item.set ? `${practiceSetLabel(item.set)} · № ${item.no}. ${item.title}` : `${index + 1}. ${item.prompt}`}</span><small>${status}${showPoints ? ` · ${correct ? item.points : 0}/${item.points}` : ''}</small></summary>
        <div class="practice-review-body">${item.title ? `<p>${item.prompt}</p>` : ''}${item.table ? practiceTable(item.table) : ''}${item.promptChart ? practiceChart(item.promptChart) : ''}${practiceExplanation(item, entry)}</div>
      </details>`;
    }).join('')}</div>
    <div class="practice-actions">
      <button class="button primary" type="button" data-practice-retry>${attempt.mode === 'mock' ? 'Новый вариант' : 'Повторить подборку'}</button>
      <button class="button outline" type="button" data-practice-menu>К режимам</button>
    </div>`;
}

let practiceShowMenu = false;

function practicePage() {
  return `${crumbs('Тренажёр')}<section class="collection practice"><h1>Тренажёр</h1><div data-practice-body></div></section>`;
}

function setupPractice(moveFocus = false) {
  const body = main.querySelector('[data-practice-body]');
  const attempt = practiceAttempt;
  body.innerHTML = !attempt || practiceShowMenu ? practiceStartMarkup() :
    attempt.finished ? practiceResultsMarkup(attempt) : practiceExerciseMarkup(attempt);
  if (attempt && practiceShowMenu) {
    body.insertAdjacentHTML('afterbegin', '<p><button type="button" class="button outline" data-practice-resume>Вернуться к текущей попытке</button></p>');
  }

  function start(mode, chapter) {
    startPractice(mode, chapter);
    practiceShowMenu = false;
    setupPractice(true);
  }

  function advance() {
    if (attempt.index + 1 === attempt.items.length) attempt.finished = true;
    else attempt.index++;
    savePractice();
    setupPractice(true);
  }

  function recordAnswer(answer) {
    const entry = attempt.items[attempt.index];
    entry.answer = answer;
    entry.checked = true;
    if (attempt.mode === 'mock') advance();
    else {
      savePractice();
      setupPractice(true);
    }
  }

  body.querySelector('[data-practice-start]')?.addEventListener('click', () => start('mock'));
  for (const form of body.querySelectorAll('[data-practice-topic]')) {
    form.addEventListener('submit', event => {
      event.preventDefault();
      const chapter = new FormData(form).get('chapter');
      if (chapter.startsWith('hw/')) start('homework', chapter.slice(3));
      else start(form.dataset.practiceTopic, chapter === 'all' ? chapter : Number(chapter));
    });
  }
  body.querySelector('[data-practice-next]')?.addEventListener('click', advance);
  body.querySelector('[data-practice-skip]')?.addEventListener('click', () => recordAnswer(null));
  body.querySelector('[data-practice-retry]')?.addEventListener('click', () => start(attempt.mode, attempt.chapter));
  body.querySelector('[data-practice-menu]')?.addEventListener('click', () => {
    practiceShowMenu = true;
    setupPractice(true);
  });
  body.querySelector('[data-practice-resume]')?.addEventListener('click', () => {
    practiceShowMenu = false;
    setupPractice(true);
  });

  body.querySelector('[data-practice-answer]')?.addEventListener('submit', event => {
    event.preventDefault();
    const form = event.currentTarget;
    const data = new FormData(form);
    const item = practiceBank[attempt.items[attempt.index].id];
    const error = form.querySelector('.practice-error');
    if (item.choices) {
      if (!data.has('choice')) {
        error.textContent = 'Выбери ответ или пропусти задание.';
        form.querySelector('input').focus();
        return;
      }
      recordAnswer(Number(data.get('choice')));
    } else {
      const values = item.fields.map(([, , choices], index) => {
        const value = data.get('value-' + index);
        return choices ? value : parsePracticeNumber(value);
      });
      const invalid = values.findIndex((value, index) => {
        const choices = item.fields[index][2];
        return choices ? !choices.includes(value) : !Number.isFinite(value);
      });
      if (invalid !== -1) {
        error.textContent = item.fields[invalid][2] ? 'Выбери вариант ответа в выделенном поле.' : 'Введи число в выделенном поле.';
        form.elements['value-' + invalid].focus();
        return;
      }
      recordAnswer(values);
    }
  });

  if (moveFocus) {
    const heading = body.querySelector('[data-practice-heading]') ?? main.querySelector('h1');
    heading.focus({ preventScroll: true });
    window.scrollTo(0, 0);
  }
}
