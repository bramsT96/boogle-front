<template>
  <div class="flex flex-col md:flex-row min-h-screen">
    <aside class="w-full md:w-1/4 bg-gray-100 p-6 flex flex-col items-center md:items-start">
      <h1 class="text-4xl md:text-5xl font-bold text-blue-700 mb-6">
          <span class="text-blue-700">B</span>
          <span class="text-red-500">o</span>
          <span class="text-yellow-500">o</span>
          <span class="text-blue-700">g</span>
          <span class="text-green-500">l</span>
          <span class="text-red-500">e</span>
      </h1>
    </aside>
    
    <!-- Contenu principal -->
    <main class="w-full md:w-2/4 p-6">
      <form @submit.prevent="searchBooks" class="mb-6 flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-2">
          <input v-model="searchQuery" 
              type="search" 
              class="w-full p-3 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500" 
              placeholder="Recherchez un livre..."
              autocomplete="off"
              required 
          />
          <button type="submit" class="bg-blue-600 text-white px-4 py-3 rounded-lg hover:bg-blue-700">
              Rechercher
          </button>
      </form>

      <h2 class="text-2xl font-bold mb-4">Résultats pour "{{ searchQuery }}"</h2>

      <ul v-if="books.length" class="space-y-4">
        <router-link v-for="book in books" :key="book.id" :to="`/book/${book.id}`" class="block border border-gray-300 rounded-lg shadow-lg p-4 bg-white hover:shadow-xl transition-all transform hover:scale-105">
          <li class="flex flex-col sm:flex-row space-x-4">
              <div class="flex-1">
                <h3 class="text-lg font-bold text-blue-500">{{ book.title }}</h3>
                <p class="text-gray-700">Auteur(s) : {{ book.authors.map(a => a.name).join(', ') }}</p>
                <h4 class="text-md font-medium text-gray-600 mt-2">Résumé :</h4>
                <p class="text-gray-500 leading-snug" v-html="getHighlightedExcerpt(book.content, searchQuery)"></p>
              </div>
              <div class="w-full sm:w-32 h-48 flex justify-center items-center rounded-lg overflow-hidden">
                <img v-if="book.image" :src="`http://localhost:3000/${book.image}`" 
                  alt="Book cover" class="max-w-full h-full object-cover rounded-lg" />
              </div>
          </li>
        </router-link>
      </ul>
      <p v-else class="text-gray-500">Aucun résultat trouvé. Essayez avec :<span id="suggestTerm" style="color: blue; cursor: pointer;"></span></p>
    </main>
    
    <!-- Section de recommandations -->
    <aside class="w-full md:w-1/4 bg-gray-100 p-6 flex flex-col">
      <h2 class="text-xl font-bold text-gray-700 mb-4">Recommandations</h2>
      <ul>
          <li v-for="recommendation in recommendations" :key="recommendation.id" class="mb-4 p-4 border border-gray-300 rounded-lg shadow-md bg-white">
          <h3 class="text-lg font-semibold text-blue-500">{{ recommendation.title }}</h3>
          <p class="text-gray-600">Auteur : {{ recommendation.authors[0]?.name }}</p>
          <img v-if="recommendation.image" :src="`http://localhost:3000/${recommendation.image}`" alt="Book Cover" class="w-20 h-30 mt-2 rounded-md object-cover"/>
          </li>
      </ul>
    </aside>
  </div>
</template>

<script setup>
import { ref, onMounted, watch } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import axios from 'axios';

const route = useRoute();
const router = useRouter();
const searchQuery = ref(route.query.q || '');
const books = ref([]);
const recommendations = ref([]);

function getHighlightedExcerpt(content, keyword) {
  if (!keyword) return content.substring(0, 200) + "...";
  const regex = new RegExp(`(${keyword})`, 'gi');
  const match = content.match(regex);
  if (!match) return content.substring(0, 200) + "...";
  const index = content.indexOf(match[0]);
  const start = Math.max(0, index - 50);
  const end = Math.min(content.length, index + keyword.length + 100);
  return content.substring(start, end).replace(regex, `<span class="highlight">$1</span>`) + "...";
}

const fetchBooks = async () => {
  if (!searchQuery.value.trim()) return;
  try {
      const response = await axios.get(`http://localhost:3000/api/search?mot=${encodeURIComponent(searchQuery.value)}`);
      books.value = response.data.books;
      recommendations.value = response.data.recommendations;
  } catch (error) {
      console.error('Erreur lors de la recherche :', error);
  }
};

watch(() => route.query.q, (newQuery) => {
  searchQuery.value = newQuery || '';
  fetchBooks();
});

onMounted(fetchBooks);

const searchBooks = () => {
  if (!searchQuery.value.trim()) return;
  router.push({ path: '/search', query: { q: searchQuery.value } });
};
</script>

<style>
.highlight {
background-color: yellow;
font-weight: bold;
padding: 2px 4px;
border-radius: 4px;
}
</style>
