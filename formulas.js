// Presentation MathML. Each equation stays together on narrow screens.
function identifier(name, subscript) {
  const base = `<mi>${name}</mi>`;
  return subscript ? `<msub>${base}<mi>${subscript}</mi></msub>` : base;
}

function operator(symbol) {
  return `<mo>${symbol}</mo>`;
}

function numeral(value) {
  return `<mn>${value}</mn>`;
}

function mathText(text) {
  return `<mtext>${text}</mtext>`;
}

function mathRow(...parts) {
  return `<mrow>${parts.join('')}</mrow>`;
}

function fraction(numerator, denominator) {
  return `<mfrac>${numerator}${denominator}</mfrac>`;
}

function superscript(base, mark) {
  return `<msup>${base}${operator(mark)}</msup>`;
}

function parentheses(...parts) {
  return mathRow(operator('('), ...parts, operator(')'));
}

function delta(symbol) {
  return mathRow(operator('Δ'), symbol);
}

function overbar(symbol) {
  return `<mover accent="true">${symbol}<mo>¯</mo></mover>`;
}

function equation(...parts) {
  return `<math display="block">${mathRow(...parts)}</math>`;
}

function equationLines(...rows) {
  return `<math display="block"><mtable>${rows.map(row => `<mtr><mtd>${row}</mtd></mtr>`).join('')}</mtable></math>`;
}

const equals = operator('=');
const plus = operator('+');
const minus = operator('−');
const comma = operator(',');
const sum = operator('∑');
const half = fraction(numeral(1), numeral(2));
const q = identifier('Q');
const price = identifier('P');
const qDemand = identifier('Q', 'D');
const qSupply = identifier('Q', 'S');
const pX = identifier('P', 'x');
const pY = identifier('P', 'y');
const muX = identifier('MU', 'x');
const muY = identifier('MU', 'y');
const mpL = identifier('MP', 'L');
const mpK = identifier('MP', 'K');
const pStar = superscript(price, '*');
const qStar = superscript(q, '*');
const demandElasticity = identifier('E', 'D');
const supplyElasticity = identifier('E', 'S');
const absoluteDemandElasticity = mathRow(operator('|'), demandElasticity, operator('|'));
const labor = identifier('L');
const capital = identifier('K');
const wage = identifier('w');
const rent = identifier('r');
const tc = identifier('TC');
const tfc = identifier('TFC');
const tvc = identifier('TVC');
const afc = identifier('AFC');
const avc = identifier('AVC');
const atc = identifier('ATC');
const mc = identifier('MC');
const percentChange = symbol => mathRow(operator('%'), delta(symbol));
const derivative = (symbol, variable) => fraction(
  mathRow(operator('∂'), symbol), mathRow(operator('∂'), variable)
);

const formulas = {
  utility: equation(identifier('U'), equals, identifier('f'), parentheses(identifier('x'), comma, identifier('y'))),
  marginal: equation(identifier('MU'), equals, fraction(delta(identifier('TU')), delta(q))),
  average: equation(identifier('AU'), equals, fraction(identifier('TU'), q)),
  partial: equation(muX, equals, derivative(identifier('U'), identifier('x'))),
  mrs: equation(identifier('MRS'), equals, minus, fraction(delta(identifier('y')), delta(identifier('x')))),
  budget: equation(pX, identifier('x'), plus, pY, identifier('y'), equals, identifier('I')),
  optimum: equation(fraction(muX, pX), equals, fraction(muY, pY)),

  opportunity: equation(identifier('OC', 'X'), equals, minus, fraction(delta(identifier('Y')), delta(identifier('X')))),
  marketDemand: equation(qDemand, parentheses(price), equals, sum, identifier('q', 'D,i'), parentheses(price)),
  marketSupply: equation(qSupply, parentheses(price), equals, sum, identifier('q', 'S,i'), parentheses(price)),
  equilibrium: equation(qDemand, parentheses(pStar), equals, qSupply, parentheses(pStar), equals, qStar),
  shortage: equationLines(
    mathRow(mathText('Дефицит'), equals, qDemand, minus, qSupply),
    mathRow(mathText('при '), qDemand, operator('&gt;'), qSupply)
  ),
  excess: equationLines(
    mathRow(mathText('Избыток'), equals, qSupply, minus, qDemand),
    mathRow(mathText('при '), qSupply, operator('&gt;'), qDemand)
  ),
  consumerSurplus: equation(identifier('CS'), equals, half, parentheses(identifier('P', 'max'), minus, pStar), qStar),
  producerSurplus: equation(identifier('PS'), equals, half, parentheses(pStar, minus, identifier('P', 'min')), qStar),
  totalSurplus: equation(identifier('TS'), equals, identifier('CS'), plus, identifier('PS')),
  traded: equation(identifier('Q', 'сделок'), equals, identifier('min'), parentheses(qDemand, comma, qSupply)),
  priceControlLoss: equationLines(
    mathRow(
      identifier('DWL'), equals, half,
      operator('['), identifier('P', 'D'), parentheses(q), minus, identifier('P', 'S'), parentheses(q), operator(']')
    ),
    mathRow(operator('×'), parentheses(qStar, minus, q))
  ),
  tax: equation(identifier('P', 'b'), minus, identifier('P', 's'), equals, identifier('t')),
  taxRevenue: equation(identifier('T'), equals, identifier('t'), identifier('Q', 't')),
  taxLoss: equation(identifier('DWL'), equals, half, identifier('t'), parentheses(qStar, minus, identifier('Q', 't'))),
  incidence: equation(
    mathText('Доля покупателя'), operator('≈'),
    fraction(supplyElasticity, mathRow(supplyElasticity, plus, absoluteDemandElasticity))
  ),
  subsidy: equation(identifier('P', 's'), minus, identifier('P', 'b'), equals, identifier('s')),
  subsidyCost: equation(identifier('G'), equals, identifier('s'), identifier('Q', 's')),
  elasticity: equation(demandElasticity, equals, fraction(percentChange(qDemand), percentChange(price))),
  midpoint: equation(
    identifier('E', 'дуг'), equals,
    fraction(fraction(delta(q), overbar(q)), fraction(delta(price), overbar(price)))
  ),
  pointElasticity: equation(
    demandElasticity, equals, superscript(qDemand, '′'), parentheses(price), operator('·'), fraction(price, qDemand)
  ),
  revenue: equation(identifier('TR'), equals, price, operator('·'), q),
  cross: equation(
    identifier('E', 'XY'), equals, fraction(percentChange(identifier('Q', 'X')), percentChange(identifier('P', 'Y')))
  ),
  incomeElasticity: equation(identifier('E', 'I'), equals, fraction(percentChange(q), percentChange(identifier('I')))),
  supplyElasticity: equation(supplyElasticity, equals, fraction(percentChange(qSupply), percentChange(price))),
  mrsPoint: equation(
    identifier('MRS'), equals, minus, fraction(mathRow(mathText('d'), identifier('y')), mathRow(mathText('d'), identifier('x'))),
    equals, fraction(muX, muY)
  ),
  budgetSet: equation(pX, identifier('x'), plus, pY, identifier('y'), operator('≤'), identifier('I')),
  consumerTangency: equation(identifier('MRS'), equals, fraction(pX, pY)),
  production: equation(q, equals, identifier('f'), parentheses(labor, comma, capital)),
  mpl: equation(mpL, equals, derivative(q, labor)),
  mpk: equation(mpK, equals, derivative(q, capital)),
  mrts: equation(
    identifier('MRTS'), equals, minus, fraction(mathRow(mathText('d'), capital), mathRow(mathText('d'), labor)),
    equals, fraction(mpL, mpK)
  ),
  mrtsArc: equation(identifier('MRTS', 'отрезок'), equals, minus, fraction(delta(capital), delta(labor))),
  economicCost: equation(identifier('C', 'экон'), equals, identifier('C', 'явные'), plus, identifier('C', 'неявные')),
  accountingProfit: equation(identifier('π', 'бух'), equals, identifier('TR'), minus, identifier('C', 'явные')),
  economicProfit: equation(identifier('π', 'экон'), equals, identifier('TR'), minus, identifier('C', 'экон')),
  isocost: equation(tc, equals, wage, labor, plus, rent, capital),
  producerTangency: equation(identifier('MRTS'), equals, fraction(wage, rent)),
  producerOptimum: equation(fraction(mpL, wage), equals, fraction(mpK, rent)),

  demandFactors: equation(
    qDemand, equals, identifier('f'),
    parentheses(price, comma, identifier('I'), comma, identifier('P', 'sub'), comma, identifier('P', 'com'), comma,
      identifier('Z'), comma, identifier('W'), comma, identifier('N'))
  ),
  supplyFactors: equation(
    qSupply, equals, identifier('f'),
    parentheses(price, comma, identifier('P', 'r'), comma, identifier('A'), comma, identifier('T'), comma, identifier('N'))
  ),
  discreteConsumerSurplus: equation(identifier('CS'), equals, sum, parentheses(identifier('v', 'i'), minus, price)),
  discreteProducerSurplus: equation(identifier('PS'), equals, sum, parentheses(price, minus, identifier('c', 'i'))),
  totalUtility: equation(identifier('TU'), parentheses(q), equals, sum, identifier('MU', 'i')),
  priceEffects: equation(
    delta(identifier('x')), equals,
    parentheses(identifier('x', 'B'), minus, identifier('x', 'A')), plus,
    parentheses(identifier('x', 'C'), minus, identifier('x', 'B'))
  ),
  averageProduct: equation(identifier('AP', 'L'), equals, fraction(identifier('TP'), labor)),
  shortRunProduction: equation(identifier('TP'), equals, identifier('F'), parentheses(labor, comma, overbar(capital))),
  linearTechnology: equation(q, equals, identifier('a'), labor, plus, identifier('b'), capital),
  fixedTechnology: equation(q, equals, identifier('min'), parentheses(identifier('a'), labor, comma, identifier('b'), capital)),
  isocostLine: equation(capital, equals, fraction(tc, rent), minus, fraction(wage, rent), labor),
  totalCost: equation(tc, parentheses(q), equals, tfc, plus, tvc, parentheses(q)),
  afc: equation(afc, equals, fraction(tfc, q)),
  avc: equation(avc, equals, fraction(tvc, q)),
  atc: equation(atc, equals, fraction(tc, q), equals, afc, plus, avc),
  marginalCost: equation(mc, equals, fraction(delta(tc), delta(q)), equals, fraction(delta(tvc), delta(q))),
  marginalCostProduct: equation(mc, equals, fraction(wage, mpL)),
  averageCostProduct: equation(avc, equals, fraction(wage, identifier('AP', 'L'))),
  longRunAverageCost: equationLines(
    mathRow(identifier('LRAC'), parentheses(q), equals, fraction(mathRow(identifier('LTC'), parentheses(q)), q)),
    mathRow(equals, identifier('min', 'K'), identifier('SRAC'), parentheses(q, operator(';'), capital))
  )
};
