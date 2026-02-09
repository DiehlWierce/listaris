export type Building = {
  id: string
  name: string
  desc: string
  baseIncome: number
  count: number
  costBase: number
  costExp: number
  chapter: number
  unlockAt: number
}

export const buildingData: Building[] = [
  {
    id: 'excavator',
    name: 'Экскаватор',
    desc: 'Ускоряет добычу листов на поверхности раскопок.',
    baseIncome: 0.2,
    count: 0,
    costBase: 10,
    costExp: 1.15,
    chapter: 1,
    unlockAt: 0
  },
  {
    id: 'field-camp',
    name: 'Полевой лагерь',
    desc: 'Организует смены рабочих и повышает стабильность добычи.',
    baseIncome: 1,
    count: 0,
    costBase: 80,
    costExp: 1.18,
    chapter: 1,
    unlockAt: 40
  },
  {
    id: 'archive',
    name: 'Архив хроник',
    desc: 'Снижает потери находок и повышает скорость расшифровки.',
    baseIncome: 4,
    count: 0,
    costBase: 320,
    costExp: 1.2,
    chapter: 2,
    unlockAt: 200
  },
  {
    id: 'sky-observatory',
    name: 'Небесная обсерватория',
    desc: 'Запускает спутники для поиска новых руин.',
    baseIncome: 12,
    count: 0,
    costBase: 1200,
    costExp: 1.22,
    chapter: 2,
    unlockAt: 850
  },
  {
    id: 'research-atrium',
    name: 'Исследовательский атриум',
    desc: 'Собирает учёных, чтобы быстро анализировать находки.',
    baseIncome: 28,
    count: 0,
    costBase: 4200,
    costExp: 1.24,
    chapter: 3,
    unlockAt: 2400
  },
  {
    id: 'signal-tower',
    name: 'Сигнальная башня',
    desc: 'Связывает лагеря в единую сеть и ускоряет обмен данными.',
    baseIncome: 68,
    count: 0,
    costBase: 12800,
    costExp: 1.25,
    chapter: 3,
    unlockAt: 6400
  },
  {
    id: 'chronicle-vault',
    name: 'Хранилище хроник',
    desc: 'Систематизирует редкие тексты и защищает их от потерь.',
    baseIncome: 140,
    count: 0,
    costBase: 38000,
    costExp: 1.27,
    chapter: 4,
    unlockAt: 18000
  },
  {
    id: 'orbital-array',
    name: 'Орбитальная решётка',
    desc: 'Запускает сеть спутников для ускорения разведки.',
    baseIncome: 320,
    count: 0,
    costBase: 98000,
    costExp: 1.28,
    chapter: 4,
    unlockAt: 52000
  }
]

export function getBuildingCost(building: Building): number {
  return Math.floor(building.costBase * Math.pow(building.costExp, building.count))
}
