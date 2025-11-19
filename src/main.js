// src/main.js
import { createApp } from 'vue'
import { createPinia } from 'pinia'
import { createPrimeVue } from './primevue.js' // Импортируем функцию
import App from './App.vue'
import './assets/style.css' // Глобальные стили
import './styles/AppStyles.css'

const app = createApp(App)
const pinia = createPinia()

app.use(pinia)
createPrimeVue(app) // <-- Вызываем функцию, передавая ей app

app.mount('#app')