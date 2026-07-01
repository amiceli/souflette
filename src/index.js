import { createApp } from 'vue'
import App from '@/components/App.js'
import { init } from '@/stores/sorter.js'

init().then(() => {
    createApp(App).mount('#app')
})
