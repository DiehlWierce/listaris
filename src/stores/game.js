// src/stores/game.js
import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { buildingData, getBuildingCost } from '../modules/buildings.js'

export const useGameStore = defineStore('game', () => {
  const coins = ref(0)
  const buildings = ref(JSON.parse(JSON.stringify(buildingData)))

  const coinsPerSec = computed(() => {
    return buildings.value.reduce((sum, b) => sum + b.count * b.baseIncome, 0)
  })

  const excavator = computed(() => buildings.value.find(b => b.id === 'excavator'))

  const buyBuilding = (buildingId) => {
    const building = buildings.value.find(b => b.id === buildingId)
    if (!building) return false
    const cost = getBuildingCost(building)
    if (coins.value >= cost) {
      coins.value -= cost
      building.count++
      return true
    }
    return false
  }

  const addCoins = (amount) => {
    coins.value += amount
  }

  return { coins, excavator, coinsPerSec, buyBuilding, addCoins }
})