const practiceBank = Object.fromEntries([...practiceQuestions, ...practiceProblems].map(item => [item.id, item]));
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
  const items = mode === 'mock' ? practiceVariant() :
    practiceShuffle([...practiceQuestions, ...practiceProblems].filter(item => item.chapter === chapter));
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
  const cleaned = value.trim().replaceAll('−', '-').replaceAll(',', '.');
  if (/^[+-]?(?:\d+(?:\.\d*)?|\.\d+)$/.test(cleaned)) return Number(cleaned);
  const fraction = cleaned.match(/^([+-]?\d+)\s*\/\s*(\d+)$/);
  if (fraction && Number(fraction[2])) return Number(fraction[1]) / Number(fraction[2]);
  return NaN;
}

function practiceCorrect(item, entry) {
  if (entry.answer === null) return false;
  return item.choices ? entry.answer === 0 :
    item.fields.every(([, expected], index) => Math.abs(entry.answer[index] - expected) < 1e-8);
}

function practiceReference(reference) {
  if (typeof reference !== 'string') return `<p class="note">Учебник · § ${reference.section}, с. ${reference.page}</p>`;
  const topic = topicById[reference];
  return `<a class="button outline" href="#topic/${topic.id}">К теории · § ${topic.section}, с. ${topic.page}</a>`;
}

function practiceExplanation(item, entry) {
  const correctAnswer = item.choices ? item.choices[0] :
    item.fields.map(([label, value]) => `${label} — ${number.format(value)}`).join(' · ');
  const given = item.choices ? item.choices[entry.answer] : entry.answer?.map(value => number.format(value)).join(' · ');
  return `
    ${item.keys ? `<div class="practice-formulas"><h3>Исходные формулы</h3><div class="formula-group">${item.keys.map(key => formula(key)).join('')}${(item.formulas ?? []).map(value => `<div class="formula">${value}</div>`).join('')}</div></div>` : ''}
    <p><strong>Правильный ответ</strong> · ${correctAnswer}</p>
    ${given && !practiceCorrect(item, entry) ? `<p><strong>Твой ответ</strong> · ${given}</p>` : ''}
    ${item.steps ? `<ol class="practice-steps">${item.steps.map(step => `<li>${step}</li>`).join('')}</ol>` : `<p>${item.explanation}</p>`}
    ${practiceReference(item.reference)}`;
}

function practiceStartMarkup() {
  return `
    <p class="lead">Подготовка к контрольной по темам до издержек производства включительно.</p>
    <div class="practice-modes">
      <article class="practice-mode">
        <h2>Пробный вариант</h2>
        <p>8 вопросов теста и 3 задачи на 15 баллов. Разбор и баллы появятся в конце.</p>
        <button class="button primary" type="button" data-practice-start="mock">Начать вариант</button>
      </article>
      <article class="practice-mode">
        <h2>Тренировка по теме</h2>
        <p>После каждого задания сразу видны ответ и объяснение.</p>
        <form data-practice-topic>
          <label for="practice-chapter">Тема</label>
          <select name="chapter" id="practice-chapter">${Object.entries(practiceChapters).map(([id, title]) =>
            `<option value="${id}"${id === '4' ? ' selected' : ''}>${title}</option>`).join('')}</select>
          <button class="button outline" type="submit">Начать тренировку</button>
        </form>
      </article>
    </div>
    <p class="note">Задания составлены для подготовки. Количество вопросов и задач в настоящей контрольной может отличаться.</p>`;
}

function practiceExerciseMarkup(attempt) {
  const entry = attempt.items[attempt.index];
  const item = practiceBank[entry.id];
  const answered = Object.hasOwn(entry, 'checked');
  const isMock = attempt.mode === 'mock';
  const heading = isMock ? 'Пробный вариант' : practiceChapters[item.chapter];
  return `
    <div class="practice-progress"><span>${heading}</span><span>Задание ${attempt.index + 1} из ${attempt.items.length}</span></div>
    <progress value="${attempt.index + Number(answered)}" max="${attempt.items.length}" aria-label="Завершено заданий"></progress>
    <div class="practice-exercise">
      <div class="eyebrow ink">${item.choices ? 'ТЕСТ' : 'ЗАДАЧА'} · ${item.points} ${item.points === 1 ? 'БАЛЛ' : 'БАЛЛА'}</div>
      <h2 tabindex="-1" data-practice-heading id="practice-question">${item.prompt}</h2>
      ${answered ? `
        <div class="practice-explanation" data-correct="${practiceCorrect(item, entry)}">
          <h3>${entry.answer === null ? 'Пропущено' : practiceCorrect(item, entry) ? 'Верно' : 'Есть ошибка'}</h3>
          ${practiceExplanation(item, entry)}
        </div>
        <button class="button primary" type="button" data-practice-next>${attempt.index + 1 === attempt.items.length ? 'Итог тренировки' : 'Следующее задание'}</button>
      ` : `
        <form data-practice-answer aria-labelledby="practice-question">
          ${item.choices ? `<fieldset class="practice-options"><legend class="sr">Выбери один ответ</legend>${entry.order.map(index =>
            `<label><input name="choice" value="${index}" type="radio"><span>${item.choices[index]}</span></label>`).join('')}</fieldset>` :
            `<div class="practice-fields">${item.fields.map(([label], index) =>
              `<label>${label}<input type="text" name="value-${index}" inputmode="text" maxlength="32" autocomplete="off" spellcheck="false" aria-describedby="practice-number-help"></label>`).join('')}</div>
              <p class="note" id="practice-number-help">Введи число. Для дробной части подойдёт запятая или точка. Можно записать дробь через «/».</p>`}
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
  const score = attempt.items.reduce((sum, entry) => {
    const item = practiceBank[entry.id];
    return sum + (practiceCorrect(item, entry) ? item.points : 0);
  }, 0);
  return `
    <h2 tabindex="-1" data-practice-heading>Результат · ${score} из ${total}</h2>
    <p class="lead">Открой задание, чтобы посмотреть решение. Задача оценивается целиком.</p>
    <div class="practice-review">${attempt.items.map((entry, index) => {
      const item = practiceBank[entry.id];
      const correct = practiceCorrect(item, entry);
      const status = entry.answer === null ? 'Пропущено' : correct ? 'Верно' : 'Есть ошибка';
      return `<details><summary><span>${index + 1}. ${item.prompt}</span><small>${status} · ${correct ? item.points : 0}/${item.points}</small></summary>
        <div class="practice-review-body">${practiceExplanation(item, entry)}</div>
      </details>`;
    }).join('')}</div>
    <div class="practice-actions">
      <button class="button primary" type="button" data-practice-retry>${attempt.mode === 'mock' ? 'Новый вариант' : 'Повторить тему'}</button>
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
  body.querySelector('[data-practice-topic]')?.addEventListener('submit', event => {
    event.preventDefault();
    start('topic', Number(new FormData(event.currentTarget).get('chapter')));
  });
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
      const values = item.fields.map((_, index) => parsePracticeNumber(data.get('value-' + index)));
      const invalid = values.findIndex(value => !Number.isFinite(value));
      if (invalid !== -1) {
        error.textContent = 'В каждом поле нужен числовой ответ.';
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
