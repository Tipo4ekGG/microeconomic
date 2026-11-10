// Diagrams identified in the lecture photos. Repeated panels share one entry.
const slideSeries = (label, style, points) => ({ label, style, points });
const slidePoint = (x, y, label, options = {}) => ({ at: [x, y], label, ...options });
const slideGuide = points => slideSeries('', 'guide-line', points);
const goodsAxes = { x: 'Благо X', y: 'Благо Y', max: [12, 12], step: [2, 2] };
const budgetLine = (label, style, x, y) => slideSeries(label, style, [[0, y], [x, 0]]);
const higherDemand = slideSeries('D₊ · рост спроса', 'blue-line', [[2, 12], [12, 2]]);
const lowerDemand = slideSeries('D₋ · спад спроса', 'violet-line', [[0, 10], [10, 0]]);
const higherSupply = slideSeries('S₊ · рост предложения', 'blue-line', [[0, 0], [12, 12]]);
const lowerSupply = slideSeries('S₋ · спад предложения', 'violet-line', [[0, 4], [8, 12]]);

Object.assign(graphs.marketDemand, {
  caption: 'A и B — разные точки на исходной D. При изменении неценовых факторов вся кривая смещается: рост спроса вправо, снижение влево.',
  series: [demandCurve, higherDemand, lowerDemand],
  labels: [slidePoint(4, 8, 'A'), slidePoint(8, 4, 'B')]
});

Object.assign(graphs.marketSupply, {
  caption: 'Изменение цены переводит продавца из A в B на прежней S. Рост предложения сдвигает кривую вправо, сокращение — влево.',
  series: [supplyCurve, higherSupply, lowerSupply],
  labels: [slidePoint(3, 5, 'A'), slidePoint(7, 9, 'B')]
});

Object.assign(graphs.marketEquilibrium, {
  title: 'Равновесие при росте и падении спроса',
  caption: 'При неизменном предложении рост спроса переводит рынок из E в E₊, повышая цену и объём. Спад спроса ведёт к E₋ с меньшими ценой и объёмом.',
  series: [...marketCurves, higherDemand, lowerDemand],
  labels: [equilibriumPoint, slidePoint(6, 8, 'E₊'), slidePoint(4, 6, 'E₋', { dx: -8, anchor: 'end' })]
});

Object.assign(graphs.supplyShiftEquilibrium, {
  title: 'Равновесие при росте и падении предложения',
  caption: 'Спрос остаётся прежним. Рост предложения ведёт к E₊ с большей величиной продаж и меньшей ценой, а спад — к E₋ с меньшей величиной продаж и большей ценой.',
  series: [...marketCurves, higherSupply, lowerSupply],
  labels: [equilibriumPoint, slidePoint(6, 6, 'E₊'), slidePoint(4, 8, 'E₋', { dx: -8, anchor: 'end' })]
});

Object.assign(graphs, {
  supplyRise: {
    ...marketAxes, title: 'Рост предложения при прежнем спросе',
    caption: 'Сдвиг предложения вправо переводит рынок из E в E₁. Равновесная цена падает с 7 до 6, а объём растёт с 5 до 6.',
    series: [...marketCurves, higherSupply, slideGuide([[0, 6], [6, 6], [6, 0]])],
    labels: [equilibriumPoint, slidePoint(6, 6, 'E₁')]
  },
  supplyFall: {
    ...marketAxes, title: 'Сокращение предложения при прежнем спросе',
    caption: 'Сдвиг предложения влево переводит рынок из E в E₁. Равновесная цена растёт с 7 до 8, а объём падает с 5 до 4.',
    series: [...marketCurves, lowerSupply, slideGuide([[0, 8], [4, 8], [4, 0]])],
    labels: [equilibriumPoint, slidePoint(4, 8, 'E₁', { dx: -8, anchor: 'end' })]
  },
  mrtsVariation: {
    x: 'Труд L', y: 'Капитал K', max: [10, 10], step: [2, 2],
    title: 'Убывающая норма замещения вдоль изокванты',
    caption: 'На отрезке A → B две единицы труда заменяют четыре единицы капитала. На B → C четыре единицы труда заменяют две. Средняя MRTS падает с 2 до 0,5.',
    series: [slideSeries('Изокванта Q = 16', 'green-line', sampleCurve(1.6, 10, l => 16 / l)),
      slideGuide([[2, 8], [2, 4], [4, 4]]), slideGuide([[4, 4], [4, 2], [8, 2]])],
    labels: [slidePoint(2, 8, 'A'), slidePoint(4, 4, 'B'), slidePoint(8, 2, 'C')]
  },
  marketImbalance: {
    ...marketAxes, title: 'Дефицит и избыток при отклонении от равновесной цены',
    caption: 'Ниже равновесной цены при P = 5 покупатели хотят 7, а продавцы предлагают 3. Выше неё при P = 9 ситуация обратная. Цветные отрезки показывают разницу в объёмах.',
    series: [...marketCurves, slideSeries('Избыток при P = 9', 'violet-line', [[3, 9], [7, 9]]),
      slideSeries('Дефицит при P = 5', 'blue-line', [[3, 5], [7, 5]]),
      slideGuide([[0, 5], [3, 5]]), slideGuide([[0, 9], [3, 9]]),
      slideGuide([[3, 0], [3, 9]]), slideGuide([[7, 0], [7, 9]])],
    labels: [equilibriumPoint, slidePoint(3, 9, 'Qᴅ'), slidePoint(7, 9, 'Qₛ'),
      slidePoint(3, 5, 'Qₛ'), slidePoint(7, 5, 'Qᴅ')]
  },
  marketDemandSteps: {
    title: 'Суммирование индивидуального спроса по горизонтали', x: 'Совокупное количество, кг', y: 'Готовность платить',
    max: [20, 60], step: [5, 10],
    caption: 'На слайде пять ступеней с накопленным объёмом 1, 4, 9, 15 и 19 кг. При цене 25 покупают 9 кг, а выигрыш покупателей равен площади закрашенных прямоугольников.',
    series: [
      slideSeries('Рыночный спрос', 'curve', [[0, 50], [1, 50], [1, 40], [4, 40], [4, 30], [9, 30], [9, 20], [15, 20], [15, 15], [19, 15]]),
      slideSeries('Рыночная цена 25', 'reference-line', [[0, 25], [19, 25]])
    ],
    regions: [{ label: 'Выигрыш покупателя', style: 'area-peach', points: [[0, 25], [0, 50], [1, 50], [1, 40], [4, 40], [4, 30], [9, 30], [9, 25]] }],
    labels: [slidePoint(9, 25, '9 кг')]
  },
  arcElasticity: {
    title: 'Дуговая эластичность между двумя точками', x: 'Количество Q', y: 'Цена P',
    max: [150, 120], step: [25, 20],
    caption: 'На слайде цена меняется с 80 до 40, а объём с 50 до 100. Разности делят на средние значения: эластичность равна (50/75) ÷ (−40/60) = −1.',
    series: [
      slideSeries('Спрос D', 'curve', sampleCurve(4000 / 120, 150, q => 4000 / q)),
      slideSeries('Отрезок между точками', 'blue-line', [[50, 80], [100, 40]]),
      slideGuide([[0, 80], [50, 80], [50, 0]]), slideGuide([[0, 40], [100, 40], [100, 0]])
    ],
    labels: [slidePoint(50, 80, 'A'), slidePoint(100, 40, 'B')]
  },
  demandElasticityCases: {
    ...marketAxes, title: 'Эластичный, неэластичный и предельные случаи спроса',
    caption: 'Все кривые сравниваются в точке E. При той же цене пологая линия даёт больший отклик количества, крутая — меньший. Вертикальная и горизонтальная линии показывают два предельных случая.',
    series: [
      slideSeries('Эластичный в E', 'curve', [[0, 9], [12, 3]]),
      slideSeries('Неэластичный в E', 'green-line', [[3, 12], [9, 0]]),
      slideSeries('Совершенно неэластичный', 'blue-line', [[6, 0], [6, 12]]),
      slideSeries('Совершенно эластичный', 'violet-line', [[0, 6], [12, 6]])
    ],
    labels: [slidePoint(6, 6, 'E')]
  },
  utilityIncrements: {
    title: 'Предельная полезность по единицам потребления', x: 'Номер единицы Q', y: 'Предельная полезность MU',
    max: [5, 6], step: [1, 1],
    caption: 'На слайде четыре единицы дают 5, 4, 2 и 1 ютиль. Их сумма составляет 12, хотя каждая следующая единица приносит меньше предыдущей.',
    series: [slideSeries('Предельная полезность каждой единицы', 'curve', [[0.5, 5], [1.5, 5], [1.5, 4], [2.5, 4], [2.5, 2], [3.5, 2], [3.5, 1], [4.5, 1]])],
    regions: [5, 4, 2, 1].map((value, i) => ({
      label: '', style: 'area-peach', points: [[i + 0.5, 0], [i + 0.5, value], [i + 1.5, value], [i + 1.5, 0]]
    })),
    labels: [5, 4, 2, 1].map((value, i) => slidePoint(i + 1, value, String(value)))
  },
  indifferenceSpecial: {
    ...goodsAxes, title: 'Кривые безразличия для заменителей и дополнителей',
    caption: 'При U = x + y блага заменяются в постоянной пропорции. При U = min(x, y) полезность определяется тем благом, которого меньше, и кривая имеет угол.',
    series: [
      slideSeries('Совершенные заменители', 'curve', [[0, 8], [8, 0]]),
      slideSeries('Совершенные дополнители', 'blue-line', [[4, 12], [4, 4], [12, 4]])
    ],
    labels: [slidePoint(4, 4, 'Угол')]
  },
  incomeDemandShift: {
    ...marketAxes, title: 'Как рост дохода сдвигает спрос на нормальное благо',
    caption: 'По горизонтали при прежней цене видно, что с ростом дохода покупатель выбирает больше X. Это сдвиг кривой спроса, а не движение вдоль неё.',
    series: [lowerDemand, demandCurve, higherDemand, slideGuide([[0, 6], [8, 6]])],
    labels: [slidePoint(4, 6, 'A', { dx: -8, anchor: 'end' }), slidePoint(6, 6, 'B'), slidePoint(8, 6, 'C')]
  },
  incomeOtherGoods: {
    ...goodsAxes, title: 'Линии «доход — потребление» для низшего и нейтрального блага',
    caption: 'На трёх параллельных бюджетных линиях показаны два условных случая. Для нейтрального X количество постоянно, а для низшего X сокращается по мере роста дохода.',
    series: [
      ...[6, 9, 12].map((income, i) => budgetLine(i === 0 ? 'Бюджеты при разных доходах' : '', 'reference-line', income, income)),
      slideSeries('X нейтральное', 'blue-line', [[5, 1], [5, 4], [5, 7]]),
      slideSeries('X низшее', 'curve', [[3.4, 2.6], [2.8, 6.2], [2, 10]])
    ],
    labels: [slidePoint(5, 1, 'N₁'), slidePoint(5, 4, 'N₂'), slidePoint(5, 7, 'N₃'),
      slidePoint(3.4, 2.6, 'I₁', { dx: -8, anchor: 'end' }), slidePoint(2.8, 6.2, 'I₂', { dx: -8, anchor: 'end' }),
      slidePoint(2, 10, 'I₃', { dx: -8, anchor: 'end' })]
  },
  engelTurning: {
    title: 'Кривая Энгеля с переходом к низшему благу', x: 'Количество X', y: 'Доход I',
    max: [10, 12], step: [2, 2],
    caption: 'Как на слайде, доход показан по вертикали. При доходе до I₀ количество растёт, а после I₀ снижается. Категория зависит от диапазона дохода.',
    series: [
      slideSeries('Нормальное при I < I₀', 'green-line', sampleCurve(0, 6, i => 2 * i - i ** 2 / 6).map(([i, x]) => [x, i])),
      slideSeries('Низшее при I > I₀', 'curve', sampleCurve(6, 11, i => 6 - (i - 6) ** 2 / 10).map(([i, x]) => [x, i])),
      slideGuide([[0, 6], [6, 6]])
    ],
    labels: [slidePoint(6, 6, 'I₀')]
  },
  giffenDecomposition: {
    title: 'Почему эффект дохода перевешивает у товара Гиффена', x: 'Благо X', y: 'Благо Y',
    max: [24, 24], step: [4, 4],
    caption: 'При снижении цены X замещение ведёт из A вправо к B. Эффект дохода ведёт из B влево к C. Итоговое количество X меньше исходного.',
    series: [
      budgetLine('Прежний бюджет', 'curve', 12, 24), budgetLine('Новый бюджет', 'green-line', 24, 24),
      budgetLine('Компенсированный бюджет', 'reference-line', 2 * compensatedX, 2 * compensatedX),
      slideSeries('Исходная полезность', 'blue-line', sampleCurve(3, 24, x => 72 / x)),
      slideSeries('Новая полезность', 'violet-line', sampleCurve(3.2, 24, x => 19 + 1 / (x - 3))),
      slideGuide([[4, 0], [4, 20]]), slideGuide([[6, 0], [6, 12]]), slideGuide([[compensatedX, 0], [compensatedX, compensatedX]])
    ],
    labels: [slidePoint(6, 12, 'A'), slidePoint(compensatedX, compensatedX, 'B'), slidePoint(4, 20, 'C')]
  }
});

Object.assign(graphs.mrs, {
  title: 'Предельная норма замещения на кривой безразличия',
  caption: 'В примере со слайда переход A → B даёт одну дополнительную единицу X ценой шести единиц Y. По мере продвижения вправо за очередную единицу X отдают всё меньше Y.',
  max: [6, 16], step: [1, 4],
  series: [
    slideSeries('Одинаковая полезность', 'green-line', [[1, 15], [2, 9], [3, 5], [4, 3], [5, 2]]),
    slideGuide([[1, 15], [1, 9], [2, 9]])
  ],
  labels: [slidePoint(1, 15, 'A'), slidePoint(2, 9, 'B'), slidePoint(3, 5, 'C'), slidePoint(4, 3, 'D'), slidePoint(5, 2, 'E')]
});

Object.assign(graphs.pricePath, {
  max: [24, 24], step: [4, 4],
  caption: 'Доход 24 и цена Y, равная 1, постоянны. При U = xy снижение цены X с 4 до 2 и затем до 1 поворачивает бюджетную линию. Оптимумы A, B, C дают три точки индивидуального спроса.',
  series: [
    budgetLine('Бюджет при Pₓ = 4', 'curve', 6, 24),
    budgetLine('Бюджет при Pₓ = 2', 'green-line', 12, 24),
    budgetLine('Бюджет при Pₓ = 1', 'violet-line', 24, 24),
    slideSeries('Линия «цена — потребление»', 'blue-line', [[3, 12], [6, 12], [12, 12]])
  ],
  labels: [slidePoint(3, 12, 'A'), slidePoint(6, 12, 'B'), slidePoint(12, 12, 'C')]
});

Object.assign(graphs.demand, {
  title: 'Индивидуальный спрос из трёх оптимумов',
  caption: 'Это те же A, B, C, что на графике «цена — потребление». На горизонтальной оси количество X, а по вертикали теперь его цена.',
  max: [16, 6], step: [4, 1],
  series: [slideSeries('Спрос Pₓ = 12 / x', 'curve', sampleCurve(2, 16, x => 12 / x))],
  labels: [slidePoint(3, 4, 'A'), slidePoint(6, 2, 'B'), slidePoint(12, 1, 'C')]
});

Object.assign(graphs.giffen, {
  max: [8, 3], step: [2, 1],
  caption: 'Из схемы разложения получаем две точки: при цене 2 исходное количество равно 6, при цене 1 новое количество равно 4. Участок спроса восходящий.',
  series: [slideSeries('Спрос на товар Гиффена', 'curve', [[4, 1], [6, 2]])],
  labels: [slidePoint(6, 2, 'A'), slidePoint(4, 1, 'C')]
});

const slideTotalProduct = labor => 9 * labor ** 2 - labor ** 3;
const slideAverageProduct = labor => 9 * labor - labor ** 2;
const slideMarginalProduct = labor => 18 * labor - 3 * labor ** 2;

Object.assign(graphs.marginalProduct, {
  title: 'Общий продукт: ускорение, убывающая отдача и максимум',
  caption: 'При фиксированном капитале TP сначала растёт всё быстрее, затем медленнее. В точке максимума TP предельный продукт равен нулю, а дальше становится отрицательным.',
  max: [8, 120], step: [2, 30],
  series: [slideSeries('Общий продукт TP', 'curve', sampleCurve(0, 7.5, slideTotalProduct)),
    slideGuide([[6, 0], [6, 108]])],
  labels: [slidePoint(3, 54, 'max MP', { dx: 7, dy: 16 }), slidePoint(6, 108, 'max TP')]
});

Object.assign(graphs.productCurves, {
  min: [0, -40], max: [8, 30], step: [2, 10],
  caption: 'AP достигает максимума в точке пересечения с MP. При L = 6 предельный продукт равен нулю, а дальше отрицателен. Графики TP, AP и MP построены для одной модели.',
  series: [
    slideSeries('Средний продукт AP', 'blue-line', sampleCurve(0.1, 7.5, slideAverageProduct)),
    slideSeries('Предельный продукт MP', 'curve', sampleCurve(0, 7.5, slideMarginalProduct))
  ],
  labels: [slidePoint(3, 27, 'max MP', { dx: -8, anchor: 'end' }), slidePoint(4.5, 20.25, 'max AP'), slidePoint(6, 0, 'MP = 0')]
});

Object.assign(graphs.isoquant, {
  caption: 'На карте каждая линия соответствует своему выпуску. A и B лежат на изокванте Q = 16: переход от A к B добавляет 2 единицы труда и экономит 4 единицы капитала.',
  series: [...graphs.isoquant.series, slideGuide([[2, 8], [2, 4], [4, 4]])],
  labels: [slidePoint(2, 8, 'A'), slidePoint(4, 4, 'B')]
});

Object.assign(graphs.averageCosts, {
  toggleSeries: true,
  labels: [
    slidePoint(6, 1.2, 'min AVC', { dx: -8, anchor: 'end', dy: 16, requires: [0, 1] }),
    slidePoint(8, 3, 'min ATC', { requires: [0, 2] })
  ]
});

const smoothLrac = q => 2 + 0.045 * (q - 6) ** 2;
Object.assign(graphs, {
  productivityCosts: {
    title: 'Связь между MP, AP и минимумами MC и AVC', x: 'Выпуск Q', y: 'Издержки на единицу',
    max: [110, 10], step: [20, 2],
    caption: 'При ставке труда 36, MC = 36/MP, а AVC = 36/AP. Максимум MP при L = 3 даёт минимум MC, а максимум AP при L = 4,5 даёт минимум AVC и пересечение MC с AVC.',
    series: [
      slideSeries('MC = w / MP', 'curve', sampleCurve(1, 5.75, l => 36 / slideMarginalProduct(l)).map(([l, cost]) => [slideTotalProduct(l), cost])),
      slideSeries('AVC = w / AP', 'blue-line', sampleCurve(1, 6, l => 36 / slideAverageProduct(l)).map(([l, cost]) => [slideTotalProduct(l), cost]))
    ],
    labels: [
      slidePoint(slideTotalProduct(3), 36 / slideMarginalProduct(3), 'min MC', { dx: -8, anchor: 'end', dy: 16 }),
      slidePoint(slideTotalProduct(4.5), 36 / slideAverageProduct(4.5), 'min AVC')
    ]
  },
  longRunSmooth: {
    title: 'Плавная долгосрочная огибающая при непрерывном выборе мощности',
    x: 'Выпуск Q', y: 'Средние издержки', max: [12, 7], step: [2, 1],
    caption: 'При непрерывном выборе мощности кривая LRAC касается краткосрочной кривой оптимальной мощности для каждого выпуска. Это отличается от огибающей из нескольких отдельных вариантов.',
    series: [
      ...[2, 4, 6, 8, 10].map((capacity, i) => slideSeries(i === 0 ? 'Краткосрочные кривые SRAC' : '', 'guide-line',
        sampleCurve(capacity - 2, capacity + 2, q => smoothLrac(q) + 0.42 * (q - capacity) ** 2))),
      slideSeries('Долгосрочная LRAC', 'curve', sampleCurve(0, 12, smoothLrac))
    ],
    labels: [slidePoint(6, 2, 'min LRAC', { dy: 16 })]
  }
});

const slideGraphGroups = {
  'market-demand': ['marketDemand', 'marketDemandSteps'],
  'market-equilibrium': ['marketEquilibrium', 'marketImbalance'],
  'price-elasticity': ['priceElasticity', 'arcElasticity', 'demandElasticityCases'],
  'total-utility': ['utilityIncrements'],
  'indifference-shapes': ['indifferenceMap', 'indifferenceSpecial'],
  'income-path': ['incomeExpansion', 'incomeDemandShift', 'incomeInferior', 'incomeNeutral', 'incomeOtherGoods'],
  'engel-shapes': ['engelShapes', 'engelTurning'],
  giffen: ['giffenDecomposition', 'giffen'],
  'cost-product-link': ['productivityCosts'],
  'long-run-cost': ['longRunEnvelope', 'longRunSmooth']
};

const slideGraphSources = {
  arcElasticity: '0418',
  priceElasticity: '0419 0420',
  demandElasticityCases: '0422 0425',
  marketDemand: '0426 0427',
  marketSupply: '0429 0430 0433 0434',
  supplyElasticity: '0431',
  marketImbalance: '0436 0437',
  marketEquilibrium: '0438',
  supplyShiftEquilibrium: '0439 0440',
  supplyRise: '0439',
  supplyFall: '0440',
  marketDemandSteps: '0444',
  stepSurplus: '0556 0557',
  surplus: '0556 0557 0558',
  utilityIncrements: '0561',
  mrs: '0567 0745 0752',
  pricePath: '0704 0705',
  demand: '0704 0705',
  incomeExpansion: '0706 0707 0709',
  incomeDemandShift: '0706 0707',
  incomeOtherGoods: '0708',
  incomeInferior: '0708',
  incomeNeutral: '0708',
  engel: '0709',
  engelTurning: '0710',
  priceEffects: '0711 0712 0713',
  giffenDecomposition: '0714 0715',
  giffen: '0715',
  indifferenceSpecial: '0746',
  budget: '0747 0748 0749',
  optimum: '0750 0754',
  marginalProduct: '0759 0764',
  productCurves: '0764 1131',
  isoquant: '0769 0770 0771 0773',
  linearIsoquants: '0774',
  fixedIsoquants: '0774',
  isocostShift: '0776 0777',
  totalCosts: '1120',
  averageCosts: '1122 1124 1125 1126 1129 1130',
  productivityCosts: '1131',
  longRunEnvelope: '1133',
  longRunSmooth: '1134'
};

const soybeanCurves = [
  slideSeries('Спрос D', 'curve', [[5, 3.5], [20, 3], [35, 2.5], [50, 1.75], [60, 1.25]]),
  slideSeries('Предложение S', 'green-line', [[0, 0.3], [25, 1.75], [35, 2.5], [40, 3], [48, 4]])
];
function soybeanMarket(title, caption, priceLevel, left, right, label) {
  return {
    title, caption, x: 'Соя, тыс. бушелей', y: 'Цена за бушель, $', max: [60, 4], step: [10, 1],
    series: [...soybeanCurves, slideSeries(label, 'blue-line', [[left, priceLevel], [right, priceLevel]]),
      slideGuide([[0, priceLevel], [left, priceLevel]]), slideGuide([[left, 0], [left, priceLevel]]),
      slideGuide([[right, 0], [right, priceLevel]]), slideGuide([[0, 2.5], [35, 2.5], [35, 0]])],
    labels: [slidePoint(35, 2.5, 'E'), slidePoint(left, priceLevel, 'Q = ' + left, { dx: -7, anchor: 'end' }),
      slidePoint(right, priceLevel, 'Q = ' + right)]
  };
}
function demandCase(title, caption, points, from, to) {
  return {
    ...marketAxes, title, caption,
    series: [slideSeries('Спрос D', 'curve', points),
      ...[from, to].map(([q, p]) => slideGuide([[0, p], [q, p], [q, 0]]))],
    labels: [slidePoint(...from, 'A'), slidePoint(...to, 'B')]
  };
}
function separateCost(title, caption, label, fn, mark) {
  return {
    title, caption, x: 'Выпуск Q', y: 'Издержки на единицу', max: [12, 12], step: [2, 2],
    series: [slideSeries(label, 'curve', sampleCurve(2, 12, fn))], labels: mark ? [mark] : []
  };
}
const budgetAxes = { x: 'Благо X', y: 'Благо Y', max: [24, 24], step: [4, 4] };
const oldUtility = slideSeries('Исходная полезность U₀', 'blue-line', sampleCurve(3, 24, x => 72 / x));
const newUtility = slideSeries('Новая полезность U₁', 'violet-line', sampleCurve(6, 24, x => 144 / x));
const oldBudget = budgetLine('Исходный бюджет', 'curve', 12, 24);
const newBudget = budgetLine('Новый бюджет', 'green-line', 24, 24);
const compensatedBudget = budgetLine('Компенсированный бюджет', 'reference-line', 2 * compensatedX, 2 * compensatedX);
const fixedAverage = q => lectureFixedCost / q;
const totalAverage = q => fixedAverage(q) + lectureAvc(q);
const marginCost = q => 3 - 1.2 * q + 0.15 * q ** 2;

Object.assign(graphs, {
  incomeInferior: {
    ...goodsAxes, title: 'Линия «доход — потребление» для низшего блага',
    caption: 'С ростом дохода бюджеты сдвигаются вправо. Покупатель выбирает меньше X, поэтому точки выбора поднимаются влево.',
    series: [...graphs.incomeOtherGoods.series.slice(0, 3), graphs.incomeOtherGoods.series[4]],
    labels: graphs.incomeOtherGoods.labels.slice(3)
  },
  incomeNeutral: {
    ...goodsAxes, title: 'Линия «доход — потребление» для нейтрального блага',
    caption: 'При любом из трёх бюджетов покупатель выбирает 5 единиц X. Точки выбора лежат на вертикальной линии.',
    series: graphs.incomeOtherGoods.series.slice(0, 4),
    labels: graphs.incomeOtherGoods.labels.slice(0, 3)
  },
  supplyMovement: {
    ...marketAxes, title: 'Движение вдоль кривой предложения',
    caption: 'Технология и цены ресурсов постоянны. Изменение собственной цены переводит продавца из A в B по той же кривой S.',
    series: [slideSeries('Предложение S', 'green-line', sampleCurve(0, 10, q => 2 + q ** 2 / 10)),
      slideGuide([[0, 2.9], [3, 2.9], [3, 0]]), slideGuide([[0, 8.4], [8, 8.4], [8, 0]])],
    labels: [slidePoint(3, 2.9, 'A'), slidePoint(8, 8.4, 'B')]
  },
  soybeanShortage: soybeanMarket('Дефицит на рынке сои при цене 1,75',
    'В примере со слайда равновесие при 2,50 доллара за бушель и объёме 35 тыс. При цене 1,75 спрос составляет 50 тыс., предложение 25 тыс. Дефицит равен 25 тыс. бушелей.', 1.75, 25, 50, 'Дефицит'),
  soybeanSurplus: soybeanMarket('Избыток на рынке сои при цене 3,00',
    'При цене 3 доллара производители предлагают 40 тыс. бушелей, а покупатели хотят 20 тыс. Избыток предложения равен 20 тыс. бушелей.', 3, 20, 40, 'Избыток'),
  consumerSurplusOnly: {
    ...marketAxes, title: 'Выигрыш потребителей при заданной цене',
    caption: 'Закрашена площадь под кривой спроса и над ценой. Каждая купленная единица приносит разницу между готовностью платить и фактической ценой.',
    series: [demandCurve, slideSeries('Цена сделки', 'reference-line', [[0, 7], [5, 7]])],
    regions: [{ label: 'CS', style: 'area-peach', points: [[0, 12], [0, 7], [5, 7]] }],
    labels: [slidePoint(5, 7, 'Объём сделки')]
  },
  producerSurplusOnly: {
    ...marketAxes, title: 'Выигрыш производителей при заданной цене',
    caption: 'Закрашена площадь над кривой предложения и под ценой. Она складывается из выигрышей по всем проданным единицам.',
    series: [supplyCurve, slideSeries('Цена сделки', 'reference-line', [[0, 7], [5, 7]])],
    regions: [{ label: 'PS', style: 'area-mint', points: [[0, 2], [0, 7], [5, 7]] }],
    labels: [slidePoint(5, 7, 'Объём сделки')]
  },
  perfectlyInelasticDemand: demandCase('Совершенно неэластичный спрос',
    'Цена меняется с 9 до 3, а объём остаётся равен 6. Вертикальная линия соответствует нулевой эластичности.',
    [[6, 0], [6, 12]], [6, 9], [6, 3]),
  inelasticDemand: demandCase('Неэластичный спрос на выбранном участке',
    'Между A и B количество меняется в процентах меньше, чем цена. Модуль дуговой эластичности на этом отрезке меньше 1.',
    [[4, 12], [7, 0]], [5, 8], [6, 4]),
  elasticDemand: demandCase('Эластичный спрос на выбранном участке',
    'Между A и B объём меняется в процентах больше, чем цена. При показанном снижении цены выручка растёт.',
    [[0, 9], [12, 6]], [4, 8], [8, 7]),
  perfectlyElasticDemand: demandCase('Совершенно эластичный спрос',
    'При заданной цене 6 может покупаться разное количество. Горизонтальная линия показывает предельный случай совершенной эластичности.',
    [[0, 6], [12, 6]], [3, 6], [9, 6]),
  substitutes: {
    ...goodsAxes, title: 'Совершенные заменители: прямые кривые безразличия',
    caption: 'При U = x + y наклон постоянен. Каждая прямая соответствует одному уровню полезности.',
    series: [4, 8, 12].map((u, i) => budgetLine('U = ' + u, ['curve', 'green-line', 'blue-line'][i], u, u))
  },
  complements: {
    ...goodsAxes, title: 'Совершенные дополнители: угловые кривые безразличия',
    caption: 'При U = min(x, y) добавление только одного блага за углом не повышает полезность. Чтобы перейти на следующую кривую, нужны оба блага.',
    series: [2, 4, 6].map((u, i) => slideSeries('U = ' + u, ['curve', 'green-line', 'blue-line'][i], [[u, 12], [u, u], [12, u]]))
  },
  budgetChanges: {
    ...goodsAxes, title: 'Поворот и параллельный сдвиг бюджетной линии',
    caption: 'При росте дохода линия сдвигается параллельно. Если меняется только цена X, пересечение с осью Y сохраняется.',
    series: [budgetLine('Исходный бюджет', 'reference-line', 8, 8), budgetLine('Доход вырос', 'green-line', 12, 12),
      budgetLine('Цена X выросла', 'curve', 4, 8), budgetLine('Цена Y выросла', 'blue-line', 8, 4)]
  },
  substitutionOnly: {
    ...budgetAxes, title: 'Эффект замещения при прежней полезности',
    caption: 'Переход A → B происходит по одной кривой безразличия. При новых относительных ценах покупатель заменяет часть Y подешевевшим X.',
    series: [oldBudget, compensatedBudget, oldUtility, slideGuide([[6, 0], [6, 12]]), slideGuide([[compensatedX, 0], [compensatedX, compensatedX]])],
    labels: [slidePoint(6, 12, 'A'), slidePoint(compensatedX, compensatedX, 'B')]
  },
  incomeEffectOnly: {
    ...budgetAxes, title: 'Эффект дохода при новых ценах',
    caption: 'Компенсированный и новый бюджеты параллельны: цены одинаковы. Переход B → C показывает реакцию на выросшую покупательную способность.',
    series: [compensatedBudget, newBudget, oldUtility, newUtility, slideGuide([[compensatedX, 0], [compensatedX, compensatedX]]), slideGuide([[12, 0], [12, 12]])],
    labels: [slidePoint(compensatedX, compensatedX, 'B'), slidePoint(12, 12, 'C')]
  },
  isoquantTradeoff: {
    x: 'Труд L', y: 'Капитал K', max: [10, 10], step: [2, 2],
    title: 'Замена капитала трудом на одной изокванте',
    caption: 'A и B дают одинаковый выпуск. Переход вправо на 2 единицы труда позволяет сократить капитал на 4. Средняя норма замещения на отрезке равна 2.',
    series: [slideSeries('Изокванта Q = 16', 'green-line', sampleCurve(1.6, 10, l => 16 / l)), slideGuide([[2, 8], [2, 4], [4, 4]])],
    labels: [slidePoint(2, 8, 'A'), slidePoint(4, 4, 'B')]
  },
  isocostIntercepts: {
    x: 'Труд L', y: 'Капитал K', max: [12, 12], step: [2, 2],
    title: 'Пересечения изокосты с осями',
    caption: 'На горизонтальной оси максимум труда TC/w, на вертикальной максимум капитала TC/r. Наклон равен −w/r.',
    series: [budgetLine('Изокоста', 'curve', 10, 8)],
    labels: [slidePoint(0, 8, 'TC/r'), slidePoint(10, 0, 'TC/w', { dx: -8, anchor: 'end' })]
  },
  isocostBudget: {
    x: 'Труд L', y: 'Капитал K', max: [12, 12], step: [2, 2],
    title: 'Параллельный сдвиг изокосты при изменении бюджета',
    caption: 'Цены ресурсов постоянны, поэтому наклон прежний. Больший бюджет увеличивает оба пересечения с осями.',
    series: [budgetLine('Меньший бюджет', 'reference-line', 6, 6), budgetLine('Больший бюджет', 'green-line', 11, 11)]
  },
  isocostPrice: {
    x: 'Труд L', y: 'Капитал K', max: [12, 12], step: [2, 2],
    title: 'Поворот изокосты при изменении цены труда',
    caption: 'Цена капитала и бюджет постоянны. При подорожании труда пересечение с осью L сдвигается влево, пересечение с осью K сохраняется.',
    series: [budgetLine('Исходная цена труда', 'reference-line', 11, 9), budgetLine('Труд подорожал', 'curve', 6, 9)]
  },
  fixedCostCurve: separateCost('Средние постоянные издержки AFC',
    'Одну и ту же сумму постоянных затрат распределяют на растущий выпуск, поэтому AFC непрерывно падает.', 'AFC', fixedAverage),
  variableCostCurve: separateCost('Средние переменные издержки AVC',
    'Средние переменные издержки сначала падают, затем растут. На схеме их минимум приходится на выпуск 6.', 'AVC', lectureAvc, slidePoint(6, 1.2, 'min AVC')),
  totalAverageCurve: {
    ...separateCost('Средние общие издержки ATC',
      'ATC лежит выше AVC. Расстояние между линиями равно AFC и уменьшается по мере роста выпуска.', 'ATC', totalAverage, slidePoint(8, 3, 'min ATC')),
    series: [slideSeries('ATC', 'curve', sampleCurve(2, 12, totalAverage)), slideSeries('AVC', 'green-line', sampleCurve(2, 12, lectureAvc))]
  },
  averageCostSum: {
    title: 'ATC как вертикальная сумма AFC и AVC', x: 'Выпуск Q', y: 'Издержки на единицу', max: [12, 12], step: [2, 2],
    caption: 'При любом выпуске складывают высоты AFC и AVC. Полученная высота — ATC. Здесь показаны только средние издержки.',
    series: [slideSeries('AFC', 'reference-line', sampleCurve(2, 12, fixedAverage)),
      slideSeries('AVC', 'green-line', sampleCurve(2, 12, lectureAvc)),
      slideSeries('ATC', 'blue-line', sampleCurve(2, 12, totalAverage))]
  },
  marginalCostCurve: separateCost('Предельные издержки MC',
    'MC показывает, сколько стоит добавить ещё одну единицу выпуска. На схеме кривая сначала падает, а затем растёт из-за убывающей отдачи.', 'MC', marginCost, slidePoint(4, 0.6, 'min MC')),
  productivityForCosts: {
    title: 'Максимумы AP и MP перед переходом к издержкам', x: 'Труд L', y: 'Производительность',
    max: [6, 30], step: [1, 5],
    caption: 'На верхней схеме слайда отмечены максимум MP и более поздний максимум AP. На следующем графике им соответствуют минимумы MC и AVC.',
    series: [slideSeries('AP', 'blue-line', sampleCurve(0.2, 6, slideAverageProduct)),
      slideSeries('MP', 'curve', sampleCurve(0, 6, slideMarginalProduct))],
    labels: [slidePoint(3, 27, 'max MP', { dx: -7, anchor: 'end' }), slidePoint(4.5, 20.25, 'max AP')]
  }
});

Object.assign(slideGraphGroups, {
  'market-supply': ['supplyMovement', 'marketSupply'],
  'market-equilibrium': ['marketEquilibrium', 'marketImbalance', 'soybeanShortage', 'soybeanSurplus'],
  'supply-equilibrium': ['supplyRise', 'supplyFall', 'supplyShiftEquilibrium'],
  surplus: ['consumerSurplusOnly', 'producerSurplusOnly', 'surplus'],
  'price-elasticity': ['arcElasticity', 'priceElasticity', 'perfectlyInelasticDemand', 'inelasticDemand', 'elasticDemand', 'perfectlyElasticDemand', 'demandElasticityCases'],
  'indifference-shapes': ['indifferenceMap', 'substitutes', 'complements', 'indifferenceSpecial'],
  budget: ['budget', 'budgetChanges'],
  'price-effects': ['substitutionOnly', 'incomeEffectOnly', 'priceEffects'],
  isoquant: ['isoquantTradeoff', 'isoquant', 'mrtsVariation'],
  isocost: ['isocostIntercepts'],
  'isocost-change': ['isocostBudget', 'isocostPrice', 'isocostShift'],
  'average-cost': ['fixedCostCurve', 'variableCostCurve', 'totalAverageCurve', 'averageCostSum', 'marginalCostCurve', 'averageCosts'],
  'cost-product-link': ['productivityForCosts', 'productivityCosts']
});

Object.assign(slideGraphSources, {
  supplyMovement: '0429 0430 0431',
  soybeanShortage: '0436',
  soybeanSurplus: '0437',
  consumerSurplusOnly: '0556',
  producerSurplusOnly: '0557',
  perfectlyInelasticDemand: '0422',
  inelasticDemand: '0422',
  elasticDemand: '0425',
  perfectlyElasticDemand: '0425',
  substitutes: '0746',
  complements: '0746',
  budgetChanges: '0749',
  substitutionOnly: '0711',
  incomeEffectOnly: '0712',
  isoquantTradeoff: '0769',
  mrtsVariation: '0773',
  isocostIntercepts: '0777',
  isocostBudget: '0776',
  isocostPrice: '0776',
  fixedCostCurve: '1122',
  variableCostCurve: '1124',
  totalAverageCurve: '1125',
  averageCostSum: '1126',
  marginalCostCurve: '1129',
  productivityForCosts: '1131'
});

Object.assign(graphs.optimum, {
  caption: 'На одной бюджетной линии A и C дают меньшую полезность, чем B. В B прямая касается наивысшей достижимой кривой. Ещё более высокая кривая находится за пределами бюджета.',
  series: [
    budgetLine('Бюджетная линия', 'curve', 180, 75),
    ...[12 * 70 ** 3, 45 * 56.25 ** 3, 20 * 90 ** 3].map((u, i) =>
      slideSeries(['Меньшая полезность', 'Оптимальная полезность', 'Недостижимая полезность'][i],
        ['reference-line', 'green-line', 'violet-line'][i],
        sampleCurve(u / 90 ** 3, 200, x => Math.cbrt(u / x))))
  ],
  max: [200, 90], step: [40, 15],
  labels: [slidePoint(12, 70, 'A'), slidePoint(45, 56.25, 'B', { dy: 18 }), slidePoint(96, 35, 'C')]
});
