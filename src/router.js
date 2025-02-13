import { createRouter, createWebHistory } from 'vue-router';
import BookSearchForm from './components/BookSearchForm.vue';
import SearchPage from './components/SearchPage.vue';
import BookDetails from './components/BookDetails.vue';

const routes = [
  { path: '/', component: BookSearchForm },
  { path: '/search', component: SearchPage, props: route => ({ query: route.query.q }) },
  { path: '/book/:id', component: BookDetails }
];

const router = createRouter({
  history: createWebHistory(),
  routes
});

export default router;
