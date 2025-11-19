<template>
  <div class="resources-panel">
    <div class="resource-item">
      <div class="resource-label">📜 Листы</div>
      <div class="resource-value">{{ fmt(coins) }}</div>
      <div class="resource-per-sec" v-if="coinsPerSec > 0">+{{ fmt(coinsPerSec) }}/сек</div>
    </div>
    <!-- Добавь другие ресурсы по мере необходимости -->
    <!-- <div class="resource-item" v-if="showEnergy">...</div> -->
  </div>
</template>

<script setup>
// Используем defineProps для получения данных из родителя
defineProps({
  coins: { type: Number, required: true },
  coinsPerSec: { type: Number, required: true },
  showEnergy: { type: Boolean, default: false },
  showCrystals: { type: Boolean, default: false },
  showSouls: { type: Boolean, default: false },
  energy: { type: Number, default: 0 },
  crystals: { type: Number, default: 0 },
  souls: { type: Number, default: 0 },
  energyPerSec: { type: Number, default: 0 },
  crystalsPerSec: { type: Number, default: 0 },
})

// Функция форматирования чисел
const fmt = (num) => {
  if (num >= 1e12) return (num/1e12).toFixed(2) + 'T';
  if (num >= 1e9) return (num/1e9).toFixed(2) + 'B';
  if (num >= 1e6) return (num/1e6).toFixed(2) + 'M';
  if (num >= 1e3) return (num/1e3).toFixed(1) + 'k';
  return num.toFixed(1); // Показываем 1 знак после запятой для MVP
}
</script>

<style scoped>
.resources-panel {
  display: flex;
  justify-content: space-around;
  align-items: center;
  margin-bottom: 1rem;
  padding: 0.5rem;
  background: var(--surface-ground); /* Используем переменную PrimeVue */
  border-radius: 8px;
  border: 1px solid var(--surface-border); /* Используем переменную PrimeVue */
}

.resource-item {
  text-align: center;
  padding: 0 0.5rem;
}

.resource-label {
  font-size: 0.8rem;
  color: var(--text-color-secondary); /* Используем переменную PrimeVue */
}

.resource-value {
  font-weight: bold;
  color: var(--text-color); /* Используем переменную PrimeVue */
}

.resource-per-sec {
  font-size: 0.7rem;
  color: var(--text-color-secondary); /* Используем переменную PrimeVue */
}
</style>