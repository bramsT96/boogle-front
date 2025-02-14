<template>
  <div class="flex flex-col items-center justify-center min-h-screen bg-gray-100 px-4 sm:px-6 lg:px-8">
    <h1 class="text-5xl font-bold text-blue-700 mb-6 text-center">
        <span class="text-blue-700">B</span>
        <span class="text-red-500">o</span>
        <span class="text-yellow-500">o</span>
        <span class="text-blue-700">g</span>
        <span class="text-green-500">l</span>
        <span class="text-red-500">e</span>
    </h1>

    <form @submit.prevent="searchBooks" class="max-w-lg w-full mx-auto">
      <div class="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-2 relative">
        <div class="relative flex-grow">
            <div class="absolute inset-y-0 start-0 flex items-center ps-3 pointer-events-none">
                <svg class="w-4 h-4 text-gray-500 dark:text-gray-400" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 20 20">
                    <path stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="m19 19-4-4m0-7A7 7 0 1 1 1 8a7 7 0 0 1 14 0Z"/>
                </svg>
            </div>
            <input v-model="searchQuery" 
              @input="fetchSuggestions"
              @focus="showSuggestions = true"
              @blur="hideSuggestions"
                type="search" 
                id="default-search" 
                class="block w-full p-4 ps-10 pr-28 text-sm text-gray-900 border border-gray-300 rounded-lg bg-gray-50 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500" 
                :placeholder="isAdvancedSearch ? 'Recherche avancée de livre' : 'Recherchez un livre par mot-clé'"
                autocomplete="off"
                required 
            />

            <button type="submit" class="absolute right-2 top-1/2 transform -translate-y-1/2 bg-blue-700 text-white p-2 rounded-lg hover:bg-blue-800 focus:outline-none focus:ring-4 focus:ring-blue-300">
              {{ isAdvancedSearch ? 'Recherche avancée' : 'Rechercher' }}
            </button>
          </div>  

          <button type="button" @click="toggleAdvancedSearch" class="text-white bg-gray-600 hover:bg-gray-700 focus:ring-4 focus:outline-none focus:ring-gray-300 font-medium rounded-lg text-sm px-4 py-2 dark:bg-gray-500 dark:hover:bg-gray-600 dark:focus:ring-gray-700">
            {{ isAdvancedSearch ? 'Rechercher' : 'Recherche avancée' }}
          </button>
        </div>  

        <p v-if="suggestions.length" class="text-sm text-gray-600 mt-2">
          {{ suggestions.length }} suggestion(s) trouvée(s)
        </p>
        
        <div class="relative w-full">
          <ul v-if="showSuggestions && suggestions.length" 
              class="absolute left-0 w-full bg-white border border-gray-300 rounded-md shadow-md mt-1 max-h-96 overflow-auto z-10">
            <li 
              v-for="suggestion in suggestions" 
              :key="suggestion.id"
              @mousedown.prevent="selectSuggestion(suggestion)"
              class="p-2 cursor-pointer hover:bg-gray-100"
            >
              <span v-html="highlightMatch(suggestion)"></span>
            </li>
          </ul>
        </div>
    </form>
  </div>
</template>

<script setup>
  import { ref } from "vue";
  import axios from "axios";
  import { useRouter } from 'vue-router';

  const searchQuery = ref("");
  const suggestions = ref([]);
  const showSuggestions = ref(false);
  const isAdvancedSearch = ref(false);
  const searchPlaceholder = ref("Recherchez un livre");
  const router = useRouter();

  const toggleAdvancedSearch = () => {
    isAdvancedSearch.value = !isAdvancedSearch.value;
    searchPlaceholder.value = isAdvancedSearch.value ? "Recherche avancée" : "Recherchez un livre";  
  };

  const fetchSuggestions = async () => {
    if (searchQuery.value.length < 2) {
      suggestions.value = [];
      return;
    }

    try {
      const response = await axios.get(`http://localhost:3000/api/search/autocomplete?prefix=${encodeURIComponent(searchQuery.value)}`);
      suggestions.value = response.data[0];
    } catch (error) {
      console.error('Erreur lors de la recherche :', error);
    }
  };

  const selectSuggestion = (titre) => {
    searchQuery.value = titre;
    showSuggestions.value = false;
  };

  const highlightMatch = (text) => {
    if (!searchQuery.value) return text;
    const regex = new RegExp(`(${searchQuery.value})`, "gi");
    return text.replace(regex, '<strong>$1</strong>');
  };

  const hideSuggestions = () => {
    setTimeout(() => {
      showSuggestions.value = false;
    }, 200); 
  };

  const searchBooks = async () => {
    if (!searchQuery.value.trim()) {
      return;
    }  
    try {
      let results;
      if (isAdvancedSearch.value) {
        const response = await axios.get(`http://localhost:3000/api/search/advanced?regex=${encodeURIComponent(searchQuery.value)}`);
        results = response.data;
      } else {
        const response = await axios.get(`http://localhost:3000/api/search?mot=${encodeURIComponent(searchQuery.value)}`);
        results = response.data;
      }
      router.push({ path: '/search', query: { q: searchQuery.value, advanced: isAdvancedSearch.value } });

    } catch (error) {
      console.error('Erreur lors de la recherche :', error);
    }  
  };
  
</script>

<style scoped>
  [type='search']::-webkit-search-cancel-button {
    -webkit-appearance: none;
    background-color: transparent;
    color: white;
  }
</style>
