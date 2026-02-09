export type Building = {
  id: string
  name: string
  desc: string
  baseIncome: number
  baseSparkIncome?: number
  baseAutoClicks?: number
  count: number
  costBase: number
  costExp: number
  sparkCostBase?: number
  sparkCostExp?: number
  chapter: number
  unlockAt: number
}

export const buildingData: Building[] = [
  {
    id: 'lumen-forge',
    name: 'Люмин-кузница',
    desc: 'Кует первые световые листы и задаёт ритм всему городу.',
    baseIncome: 0.3,
    count: 0,
    costBase: 12,
    costExp: 1.15,
    chapter: 1,
    unlockAt: 0
  },
  {
    id: 'sky-greenhouse',
    name: 'Воздушная теплица',
    desc: 'Наполняет улицы кислородом и ускоряет рост световых листов.',
    baseIncome: 1.4,
    count: 0,
    costBase: 90,
    costExp: 1.18,
    chapter: 1,
    unlockAt: 50
  },
  {
    id: 'astro-platform',
    name: 'Астрополигон',
    desc: 'Запускает дроны-разведчики и открывает новые потоки листов.',
    baseIncome: 5.5,
    baseSparkIncome: 0.05,
    count: 0,
    costBase: 360,
    costExp: 1.2,
    chapter: 2,
    unlockAt: 250
  },
  {
    id: 'crystal-archive',
    name: 'Кристальный архив',
    desc: 'Собирает знания в световых ячейках и порождает искры прозрения.',
    baseIncome: 16,
    baseSparkIncome: 0.15,
    count: 0,
    costBase: 1400,
    costExp: 1.22,
    chapter: 2,
    unlockAt: 1000
  },
  {
    id: 'holo-market',
    name: 'Голографический рынок',
    desc: 'Запускает живые сделки и ускоряет рост экономики.',
    baseIncome: 40,
    baseSparkIncome: 0.25,
    count: 0,
    costBase: 4200,
    costExp: 1.23,
    chapter: 3,
    unlockAt: 3000
  },
  {
    id: 'spark-station',
    name: 'Станция искр',
    desc: 'Превращает колебания воздуха в чистое сияние.',
    baseIncome: 90,
    baseSparkIncome: 0.9,
    sparkCostBase: 18,
    sparkCostExp: 1.2,
    count: 0,
    costBase: 12500,
    costExp: 1.24,
    chapter: 3,
    unlockAt: 9000
  },
  {
    id: 'drone-swarm',
    name: 'Сеть дронов',
    desc: 'Дроны сами читают листы, принося доход даже в тишине.',
    baseIncome: 180,
    baseSparkIncome: 1.4,
    baseAutoClicks: 0.8,
    sparkCostBase: 45,
    sparkCostExp: 1.22,
    count: 0,
    costBase: 32000,
    costExp: 1.25,
    chapter: 4,
    unlockAt: 22000
  },
  {
    id: 'luminary',
    name: 'Люминарий',
    desc: 'Пульсирующий центр города, усиливающий все потоки.',
    baseIncome: 400,
    baseSparkIncome: 3,
    sparkCostBase: 120,
    sparkCostExp: 1.25,
    count: 0,
    costBase: 98000,
    costExp: 1.27,
    chapter: 4,
    unlockAt: 60000
  },
  {
    id: 'gravity-temple',
    name: 'Гравитационный храм',
    desc: 'Сжимает время, превращая секунды в золотой поток.',
    baseIncome: 900,
    baseSparkIncome: 6,
    baseAutoClicks: 2.4,
    sparkCostBase: 260,
    sparkCostExp: 1.28,
    count: 0,
    costBase: 240000,
    costExp: 1.29,
    chapter: 5,
    unlockAt: 150000
  }
]

export function getBuildingCost(building: Building): number {
  return Math.floor(building.costBase * Math.pow(building.costExp, building.count))
}

export function getBuildingSparkCost(building: Building): number {
  if (!building.sparkCostBase || !building.sparkCostExp) return 0
  return Math.floor(building.sparkCostBase * Math.pow(building.sparkCostExp, building.count))
}
