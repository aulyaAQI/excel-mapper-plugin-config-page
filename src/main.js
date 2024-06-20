import {createApp} from 'vue';
import {createPinia} from 'pinia';

import 'bootstrap/dist/css/bootstrap.min.css';
import 'vue-multiselect/dist/vue-multiselect.css';

import {library} from '@fortawesome/fontawesome-svg-core';
import {FontAwesomeIcon} from '@fortawesome/vue-fontawesome';
import {fas} from '@fortawesome/free-solid-svg-icons';
import {far} from '@fortawesome/free-regular-svg-icons';
import {fab} from '@fortawesome/free-brands-svg-icons';

import Multiselect from 'vue-multiselect';

library.add(fas, far, fab);

import App from './App.vue';

const initVueApp = () => {
  const pinia = createPinia();
  const app = createApp(App);

  app.component('font-awesome-icon', FontAwesomeIcon);
  app.component('MultiSelect', Multiselect);
  app.use(pinia);
  app.mount('#app');
};

initVueApp();
