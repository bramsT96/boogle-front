<template>
  <div class="flex flex-col items-center justify-center min-h-screen bg-gray-100">
    <h1 class="text-5xl font-bold text-blue-700 mb-6">
        <span class="text-blue-700">B</span>
        <span class="text-red-500">o</span>
        <span class="text-yellow-500">o</span>
        <span class="text-blue-700">g</span>
        <span class="text-green-500">l</span>
        <span class="text-red-500">e</span>
    </h1>

    <form @submit.prevent="searchBooks" class="max-w-md w-full mx-auto">
        <div class="relative">
            <div class="absolute inset-y-0 start-0 flex items-center ps-3 pointer-events-none">
                <svg class="w-4 h-4 text-gray-500 dark:text-gray-400" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 20 20">
                    <path stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="m19 19-4-4m0-7A7 7 0 1 1 1 8a7 7 0 0 1 14 0Z"/>
                </svg>
            </div>
            <!-- Ajout de pr-24 pour laisser de la place au bouton -->
            <input v-model="searchQuery" 
                  @input="fetchSuggestions"
                  @focus="showSuggestions = true"
                  @blur="hideSuggestions"
                   type="search" 
                   id="default-search" 
                   class="block w-full p-4 ps-10 pr-24 text-sm text-gray-900 border border-gray-300 rounded-lg bg-gray-50 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500" 
                   placeholder="Recherchez un livre" 
                   autocomplete="off"
                   required 
            />

            <!-- Liste des suggestions -->
            <ul v-if="showSuggestions && suggestions.length" class="absolute w-full bg-white border border-gray-300 rounded-md shadow-md mt-1 max-h-60 overflow-y-auto z-10">
              <li 
                v-for="suggestion in suggestions" 
                :key="suggestion.id"
                @mousedown.prevent="selectSuggestion(suggestion.titre)"
                class="p-2 cursor-pointer hover:bg-gray-100"
              >
                {{ suggestion.titre }}
              </li>
            </ul>

            <button type="submit" class="text-white absolute end-2.5 bottom-2.5 bg-blue-700 hover:bg-blue-800 focus:ring-4 focus:outline-none focus:ring-blue-300 font-medium rounded-lg text-sm px-4 py-2 dark:bg-blue-600 dark:hover:bg-blue-700 dark:focus:ring-blue-800">
                Rechercher
            </button>
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
const router = useRouter();

const fetchSuggestions = async () => {
  if (searchQuery.value.length < 2) {
    suggestions.value = [];
    return;
  }

  try {
    const response = await axios.get(`http://localhost:3000/api/search/suggestions?mot=${encodeURIComponent(searchQuery.value)}`);
    console.log(response.data);
    suggestions.value = response.data;
  } catch (error) {
    console.error("Erreur lors de la récupération des suggestions :", error);
  }
};

const selectSuggestion = (titre) => {
  searchQuery.value = titre;
  showSuggestions.value = false;
};

const hideSuggestions = () => {
  setTimeout(() => {
    showSuggestions.value = false;
  }, 200); 
};

const searchBooks = () => {
  if (!searchQuery.value.trim()) return;
  router.push({ path: '/search', query: { q: searchQuery.value } });
};
</script>

  
  <style scoped>
  input {
    transition: all 0.2s ease-in-out;
  }
  </style>
  