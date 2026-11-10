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

const lectureFixedCost = 12.8;
const lectureAvc = q => 3 - 0.6 * q + 0.05 * q ** 2;
const lecturePlantCosts = [[3, 3.5], [6, 2.8], [9, 3.4]].map(([center, minimum]) =>
  q => minimum + 0.1 * (q - center) ** 2
);
const compensatedX = Math.sqrt(72);

Object.assign(graphs, {
  supplyShiftEquilibrium: {
    ...marketAxes, title: 'Равновесие при увеличении предложения',
    caption: 'Спрос D остаётся прежним. Новое равновесие E₁ находится правее и ниже E: объём вырос, а цена снизилась.',
    series: [...marketCurves, { label: 'Новое предложение S₁', style: 'blue-line', points: [[2, 2], [12, 12]] }],
    labels: [equilibriumPoint, { at: [6, 6], label: 'E₁' }]
  },
  stepSurplus: {
    title: 'Выигрыши на ступенчатых кривых', x: 'Количество Q', y: 'Цена P',
    max: [6, 12], step: [1, 2],
    caption: 'Каждая горизонтальная ступень относится к одной или нескольким единицам. При цене 6 продаются первые три единицы. Закрашенные области показывают выигрыш покупателей и продавцов.',
    series: [
      { label: 'Спрос', style: 'curve', points: [[0, 10], [1, 10], [1, 9], [2, 9], [2, 7], [3, 7], [3, 5], [5, 5]] },
      { label: 'Предложение', style: 'green-line', points: [[0, 2], [1, 2], [1, 3], [2, 3], [2, 5], [3, 5], [3, 7], [5, 7]] },
      { label: 'Рыночная цена', style: 'reference-line', points: [[0, 6], [5, 6]] }
    ],
    regions: [
      { label: 'CS', style: 'area-peach', points: [[0, 6], [0, 10], [1, 10], [1, 9], [2, 9], [2, 7], [3, 7], [3, 6]] },
      { label: 'PS', style: 'area-mint', points: [[0, 6], [0, 2], [1, 2], [1, 3], [2, 3], [2, 5], [3, 5], [3, 6]] }
    ]
  },
  incomeExpansion: {
    title: 'Параллельные бюджеты и оптимумы при росте дохода', x: 'Благо X', y: 'Благо Y',
    max: [12, 12], step: [2, 2],
    caption: 'Для U = xy и одинаковых неизменных цен каждый оптимум расположен на луче x = y. Бюджетные линии сдвигаются параллельно, а оптимальные количества обоих товаров растут.',
    series: [
      { label: 'Меньший бюджет', style: 'reference-line', points: [[0, 6], [6, 0]] },
      { label: 'Больший бюджет', style: 'green-line', points: [[0, 12], [12, 0]] },
      { label: 'Доход — потребление', style: 'blue-line', points: [[0, 0], [7, 7]] }
    ],
    labels: [{ at: [3, 3], label: 'A' }, { at: [6, 6], label: 'B' }]
  },
  engelShapes: {
    title: 'Реакция на рост дохода при постоянных ценах', x: 'Доход I', y: 'Количество X',
    max: [10, 10], step: [2, 2],
    caption: 'Три условных случая: с увеличением дохода спрос растёт, остаётся прежним или падает на показанном участке.',
    series: [
      { label: 'Нормальное благо', style: 'green-line', points: [[2, 3], [10, 9]] },
      { label: 'Нейтральное благо', style: 'reference-line', points: [[2, 5], [10, 5]] },
      { label: 'Низшее благо', style: 'curve', points: [[2, 8], [10, 3]] }
    ]
  },
  priceEffects: {
    title: 'Разложение общего эффекта изменения цены', x: 'Благо X', y: 'Благо Y',
    max: [24, 24], step: [4, 4],
    caption: 'В примере U = xy. При снижении цены X движение A → B сохраняет уровень полезности U₀ и показывает эффект замещения. Переход B → C возвращает фактический бюджет и показывает эффект дохода.',
    series: [
      { label: 'Прежний бюджет', style: 'curve', points: [[0, 24], [12, 0]] },
      { label: 'Новый бюджет', style: 'green-line', points: [[0, 24], [24, 0]] },
      { label: 'Компенсированный бюджет', style: 'reference-line', points: [[0, 2 * compensatedX], [2 * compensatedX, 0]] },
      { label: 'Исходная полезность U₀', style: 'blue-line', points: sampleCurve(3, 24, x => 72 / x) },
      { label: 'Более высокая U₁', style: 'blue-line', points: sampleCurve(6, 24, x => 144 / x) }
    ],
    labels: [{ at: [6, 12], label: 'A' }, { at: [compensatedX, compensatedX], label: 'B' }, { at: [12, 12], label: 'C' }]
  },
  giffen: {
    title: 'Восходящий участок спроса на товар Гиффена', x: 'Количество X', y: 'Цена X',
    max: [10, 10], step: [2, 2],
    caption: 'Условная схема. При снижении цены с уровня А до уровня Б количество сокращается: отрицательный эффект дохода по величине больше положительного эффекта замещения.',
    series: [{ label: 'Участок спроса', style: 'curve', points: [[2, 2], [8, 8]] }],
    labels: [{ at: [7, 7], label: 'А' }, { at: [3, 3], label: 'Б' }]
  },
  productCurves: {
    title: 'Средний и предельный продукт труда', x: 'Количество труда L', y: 'Продукт труда',
    max: [6, 30], step: [1, 5],
    caption: 'На схеме AP достигает максимума в точке пересечения с MP. При L = 6 предельный продукт снижается до нуля, и общий выпуск достигает максимума.',
    series: [
      { label: 'Средний продукт AP', style: 'blue-line', points: sampleCurve(0.1, 6, l => 9 * l - l ** 2) },
      { label: 'Предельный продукт MP', style: 'curve', points: sampleCurve(0, 6, l => 18 * l - 3 * l ** 2) }
    ],
    labels: [{ at: [4.5, 20.25], label: 'max AP' }, { at: [6, 0], label: 'MP = 0' }]
  },
  linearIsoquants: {
    title: 'Прямые изокванты совершенных заменителей', x: 'Труд L', y: 'Капитал K',
    max: [10, 10], step: [2, 2],
    caption: 'При Q = L + K одинаковое количество труда всегда заменяет одинаковое количество капитала. Все изокванты имеют один наклон.',
    series: [4, 6, 8].map((q, i) => ({
      label: 'Q = ' + q, style: ['curve', 'green-line', 'blue-line'][i], points: [[0, q], [q, 0]]
    }))
  },
  fixedIsoquants: {
    title: 'Угловые изокванты при фиксированных пропорциях', x: 'Труд L', y: 'Капитал K',
    max: [10, 10], step: [2, 2],
    caption: 'При Q = min(L, K) рост только одного ресурса за углом не повышает выпуск. Чтобы перейти на более высокую изокванту, нужны оба фактора.',
    series: [2, 4, 6].map((q, i) => ({
      label: 'Q = ' + q, style: ['curve', 'green-line', 'blue-line'][i], points: [[q, 10], [q, q], [10, q]]
    }))
  },
  isocostShift: {
    title: 'Как меняется изокоста', x: 'Труд L', y: 'Капитал K', max: [12, 12], step: [2, 2],
    caption: 'Зелёная линия показывает больший бюджет при прежних ценах. Синяя показывает подорожание труда при исходном бюджете: максимум труда уменьшается, максимум капитала остаётся прежним.',
    series: [
      { label: 'Исходная изокоста', style: 'curve', points: [[0, 8], [8, 0]] },
      { label: 'Бюджет вырос', style: 'green-line', points: [[0, 12], [12, 0]] },
      { label: 'Труд подорожал', style: 'blue-line', points: [[0, 8], [4, 0]] }
    ]
  },
  totalCosts: {
    title: 'Общие, постоянные и переменные издержки', x: 'Выпуск Q', y: 'Издержки',
    max: [12, 50], step: [2, 10],
    caption: 'Вертикальное расстояние от TVC до TC равно TFC. При нулевом выпуске общие издержки начинаются на уровне постоянных.',
    series: [
      { label: 'Общие TC', style: 'curve', points: sampleCurve(0, 12, q => q * lectureAvc(q) + lectureFixedCost) },
      { label: 'Переменные TVC', style: 'green-line', points: sampleCurve(0, 12, q => q * lectureAvc(q)) },
      { label: 'Постоянные TFC', style: 'reference-line', points: [[0, lectureFixedCost], [12, lectureFixedCost]] }
    ]
  },
  averageCosts: {
    title: 'Кривые AFC, AVC, ATC и MC', x: 'Выпуск Q', y: 'Издержки на единицу',
    max: [12, 12], step: [2, 2],
    caption: 'MC пересекает AVC и ATC в их минимумах. AFC падает с ростом выпуска, поэтому разница между ATC и AVC сокращается.',
    series: [
      { label: 'MC', style: 'curve', points: sampleCurve(2, 12, q => 3 - 1.2 * q + 0.15 * q ** 2) },
      { label: 'AVC', style: 'green-line', points: sampleCurve(2, 12, lectureAvc) },
      { label: 'ATC', style: 'blue-line', points: sampleCurve(2, 12, q => lectureAvc(q) + lectureFixedCost / q) },
      { label: 'AFC', style: 'reference-line', points: sampleCurve(2, 12, q => lectureFixedCost / q) }
    ],
    labels: [{ at: [6, 1.2], label: 'min AVC' }, { at: [8, 3], label: 'min ATC' }]
  },
  longRunEnvelope: {
    title: 'LRAC как нижняя огибающая краткосрочных кривых', x: 'Выпуск Q', y: 'Издержки на единицу',
    max: [12, 12], step: [2, 2],
    caption: 'Три тонкие кривые соответствуют трём мощностям. При каждом Q долгосрочная кривая следует за самой низкой из доступных кривых.',
    series: [
      ...lecturePlantCosts.map((cost, i) => ({
        label: 'Мощность ' + (i + 1), style: ['reference-line', 'green-line', 'blue-line'][i],
        points: sampleCurve(1, 12, cost)
      })),
      { label: 'LRAC', style: 'curve', points: sampleCurve(1, 12, q => Math.min(...lecturePlantCosts.map(cost => cost(q)))) }
    ]
  }
});
