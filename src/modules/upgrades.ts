export type Upgrade = {
  id: string
  name: string
  desc: string
  cost: number
  sparkCost?: number
  unlockAt: number
  targetBuildingId?: string
  incomeMultiplier?: number
  sparkMultiplier?: number
  clickBonus?: number
  autoClicks?: number
  requiresBuildings?: number
  requiresTotalBuildings?: number
}

export const upgradeData: Upgrade[] = [
  {
    id: 'forge-tuning',
    name: 'Тонкая настройка кузницы',
    desc: 'Люмин-кузницы куют на 30% больше листов.',
    cost: 140,
    unlockAt: 70,
    targetBuildingId: 'lumen-forge',
    incomeMultiplier: 0.3,
    requiresBuildings: 5
  },
  {
    id: 'chlorophyll-loop',
    name: 'Хлорофильный цикл',
    desc: 'Воздушные теплицы дают +25% к доходу.',
    cost: 360,
    unlockAt: 170,
    targetBuildingId: 'sky-greenhouse',
    incomeMultiplier: 0.25,
    requiresBuildings: 3
  },
  {
    id: 'drone-routing',
    name: 'Маршруты дронов',
    desc: 'Астрополигон увеличивает доход на 35%.',
    cost: 820,
    unlockAt: 460,
    targetBuildingId: 'astro-platform',
    incomeMultiplier: 0.35,
    requiresBuildings: 2
  },
  {
    id: 'pulse-mantra',
    name: 'Мантра пульса',
    desc: 'Каждый клик приносит ещё +2 листа.',
    cost: 260,
    unlockAt: 140,
    clickBonus: 2
  },
  {
    id: 'crystal-lens',
    name: 'Кристальная линза',
    desc: 'Кристальные архивы дают +40% листов и +30% искр.',
    cost: 1800,
    sparkCost: 4,
    unlockAt: 1200,
    targetBuildingId: 'crystal-archive',
    incomeMultiplier: 0.4,
    sparkMultiplier: 0.3,
    requiresBuildings: 2
  },
  {
    id: 'market-rituals',
    name: 'Ритуалы рынка',
    desc: 'Голографический рынок усиливает доход на 45%.',
    cost: 2400,
    sparkCost: 6,
    unlockAt: 1600,
    targetBuildingId: 'holo-market',
    incomeMultiplier: 0.45,
    requiresBuildings: 2
  },
  {
    id: 'spark-resonance',
    name: 'Резонанс искр',
    desc: 'Все источники искр дают +35%.',
    cost: 2800,
    sparkCost: 12,
    unlockAt: 1900,
    sparkMultiplier: 0.35,
    requiresTotalBuildings: 10
  },
  {
    id: 'spark-conductors',
    name: 'Проводники искр',
    desc: 'Станции искр дают +55% дохода.',
    cost: 4200,
    sparkCost: 18,
    unlockAt: 2600,
    targetBuildingId: 'spark-station',
    incomeMultiplier: 0.55,
    requiresBuildings: 2
  },
  {
    id: 'drone-autonomy',
    name: 'Автономия дронов',
    desc: 'Дроны кликают за вас: +1.5 автоклика/сек.',
    cost: 5200,
    sparkCost: 28,
    unlockAt: 3200,
    autoClicks: 1.5,
    requiresTotalBuildings: 12
  },
  {
    id: 'pulse-choir',
    name: 'Хор пульса',
    desc: 'Каждый клик даёт ещё +4 листа.',
    cost: 3600,
    sparkCost: 16,
    unlockAt: 2400,
    clickBonus: 4
  },
  {
    id: 'lumen-symphony',
    name: 'Симфония люмена',
    desc: 'Все постройки получают +20% к доходу.',
    cost: 6400,
    sparkCost: 40,
    unlockAt: 4000,
    incomeMultiplier: 0.2,
    requiresTotalBuildings: 18
  },
  {
    id: 'gravity-choir',
    name: 'Храмовые хроны',
    desc: 'Гравитационные храмы увеличивают доход на 65%.',
    cost: 18000,
    sparkCost: 120,
    unlockAt: 10000,
    targetBuildingId: 'gravity-temple',
    incomeMultiplier: 0.65,
    requiresBuildings: 1
  }
]
