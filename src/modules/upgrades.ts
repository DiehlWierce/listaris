export type Upgrade = {
  id: string
  name: string
  desc: string
  cost: number
  unlockAt: number
  targetBuildingId?: string
  incomeMultiplier?: number
  clickBonus?: number
  requiresBuildings?: number
  requiresTotalBuildings?: number
}

export const upgradeData: Upgrade[] = [
  {
    id: 'reinforced-buckets',
    name: 'Усиленные ковши',
    desc: 'Экскаваторы добывают на 25% больше листов.',
    cost: 120,
    unlockAt: 60,
    targetBuildingId: 'excavator',
    incomeMultiplier: 0.25,
    requiresBuildings: 5
  },
  {
    id: 'shift-rotation',
    name: 'Ротация смен',
    desc: 'Полевые лагеря работают на 20% эффективнее.',
    cost: 320,
    unlockAt: 150,
    targetBuildingId: 'field-camp',
    incomeMultiplier: 0.2,
    requiresBuildings: 3
  },
  {
    id: 'catalog-system',
    name: 'Каталог артефактов',
    desc: 'Архивы увеличивают выработку на 30%.',
    cost: 800,
    unlockAt: 450,
    targetBuildingId: 'archive',
    incomeMultiplier: 0.3,
    requiresBuildings: 2
  },
  {
    id: 'guided-scan',
    name: 'Наводка сканеров',
    desc: 'Каждый клик даёт +2 листа.',
    cost: 250,
    unlockAt: 120,
    clickBonus: 2
  },
  {
    id: 'deep-signals',
    name: 'Глубинные сигналы',
    desc: 'Обсерватории дают +40% дохода.',
    cost: 1800,
    unlockAt: 1200,
    targetBuildingId: 'sky-observatory',
    incomeMultiplier: 0.4,
    requiresBuildings: 1
  },
  {
    id: 'camp-logistics',
    name: 'Логистика лагерей',
    desc: 'Лагеря уменьшают потери и дают +35% дохода.',
    cost: 620,
    unlockAt: 300,
    targetBuildingId: 'field-camp',
    incomeMultiplier: 0.35,
    requiresBuildings: 6
  },
  {
    id: 'precision-tools',
    name: 'Точные инструменты',
    desc: 'Экскаваторы работают на +50% эффективнее.',
    cost: 980,
    unlockAt: 520,
    targetBuildingId: 'excavator',
    incomeMultiplier: 0.5,
    requiresBuildings: 12
  },
  {
    id: 'deep-ledgers',
    name: 'Глубинные реестры',
    desc: 'Архивы дают ещё +45% дохода.',
    cost: 1400,
    unlockAt: 900,
    targetBuildingId: 'archive',
    incomeMultiplier: 0.45,
    requiresBuildings: 4
  },
  {
    id: 'night-shift',
    name: 'Ночные смены',
    desc: 'Общий доход от всех построек +10%.',
    cost: 1600,
    unlockAt: 1000,
    incomeMultiplier: 0.1,
    requiresTotalBuildings: 10
  },
  {
    id: 'signal-amplifier',
    name: 'Усилители сигнала',
    desc: 'Каждый клик даёт ещё +3 листа.',
    cost: 1200,
    unlockAt: 750,
    clickBonus: 3
  },
  {
    id: 'chronicle-mastery',
    name: 'Мастерство хроник',
    desc: 'Все постройки получают +15% к доходу.',
    cost: 2400,
    unlockAt: 1600,
    incomeMultiplier: 0.15,
    requiresTotalBuildings: 15
  }
]
