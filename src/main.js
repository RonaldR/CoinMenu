import Vue from 'vue';
import main from './main.vue';
import VueRouter from 'vue-router';
import Vue2Filters from 'vue2-filters';
import coins from './components/coins.vue';
import about from './components/about.vue';

Vue.config.productionTip = false;

Vue.use(VueRouter);
Vue.use(Vue2Filters); // vue filters, using for displaying currency

const routes = [
  { path: '/', component: coins },
  { path: '/about', component: about }
];

const router = new VueRouter({
  routes,
  scrollBehavior (to, from, savedPosition) { // scrolls to top on route change
    if (savedPosition) {
      return savedPosition
    } else {
      return { x: 0, y: 0 }
    }
  }
});

window.app = new Vue({
  router: router,
  render: h => h(main)
}).$mount('#app');
