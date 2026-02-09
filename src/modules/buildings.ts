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
  }
]

export function getBuildingCost(building: Building): number {
  return Math.floor(building.costBase * Math.pow(building.costExp, building.count))
}
