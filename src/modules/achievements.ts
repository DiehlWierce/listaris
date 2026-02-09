export type Achievement = {
  id: string
  title: string
  description: string
  target: number
  metric: 'coins' | 'clicks' | 'buildings' | 'upgrades' | 'coinsPerSec'
}

export const achievements: Achievement[] = [
  {
    id: 'first-scroll',
    title: 'Первые листы',
    description: 'Соберите 50 листов.',
    target: 50,
    metric: 'coins'
  },
  {
    id: 'steady-hands',
    title: 'Твёрдая рука',
    description: 'Совершите 100 кликов.',
    target: 100,
    metric: 'clicks'
  },
  {
    id: 'camp-master',
    title: 'Организатор лагеря',
    description: 'Постройте 8 объектов.',
    target: 8,
    metric: 'buildings'
  },
  {
    id: 'archive-keeper',
    title: 'Хранитель архивов',
    description: 'Приобретите 3 улучшения.',
    target: 3,
    metric: 'upgrades'
  },
  {
    id: 'signal-network',
    title: 'Сеть разведки',
    description: 'Достигните 75 листов в секунду.',
    target: 75,
    metric: 'coinsPerSec'
  },
  {
    id: 'chronicle-legend',
    title: 'Легенда хроник',
    description: 'Соберите 25 000 листов.',
    target: 25000,
    metric: 'coins'
  }
]
