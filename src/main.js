import Vue from 'vue';
import main from './main.vue';
import VueRouter from 'vue-router';
import Vue2Filters from 'vue2-filters';
import coins from './components/coins.vue';
import about from './components/about.vue';
import settings from './components/settings.vue';

Vue.config.productionTip = false;

Vue.use(VueRouter);
Vue.use(Vue2Filters);

const routes = [
  { path: '/', component: coins },
  { path: '/about', component: about },
  { path: '/settings', component: settings }
];

const router = new VueRouter({
  routes
});

window.app = new Vue({
  router: router,
  render: h => h(main)
}).$mount('#app');
