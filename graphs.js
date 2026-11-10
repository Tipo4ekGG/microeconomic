const graphs = {
  utility: { title: 'Совокупная полезность', caption: 'Наклон отрезка показывает, как изменилась полезность в расчёте на добавленную единицу.', x: 'Q', y: 'TU', max: [10, 20], points: [[0, 0], [2, 8], [4, 14], [6, 18], [8, 20], [10, 20]] },
  mrs: { title: 'Кривая безразличия', caption: 'Для кривой xy = 6 все наборы равноценны. При движении вправо за дополнительную единицу X отдают всё меньше Y.', x: 'Благо X', y: 'Благо Y', max: [8, 8] },
  optimum: { title: 'Оптимум потребителя', caption: 'При U = xy³ и бюджете 3x + y = 120 наилучшая доступная кривая безразличия касается бюджетной линии в точке (10; 90).', x: 'Благо X', y: 'Благо Y', max: [50, 130] },
  engel: { title: 'Пример кривой Энгеля', caption: 'В этом примере при большем доходе выбирают больше единиц X.', x: 'Доход I', y: 'Количество X', max: [1000, 50], points: [[0, 0], [1000, 50]] },
  demand: { title: 'Пример кривой спроса', caption: 'Каждая точка показывает выбранное количество X при своей цене.', x: 'Количество X', y: 'Цена X', max: [10, 10], points: [[2, 9], [4, 6], [6, 4], [8, 3], [10, 2]] },
  budget: { title: 'Бюджетная линия', caption: 'Изменяй доход и цены. Бледная линия показывает исходное положение.', x: 'Благо X', y: 'Благо Y', max: [100, 180] }
};

function sampleCurve(start, end, fn) {
  return Array.from({ length: 81 }, (_, i) => {
    const x = start + (end - start) * i / 80;
    return [x, fn(x)];
  });
}

const marketAxes = { x: 'Количество Q', y: 'Цена P', max: [12, 12], step: [2, 2] };
const demandCurve = { label: 'Спрос D', style: 'curve', points: [[0, 12], [12, 0]] };
const supplyCurve = { label: 'Предложение S', style: 'green-line', points: [[0, 2], [10, 12]] };
const marketCurves = [demandCurve, supplyCurve];
const equilibriumPoint = { at: [5, 7], label: 'E' };

Object.assign(graphs, {
  ppf: {
    title: 'Граница возможностей и её сдвиг', x: 'Выпуск X', y: 'Выпуск Y', max: [12, 10], step: [2, 2],
    caption: 'Если растёт производительность только в X, его максимум увеличивается, а максимум Y остаётся прежним. На каждой границе ресурсы используются эффективно.',
    series: [
      { label: 'Исходная КПВ', style: 'curve', points: sampleCurve(0, 9, x => 9 * Math.sqrt(1 - (x / 9) ** 2)) },
      { label: 'Улучшение технологии X', style: 'green-line', points: sampleCurve(0, 12, x => 9 * Math.sqrt(1 - (x / 12) ** 2)) }
    ]
  },
  ppfSegments: {
    title: 'КПВ с растущей альтернативной стоимостью', x: 'Выпуск X', y: 'Выпуск Y', max: [12, 10], step: [2, 2],
    caption: 'Отрезки становятся круче слева направо: прирост X обходится во всё больший отказ от Y.',
    points: [[0, 9], [4, 8], [8, 6], [12, 0]]
  },
  marketDemand: {
    ...marketAxes, title: 'Кривая спроса и её сдвиг',
    caption: 'Точки А и Б лежат на одной кривой и соответствуют разным ценам. При росте спроса вся кривая смещается вправо: при той же цене покупают больше.',
    series: [demandCurve, { label: 'Спрос вырос', style: 'green-line', points: [[2, 12], [12, 2]] }],
    labels: [{ at: [4, 8], label: 'А' }, { at: [8, 4], label: 'Б' }]
  },
  marketSupply: {
    ...marketAxes, title: 'Кривая предложения и её сдвиг',
    caption: 'При снижении затрат продавцы предлагают больше при каждой цене. На схеме кривая предложения сдвигается вправо.',
    series: [supplyCurve, { label: 'Предложение выросло', style: 'curve', points: [[2, 2], [12, 12]] }]
  },
  marketEquilibrium: {
    ...marketAxes, title: 'Равновесие и рост спроса',
    caption: 'В исходном равновесии E планы покупателей и продавцов совпадают. После роста спроса пересечение перемещается в E₁ с более высокой ценой и большим количеством.',
    series: [...marketCurves, { label: 'Спрос вырос', style: 'blue-line', points: [[2, 12], [12, 2]] }],
    labels: [equilibriumPoint, { at: [6, 8], label: 'E₁' }]
  },
  surplus: {
    ...marketAxes, title: 'Выигрыши на графике спроса и предложения',
    caption: 'Выигрыш потребителя находится выше рыночной цены и под D. Выигрыш производителя — ниже цены и над S. Обе площади ограничены проданным количеством.',
    series: [...marketCurves, { label: 'Рыночная цена', style: 'reference-line', points: [[0, 7], [5, 7]] }],
    regions: [
      { label: 'CS', style: 'area-peach', points: [[0, 12], [0, 7], [5, 7]] },
      { label: 'PS', style: 'area-mint', points: [[0, 2], [0, 7], [5, 7]] }
    ],
    labels: [equilibriumPoint]
  },
  priceControl: {
    ...marketAxes, title: 'Выигрыши при потолке цены',
    caption: 'При потолке 5 продадут 3 единицы, хотя покупатели хотят купить 7. Синяя область между кривыми правее третьей единицы показывает потерянные сделки.',
    series: [...marketCurves, { label: 'Цена с потолком', style: 'reference-line', points: [[0, 5], [7, 5]] }],
    regions: [
      { label: 'CS', style: 'area-peach', points: [[0, 12], [3, 9], [3, 5], [0, 5]] },
      { label: 'PS', style: 'area-mint', points: [[0, 2], [0, 5], [3, 5]] },
      { label: 'Чистые потери', style: 'area-blue', points: [[3, 5], [3, 9], [5, 7]] }
    ],
    labels: [equilibriumPoint]
  },
  priceFloor: {
    ...marketAxes, title: 'Выигрыши при поле цены',
    caption: 'При минимальной цене 9 покупатели берут 3 единицы, хотя продавцы предлагают 7. Синим отмечена потеря от несостоявшихся сделок.',
    series: [...marketCurves, { label: 'Минимальная цена', style: 'reference-line', points: [[0, 9], [7, 9]] }],
    regions: [
      { label: 'CS', style: 'area-peach', points: [[0, 12], [3, 9], [0, 9]] },
      { label: 'PS', style: 'area-mint', points: [[0, 2], [3, 5], [3, 9], [0, 9]] },
      { label: 'Чистые потери', style: 'area-blue', points: [[3, 5], [3, 9], [5, 7]] }
    ],
    labels: [equilibriumPoint]
  },
  tax: {
    ...marketAxes, title: 'Налоговый клин и потери благосостояния',
    caption: 'Вертикальный разрыв между Pᵦ и Pₛ равен налогу. Прямоугольник показывает доход бюджета, треугольник правее него — чистые потери от сокращения сделок.',
    series: [...marketCurves, { label: 'Налоговый клин', style: 'blue-line', points: [[3, 5], [3, 9]] }],
    regions: [
      { label: 'Доход бюджета', style: 'area-blue', points: [[0, 5], [3, 5], [3, 9], [0, 9]] },
      { label: 'Чистые потери', style: 'area-peach', points: [[3, 5], [3, 9], [5, 7]] }
    ],
    labels: [{ at: [3, 9], label: 'Pᵦ' }, { at: [3, 5], label: 'Pₛ' }, equilibriumPoint]
  },
  subsidy: {
    ...marketAxes, title: 'Разрыв цен при субсидии',
    caption: 'После субсидии продавец получает Pₛ, покупатель платит Pᵦ. Разница равна доплате за единицу. Площадь прямоугольника — расходы бюджета.',
    series: [...marketCurves, { label: 'Субсидия за единицу', style: 'blue-line', points: [[7, 5], [7, 9]] }],
    regions: [{ label: 'Расходы бюджета', style: 'area-blue', points: [[0, 5], [7, 5], [7, 9], [0, 9]] }],
    labels: [{ at: [7, 9], label: 'Pₛ' }, { at: [7, 5], label: 'Pᵦ' }, equilibriumPoint]
  },
  priceElasticity: {
    ...marketAxes, title: 'Эластичность вдоль линейного спроса',
    caption: 'На верхней части линейного спроса модуль эластичности больше единицы, на нижней — меньше. В середине модуль равен единице, хотя наклон линии одинаков по всей длине.',
    series: [
      { label: '|Eᴅ| > 1', style: 'curve', points: [[0, 12], [6, 6]] },
      { label: '|Eᴅ| < 1', style: 'green-line', points: [[6, 6], [12, 0]] }
    ],
    labels: [{ at: [6, 6], label: '|Eᴅ| = 1' }]
  },
  revenue: {
    title: 'Выручка при линейном спросе', x: 'Проданное количество Q', y: 'Выручка TR', max: [12, 40], step: [2, 10],
    caption: 'Для спроса P = 12 − Q выручка сначала растёт, затем падает. Максимум в середине, где модуль эластичности спроса равен единице.',
    series: [{ label: 'TR = (12 − Q) · Q', style: 'curve', points: sampleCurve(0, 12, q => (12 - q) * q) }],
    labels: [{ at: [6, 36], label: 'Максимум TR' }]
  },
  supplyElasticity: {
    ...marketAxes, title: 'Предложение с разной эластичностью',
    caption: 'В общей точке E при том же изменении цены пологая кривая даёт больший прирост количества. Сравнение наклонов работает здесь, потому что исходные P и Q одинаковы.',
    series: [
      { label: 'Более эластичное', style: 'green-line', points: [[0, 3], [12, 9]] },
      { label: 'Менее эластичное', style: 'curve', points: [[2, 0], [10, 12]] }
    ],
    labels: [{ at: [6, 6], label: 'E' }]
  },
  indifferenceMap: {
    title: 'Карта безразличия', x: 'Благо X', y: 'Благо Y', max: [8, 8], step: [2, 2],
    caption: 'На каждой кривой произведение xy постоянно. Более высокая кривая соответствует большей полезности в этой модели.',
    series: [4, 8, 16].map((value, i) => ({
      label: 'U = ' + value, style: ['curve', 'green-line', 'blue-line'][i],
      points: sampleCurve(value / 8, 8, x => value / x)
    }))
  },
  pricePath: {
    title: 'Оптимальные наборы при разных ценах X', x: 'Благо X', y: 'Благо Y', max: [12, 12], step: [2, 2],
    caption: 'При неизменных доходе 12 и цене Y, равной 1, снижение цены X с 2 до 1 поворачивает бюджетную линию и переводит потребителя из А в Б. Для U = xy это даёт точки индивидуального спроса (x = 3, Pₓ = 2) и (x = 6, Pₓ = 1).',
    series: [
      { label: 'Бюджет при Pₓ = 2', style: 'curve', points: [[0, 12], [6, 0]] },
      { label: 'Бюджет при Pₓ = 1', style: 'green-line', points: [[0, 12], [12, 0]] },
      { label: 'Два оптимальных набора', style: 'blue-line', points: [[3, 6], [6, 6]] }
    ],
    labels: [{ at: [3, 6], label: 'А' }, { at: [6, 6], label: 'Б' }]
  },
  marginalProduct: {
    title: 'Общий выпуск при фиксированном капитале', x: 'Труд L', y: 'Выпуск Q', max: [10, 20], step: [2, 5],
    caption: 'График становится положе: выпуск продолжает расти, а прибавка от дополнительной единицы труда уменьшается.',
    series: [{ label: 'Капитал фиксирован', style: 'curve', points: sampleCurve(0, 10, l => 6 * Math.sqrt(l)) }]
  },
  isoquant: {
    title: 'Карта изоквант', x: 'Труд L', y: 'Капитал K', max: [10, 10], step: [2, 2],
    caption: 'В этой модели Q = LK. На каждой кривой выпуск постоянен. Убывающий по модулю наклон показывает, что добавочный труд заменяет всё меньше капитала.',
    series: [8, 16, 24].map((value, i) => ({
      label: 'Q = ' + value, style: ['curve', 'green-line', 'blue-line'][i],
      points: sampleCurve(value / 10, 10, l => value / l)
    }))
  },
  factorOptimum: {
    title: 'Касание изокванты и изокосты', x: 'Труд L', y: 'Капитал K', max: [10, 10], step: [2, 2],
    caption: 'При выпуске Q = LK и бюджете L + K = 8 выпуск максимален в точке (4; 4). Для выпуска 16 эта же изокоста показывает минимальные затраты.',
    series: [
      { label: 'Изокоста', style: 'curve', points: [[0, 8], [8, 0]] },
      { label: 'Изокванта Q = 16', style: 'green-line', points: sampleCurve(1.6, 10, l => 16 / l) }
    ],
    labels: [{ at: [4, 4], label: 'Оптимум' }]
  }
});
