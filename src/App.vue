<template>
  <div id="app" class="app-container dark">
    <div class="container">
      <header class="app-header">
        <h1 class="app-title">
          <span class="title-icon">📜</span>
          <span class="title-text">Листарис</span>
        </h1>
        <ResourcePanel
          :coins="gameStore.coins"
          :coins-per-sec="gameStore.coinsPerSec"
          :show-energy="false"
          :show-crystals="false"
          :show-souls="false"
        />
      </header>

      <main class="app-main">
        <!-- Кнопка "Листать" вне вкладок -->
        <div class="click-section">
          <button
            class="scroll-button"
            @click="handleClick"
            :disabled="isClickingDisabled"
            ref="clickButtonRef"
          >
            <span class="scroll-emoji">📜</span>
            <span class="scroll-label">Листать</span>
          </button>
        </div>

        <!-- Вкладки с уникальным ID -->
        <TabView id="main-tabview" class="main-tabview"> <!-- Добавлен id="main-tabview" -->
          <TabPanel header="🏗️ Постройки">
            <div v-if="gameStore.excavator" class="building-section">
              <h3 class="building-title">{{ gameStore.excavator.name }}</h3>
              <p class="building-desc">{{ gameStore.excavator.desc }}</p>
              <p class="building-stats">Количество: {{ gameStore.excavator.count }}</p>
              <p class="building-cost">Стоимость: {{ getBuildingCost(gameStore.excavator) }} 📜</p>
              <Button
                label="Купить"
                icon="pi pi-shopping-cart"
                @click="gameStore.buyBuilding('excavator')"
                :disabled="gameStore.coins < getBuildingCost(gameStore.excavator)"
                class="buy-button"
                severity="success"
              />
            </div>
          </TabPanel>
        </TabView>

        <!-- Контейнер для частиц -->
        <div class="particles-container">
          <div
            v-for="particle in particles"
            :key="particle.id"
            class="particle"
            :style="{
              left: particle.x + 'px',
              top: particle.y + 'px',
              color: particle.color,
              fontSize: particle.size,
            }"
          >
            {{ particle.text }}
          </div>
        </div>
      </main>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue'
import { useGameStore } from './stores/game.js'
import { getBuildingCost } from './modules/buildings.js'
import ResourcePanel from './components/ResourcePanel.vue'
import TabView from 'primevue/tabview'
import TabPanel from 'primevue/tabpanel'
import Button from 'primevue/button'
// Импортируем стили
// import '../styles/AppStyles.css

const gameStore = useGameStore()
const clickButtonRef = ref(null)

let gameLoopInterval = null
const particles = ref([])
let particleIdCounter = 0
const isClickingDisabled = ref(false)

const handleAddCoins = (amount) => {
  gameStore.addCoins(amount)
}

const handleClick = (e) => {
  if (isClickingDisabled.value || !clickButtonRef.value) return

  const appContainer = document.querySelector('.app-container')
  const appRect = appContainer.getBoundingClientRect()
  const buttonRect = clickButtonRef.value.getBoundingClientRect()

  // Рассчитываем координаты внутри .app-container
  const x = buttonRect.left - appRect.left + Math.random() * buttonRect.width
  const y = buttonRect.top - appRect.top + Math.random() * buttonRect.height

  handleAddCoins(1)

  const newParticle = {
    id: particleIdCounter++,
    x: x,
    y: y,
    text: '+1',
    color: '#4ade80',
    size: '1.2rem',
  }
  particles.value.push(newParticle)

  isClickingDisabled.value = true
  setTimeout(() => { isClickingDisabled.value = false }, 100)

  setTimeout(() => {
    particles.value = particles.value.filter(p => p.id !== newParticle.id)
  }, 1000)
}

onMounted(() => {
  gameLoopInterval = setInterval(() => {
    handleAddCoins(gameStore.coinsPerSec / 10)
  }, 100)
})

onUnmounted(() => {
  if (gameLoopInterval) clearInterval(gameLoopInterval)
})
</script>

<style scoped>
/* Оставим минимальные стили, если нужно что-то локально переопределить */
/* В данном случае, можно оставить пустым или удалить этот тег, если нет локальных стилей */
</style>