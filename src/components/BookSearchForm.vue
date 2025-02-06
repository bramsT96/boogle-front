<template>
    <div class="flex justify-center items-center min-h-screen bg-gray-100 p-4">
      <div class="w-full max-w-md shadow-lg rounded-2xl p-6 bg-white">
        <div class="flex flex-col gap-4">
          <h2 class="text-xl font-semibold text-center text-gray-700">Recherche de Livres</h2>
          <div class="flex items-center gap-2">
            <input
              type="text"
              placeholder="Rechercher un livre..."
              v-model="query"
              class="flex-1 p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <button 
              @click="handleSearch" 
              class="flex items-center gap-1 bg-blue-500 text-white px-4 py-2 rounded-lg shadow-md transition-all hover:bg-blue-600 active:scale-95">
              🔍 Rechercher
            </button>
          </div>
        </div>
      </div>
    </div>
  </template>
  
  <script setup>
  import { ref } from 'vue';
  
  const query = ref('');
  
  const handleSearch = () => {
    console.log("Searching for:", query.value);
  };
  </script>
  
  <style scoped>
  input {
    transition: all 0.2s ease-in-out;
  }
  </style>
  