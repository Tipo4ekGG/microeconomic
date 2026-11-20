const solvedExamWorkerTable = homeworkTable('Данные из условия', ['Число рабочих (чел.)', 0, 1, 2, 3, 4, 5, 6], [
  ['Выпуск продукции (шт.)', 0, 40, 90, 126, 150, 165, 180]
]);

const solvedExamCharts = {
  budget: homeworkChart('Бюджетная линия', 'Пепси-кола x, л', 'Кока-кола y, л', [5, 4],
    { ...homeworkLine('Бюджетная линия 8x + 10y = 40', [[0, 4], [5, 0]]), mark: true }),
  optimum: homeworkChart('Равновесие потребителя', 'Благо x', 'Благо y', [76, 150],
    homeworkLine('Бюджетная линия', [[0, 140], [70, 0]]),
    homeworkLine('Кривая безразличия через оптимум', sampleCurve(52.5 * Math.cbrt(35 / 150), 76, x => 35 * (52.5 / x) ** 3)),
    { ...homeworkLine('Оптимум (52,5; 35)', [[52.5, 35]]), mark: true, pointsOnly: true }),
  shortage: homeworkChart('Дефицит при максимальной цене 8', 'Количество q', 'Цена p', [10, 20],
    homeworkLine('Спрос', [[0, 20], [10, 0]]),
    homeworkLine('Предложение', [[0, 5], [10, 15]]),
    homeworkLine('Потолок цены p = 8', [[0, 8], [10, 8]]),
    homeworkLine('Дефицит от q = 3 до q = 6', [[3, 8], [6, 8]]),
    { ...homeworkLine('Свободное равновесие и границы дефицита', [[5, 10], [3, 8], [6, 8]]), mark: true, pointsOnly: true })
};

function solvedExamQuestion(question, variant) {
  const { number, prompt, options, workerTable, followup, answer, explanation, formulaKeys = [], steps, graph, note, references = [] } = question;
  const id = `solved-exam-${variant}-question-${number}`;
  const result = answer ? `<p><strong>Ответ.</strong> ${answer}${explanation ? '.' : ''}</p>` : '';
  const solution = explanation ? result + `<p>${explanation}</p>` : `
    <h4>${formulaKeys.length === 1 ? 'Исходная формула' : 'Исходные формулы'}</h4>
    <div class="formula-group">${formulaKeys.map(key => formula(key)).join('')}</div>
    ${note ? `<p class="note">${note}</p>` : ''}
    <ol class="practice-steps">${steps?.map(step => `<li>${step}</li>`).join('') ?? ''}</ol>
    ${result}
    ${graph ? practiceChart(solvedExamCharts[graph]) : ''}
  `;
  return `<article id="${id}" class="exam-question solved-exam-question">
    <h3 class="exam-prompt"><span>№ ${number}.</span> ${prompt || 'Условие отсутствует на листе.'}</h3>
    ${workerTable ? practiceTable(solvedExamWorkerTable) + `<p class="exam-prompt">${followup}</p>` : ''}
    ${options.length ? `<ol class="exam-choices" role="list">${options.map(option => `<li><span>${option.slice(0, 2)}</span><span>${option.slice(3)}</span></li>`).join('')}</ol>` : ''}
    ${answer ? examSolution(id + '-solution', explanation ? 'Ответ и пояснение' : 'Решение', solution) : `<p class="note">${note}</p>`}
    ${references.length ? `<div class="concept-links"><span>Учебник</span>${references.map(reference => {
      const topic = topicById[reference];
      const textbook = reference === 'economic-choice' ? '§ 1.1, с. 11' : `§ ${topic.section}, с. ${topic.page}`;
      return `<a id="${id}-theory-${topic.id}" href="#topic/${topic.id}">${escapeHTML(topic.title)} · ${textbook}</a>`;
    }).join('')}</div>` : ''}
  </article>`;
}

function solvedExamPage(variant) {
  const home = '#exam-variants';
  const title = 'Варианты 1–4 с решениями';
  if (!variant) {
    return `${crumbs(title, { title: 'Тренажёр', href: '#practice' })}
      <section class="collection practice exam">
        <h1>${title}</h1>
        <p class="lead">В каждом варианте 13 тестовых вопросов, 2 задания и 3 задачи. Под условиями есть ответы и ссылки на теорию. Номера страниц указаны по учебнику 2011 года.</p>
        <ul class="exam-variants">${solvedExamVariants.map(item => `<li><a href="${home}/${item.number}">
          Вариант ${item.number}${icon('arrow')}
        </a></li>`).join('')}</ul>
        <nav class="exam-shortcuts" aria-label="Материалы к контрольной">
          <a class="button outline" href="#exam-test">Тест без повторов ${icon('arrow')}</a>
          <a class="button outline" href="#exam-formulas">Формулы к вариантам 1–4 ${icon('formula')}</a>
          <a class="button outline" href="microeconomic-variants-1-4-solutions.pdf">PDF для печати</a>
        </nav>
      </section>`;
  }
  const base = `${home}/${variant.number}`;
  const sections = [
    ['tests', 'Тест · 1 балл за ответ', 'Тест · № 1–13', 0, 13],
    ['exercises', 'Задания · по 2 балла', 'Задания · № 14–15', 13, 15],
    ['problems', 'Задачи · по 3 балла', 'Задачи · № 16–18', 15, 18]
  ];
  return `${crumbs('Вариант ' + variant.number, { title, href: home })}
    <section class="collection practice exam">
      <h1>Вариант ${variant.number}</h1>
      <nav class="exam-shortcuts" aria-label="Задания варианта">
        ${sections.map(([section, , label]) => `<a class="button outline" href="${base}/${section}">${label}</a>`).join('')}
      </nav>
      ${sections.map(([section, heading, , start, end]) => `<section class="exam-section" aria-labelledby="exam-${section}">
        <h2 id="exam-${section}" tabindex="-1">${heading}</h2>
        ${variant.questions.slice(start, end).map(question => solvedExamQuestion(question, variant.number)).join('')}
      </section>`).join('')}
      <nav class="exam-shortcuts exam-bottom" aria-label="Другие варианты">
        <a class="button outline" href="${home}">Все варианты</a>
        ${variant.number < solvedExamVariants.length ? `<a class="button outline" href="${home}/${variant.number + 1}">Вариант ${variant.number + 1} ${icon('arrow')}</a>` : ''}
      </nav>
    </section>`;
}

function solvedExamTestPage() {
  const questions = new Map();
  for (const variant of solvedExamVariants) {
    for (const question of variant.questions.slice(0, 13)) {
      const prompt = question.prompt.replace('Если спрос растёт, а предложение снижается, то:', 'Если спрос растёт, а предложение падает, то:');
      const key = JSON.stringify([prompt, question.options]);
      if (!questions.has(key)) questions.set(key, question);
    }
  }
  const title = 'Тест без повторов';
  return `${crumbs(title, { title: 'Тренажёр', href: '#practice' })}
    <section class="collection practice exam">
      <h1>${title}</h1>
      <p class="lead">Вопросы тестовой части вариантов 1–4. Под каждым можно раскрыть ответ и пояснение.</p>
      <nav class="exam-shortcuts" aria-label="Материалы к контрольной">
        <a class="button outline" href="#exam-variants">К вариантам 1–4 ${icon('arrow')}</a>
        <a class="button outline" href="#exam-formulas">Формулы к вариантам 1–4 ${icon('formula')}</a>
      </nav>
      <section class="exam-section" aria-labelledby="exam-tests">
        <h2 id="exam-tests">${questions.size} вопросов</h2>
        ${[...questions.values()].map((question, index) => solvedExamQuestion({ ...question, number: index + 1 }, 'combined')).join('')}
      </section>
    </section>`;
}
