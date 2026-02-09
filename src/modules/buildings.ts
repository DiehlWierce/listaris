export type Building = {
  id: string
  name: string
  desc: string
  baseIncome: number
  count: number
  costBase: number
  costExp: number
  chapter: number
}

export const buildingData: Building[] = [
  {
    id: 'excavator',
    name: 'Экскаватор',
    desc: 'Копает листы',
    baseIncome: 0.2,
    count: 0,
    costBase: 10,
    costExp: 1.15,
    chapter: 1
  }
]

export function getBuildingCost(building: Building): number {
  return Math.floor(building.costBase * Math.pow(building.costExp, building.count))
}
