// src/primevue.js
import Aura from '@primevue/themes/aura'
import PrimeVue from 'primevue/config'
import ToastService from 'primevue/toastservice'
// Импортируем Ripple
import Ripple from 'primevue/ripple'

export function createPrimeVue(app) {
  app.use(PrimeVue, {
    theme: {
      preset: Aura,
      options: {
        darkModeSelector: '.dark',
      }
    }
    // Добавим Ripple
    , directives: {
        Ripple
    }
  })
  app.use(ToastService)
}