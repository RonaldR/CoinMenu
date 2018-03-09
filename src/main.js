import Vue from 'vue';
import main from './main.vue';

import router from './router';
// import store from './store';

// 3th party
import Vue2Filters from 'vue2-filters';
import VueClipboard from 'vue-clipboard2';


Vue.config.productionTip = false;

Vue.use(Vue2Filters); // vue filters, using for displaying currency
Vue.use(VueClipboard); // A simple vuejs 2 binding for clipboard.js

window.app = new Vue({
  router: router,
  // store,
  render: h => h(main)
}).$mount('#app');
