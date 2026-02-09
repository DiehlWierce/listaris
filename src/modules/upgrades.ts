export type Upgrade = {
  id: string
  name: string
  desc: string
  cost: number
  targetBuildingId?: string
  incomeMultiplier?: number
  clickBonus?: number
  requiresBuildings?: number
}

export const upgradeData: Upgrade[] = [
  {
    id: 'reinforced-buckets',
    name: 'Усиленные ковши',
    desc: 'Экскаваторы добывают на 25% больше листов.',
    cost: 120,
    targetBuildingId: 'excavator',
    incomeMultiplier: 0.25,
    requiresBuildings: 5
  },
  {
    id: 'shift-rotation',
    name: 'Ротация смен',
    desc: 'Полевые лагеря работают на 20% эффективнее.',
    cost: 320,
    targetBuildingId: 'field-camp',
    incomeMultiplier: 0.2,
    requiresBuildings: 3
  },
  {
    id: 'catalog-system',
    name: 'Каталог артефактов',
    desc: 'Архивы увеличивают выработку на 30%.',
    cost: 800,
    targetBuildingId: 'archive',
    incomeMultiplier: 0.3,
    requiresBuildings: 2
  },
  {
    id: 'guided-scan',
    name: 'Наводка сканеров',
    desc: 'Каждый клик даёт +2 листа.',
    cost: 250,
    clickBonus: 2
  },
  {
    id: 'deep-signals',
    name: 'Глубинные сигналы',
    desc: 'Обсерватории дают +40% дохода.',
    cost: 1800,
    targetBuildingId: 'sky-observatory',
    incomeMultiplier: 0.4,
    requiresBuildings: 1
  }
]
