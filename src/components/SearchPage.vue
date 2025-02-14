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

      <ul v-if="books.length" class="space-y-4">
        <h2 class="text-2xl font-bold mb-4">Résultats pour "{{ searchQuery }}"</h2>
        <router-link v-for="book in paginatedBooks" :key="book.id" :to="`/book/${book.id}`" class="block border border-gray-300 rounded-lg shadow-lg p-4 bg-white hover:shadow-xl transition-all transform hover:scale-105">
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
      <p v-if="!isLoading && books.length === 0" class="text-gray-500">Aucun résultat trouvé. Essayez avec : <span id="suggestTerm" style="color: blue; cursor: pointer;" @click="applySuggestion">{{ termSuggestion }}</span></p>

      <!-- Pagination -->
      <div v-if="totalPages > 1" class="flex justify-center space-x-2 mt-6">
        <button @click="changePage(currentPage - 1)" :disabled="currentPage === 1" class="px-4 py-2 bg-gray-300 rounded disabled:opacity-50">
          Précédent
        </button>

        <button 
          @click="changePage(1)" 
          :class="{'bg-blue-500 text-white': currentPage === 1}" 
          class="px-4 py-2 border rounded">
          1
        </button>

        <span v-if="currentPage > 4">...</span>
            <button v-for="page in visiblePages" :key="page" @click="changePage(page)" :class="{'bg-blue-500 text-white': currentPage === page}" class="px-4 py-2 border rounded">
              {{ page }}
            </button>
        <span v-if="currentPage < totalPages - 3">...</span>

        <button v-if="totalPages > 1" @click="changePage(totalPages)" :class="{'bg-blue-500 text-white': currentPage === totalPages}" class="px-4 py-2 border rounded">
          {{ totalPages }}
        </button>

        <button @click="changePage(currentPage + 1)" :disabled="currentPage === totalPages" class="px-4 py-2 bg-gray-300 rounded disabled:opacity-50">
          Suivant
        </button>
      </div>
    </main>
    
    <aside class="w-full md:w-1/4 bg-gray-100 p-6 flex flex-col">
      <h2 class="text-xl font-bold text-gray-700 mb-4">Recommandations</h2>
      <ul>
        <router-link v-for="recommendation in recommendations" :key="recommendation.id" :to="`/book/${recommendation.id}`" class="block border border-gray-300 rounded-lg shadow-lg p-4 bg-white hover:shadow-xl transition-all transform hover:scale-105">
          <li class="mb-4 p-4 border border-gray-300 rounded-lg shadow-md bg-white">
          <h3 class="text-lg font-semibold text-blue-500">{{ recommendation.title }}</h3>
          <p class="text-gray-600">Auteur : {{ recommendation.authors[0]?.name }}</p>
          <img v-if="recommendation.image" :src="`http://localhost:3000/${recommendation.image}`" alt="Book Cover" class="w-20 h-30 mt-2 rounded-md object-cover"/>
          </li>
        </router-link>  
      </ul>
    </aside>
  </div>
</template>

<script setup>
  import { ref, onMounted, watch, computed } from 'vue';
  import { useRoute, useRouter } from 'vue-router';
  import axios from 'axios';

  const route = useRoute();
  const router = useRouter();
  const searchQuery = ref(route.query.q || '');
  const books = ref([]);
  const recommendations = ref([]);
  const termSuggestion = ref('');
  const isAdvancedSearch = ref(false);
  const paginatedBooks = ref([]); 
  const currentPage = ref(1);
  const totalPages = ref(1);
  const limit = 10; 
  const isLoading = ref(true);

  function getHighlightedExcerpt(content, keyword) {
    if (!keyword) {
      return content.substring(0, 200) + "...";
    } 
    const regex = new RegExp(`(${keyword})`, 'gi');
    const match = content.match(regex);
    if (!match) {
      return content.substring(0, 200) + "...";
    } 
    const index = content.indexOf(match[0]);
    const start = Math.max(0, index - 50);
    const end = Math.min(content.length, index + keyword.length + 100);
    return content.substring(start, end).replace(regex, `<span class="highlight">$1</span>`) + "...";
  }

  const fetchBooks = async () => {
    if (!searchQuery.value.trim()) {
      return;
    } 
    isLoading.value = true;

    try {
      let response;

      if (isAdvancedSearch.value) {
        response = await axios.get(`http://localhost:3000/api/search/advanced`, {
            params: {
                regex: searchQuery.value
            }
        });        
      } else {
        response = await axios.get(`http://localhost:3000/api/search`, {
          params: {
            mot: searchQuery.value
          }
        });  
        console.log(response.data);    
      }

      books.value = response.data.books;
      recommendations.value = response.data.recommendations;
      termSuggestion.value = response.data.termSuggestion;
      totalPages.value = Math.ceil(books.value.length / limit); 
      currentPage.value = 1;      
      updatePaginatedBooks();

    } catch (error) {
      console.error('Erreur lors de la recherche :', error);
    } finally {
      isLoading.value = false;
    }
  };

  const updatePaginatedBooks = () => {
    const start = (currentPage.value - 1) * limit;
    const end = start + limit;
    paginatedBooks.value = books.value.slice(start, end);
  };

  const visiblePages = computed(() => {
    let pages = [];
    if (totalPages.value <= 7) {
      pages = Array.from({ length: totalPages.value - 2 }, (_, i) => i + 2);
    } else {
      if (currentPage.value <= 4) {
        pages = [2, 3, 4, 5];
      } else if (currentPage.value >= totalPages.value - 3) {
        pages = [totalPages.value - 4, totalPages.value - 3, totalPages.value - 2];
      } else {
        pages = [currentPage.value - 1, currentPage.value, currentPage.value + 1];
      }
    }
    return pages;
  });

  const changePage = (page) => {
    if (page >= 1 && page <= totalPages.value) {
      currentPage.value = page;
      updatePaginatedBooks(); 
    }
  };

  const applySuggestion = () => {
    if (termSuggestion.value) {
      searchQuery.value = termSuggestion.value;
    }
  };

  watch(() => route.query.q, (newQuery) => {
    fetchBooks();
  });

  onMounted(() => {
    isAdvancedSearch.value = route.query.advanced === "true";
    fetchBooks();
  });

  const searchBooks = () => {
    if (!searchQuery.value.trim()) {
      return;
    } 
    router.push({ path: '/search', query: { q: searchQuery.value, advanced: isAdvancedSearch.value } });
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
