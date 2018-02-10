import Vue from 'vue';
import main from './main.vue';
import VueRouter from 'vue-router';
import coins from './components/coins/coins.vue';
import about from './components/about/about.vue';

Vue.config.productionTip = false;

Vue.use(VueRouter);

const routes = [
  { path: '/', component: coins },
  { path: '/about', component: about }
];

const router = new VueRouter({
  routes
});

window.app = new Vue({
  router: router,
  render: h => h(main)
}).$mount('#app');

// https://coinmarketcap.com/api/
// https://api.coinmarketcap.com/v1/ticker/?limit=10
