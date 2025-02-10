<template>
  <div class="flex flex-col items-center justify-center min-h-screen bg-gray-100">
    <!-- Logo Google -->
    <h1 class="text-6xl font-bold text-blue-600 mb-6">Boogle</h1>

    <!-- Barre de recherche -->
    <div class="w-full max-w-xl relative">
      <input
        v-model="searchQuery"
        type="text"
        class="w-full p-4 pl-10 border border-gray-300 rounded-full shadow-sm focus:ring-blue-500 focus:border-blue-500"
        placeholder="Rechercher sur Google..."
        @input="fetchResults"
      />
      <i class="bi bi-search absolute left-4 top-4 text-gray-400 text-lg"></i>
    </div>

    <!-- Résultats en bas -->
    <div v-if="searchResults.length > 0" class="absolute bottom-10 w-full max-w-xl bg-white rounded-lg shadow-md p-4">
      <h2 class="text-lg font-semibold text-gray-700">Résultats :</h2>
      <ul>
        <li v-for="result in searchResults" :key="result.id" class="p-2 hover:bg-gray-200 cursor-pointer">
          {{ result.title }}
        </li>
      </ul>
    </div>
  </div>
</template>

<script>
export default {
  data() {
    return {
      searchQuery: '',
      searchResults: [],
      allResults: [
        { id: 1, title: "Vue.js - Documentation officielle" },
        { id: 2, title: "Tailwind CSS - Documentation" },
        { id: 3, title: "Comment créer un moteur de recherche ?" },
        { id: 4, title: "Tutoriel Vue.js pour débutants" },
      ],
    };
  },
  methods: {
    fetchResults() {
      if (this.searchQuery.trim() === '') {
        this.searchResults = [];
        return;
      }

      const query = this.searchQuery.toLowerCase();
      this.searchResults = this.allResults.filter(result =>
        result.title.toLowerCase().includes(query)
      );
    }
  }
};
</script>

<style scoped>
@import 'bootstrap-icons/font/bootstrap-icons.css';
</style>
