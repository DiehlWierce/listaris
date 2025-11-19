// src/modules/buildings.js

export const buildingData = [
  { id: 'excavator', name: 'Экскаватор', desc: 'Копает листы', baseIncome: 0.2, count: 0, costBase: 10, costExp: 1.15, chapter: 1 }
];

export function getBuildingCost(building) {
  return Math.floor(building.costBase * Math.pow(building.costExp, building.count));
}