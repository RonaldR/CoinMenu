import Vue from 'vue'
import App from './App.vue'

Vue.config.productionTip = false

new Vue({
  render: h => h(App)
}).$mount('#app')


// https://coinmarketcap.com/api/
// https://api.coinmarketcap.com/v1/ticker/?limit=10
