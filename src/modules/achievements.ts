export type Achievement = {
  id: string
  title: string
  description: string
  target: number
  metric: 'coins' | 'clicks' | 'buildings' | 'upgrades' | 'coinsPerSec' | 'sparks' | 'prestige'
}

export const achievements: Achievement[] = [
  {
    id: 'first-scroll',
    title: 'Первые листы ✨',
    description: 'Соберите 75 листов.',
    target: 75,
    metric: 'coins'
  },
  {
    id: 'steady-hands',
    title: 'Ритм города',
    description: 'Совершите 150 кликов.',
    target: 150,
    metric: 'clicks'
  },
  {
    id: 'camp-master',
    title: 'Архитектор огней',
    description: 'Постройте 10 объектов.',
    target: 10,
    metric: 'buildings'
  },
  {
    id: 'archive-keeper',
    title: 'Куратор импульсов',
    description: 'Приобретите 4 улучшения.',
    target: 4,
    metric: 'upgrades'
  },
  {
    id: 'signal-network',
    title: 'Световая сеть',
    description: 'Достигните 120 листов в секунду.',
    target: 120,
    metric: 'coinsPerSec'
  },
  {
    id: 'spark-burst',
    title: 'Искровой всплеск',
    description: 'Накопите 30 искр.',
    target: 30,
    metric: 'sparks'
  },
  {
    id: 'chronicle-legend',
    title: 'Легенда люмена',
    description: 'Соберите 40 000 листов.',
    target: 40000,
    metric: 'coins'
  },
  {
    id: 'first-prestige',
    title: 'Первое сияние',
    description: 'Получите 1 очко престижа.',
    target: 1,
    metric: 'prestige'
  }
]
