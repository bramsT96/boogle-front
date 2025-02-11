import { createRouter, createWebHistory } from 'vue-router';
import BookSearchForm from './components/BookSearchForm.vue';
import SearchPage from './components/SearchPage.vue';

const routes = [
  { path: '/', component: BookSearchForm },
  { path: '/search', component: SearchPage, props: route => ({ query: route.query.q }) }
];

const router = createRouter({
  history: createWebHistory(),
  routes
});

export default router;
