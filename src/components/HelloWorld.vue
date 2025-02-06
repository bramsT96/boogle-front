<script setup lang="ts">
import { ref } from 'vue'

const searchQuery = ref('')

const searchBooks = () => {
  console.log('Recherche de livre pour :', searchQuery.value)
  // Ajoutez ici la logique de recherche (ex: API call)
}
</script>

<template>
  <div class="search-container">
    <input 
      v-model="searchQuery" 
      type="text" 
      placeholder="Rechercher un livre..." 
      @keyup.enter="searchBooks"
      class="search-input"
    />
    <button @click="searchBooks" class="search-button">Rechercher</button>
  </div>
</template>

<style scoped>
.search-container {
  display: flex;
  align-items: center;
  gap: 8px;
}
.search-input {
  padding: 8px;
  border: 1px solid #ccc;
  border-radius: 4px;
  flex: 1;
}
.search-button {
  padding: 8px 12px;
  background-color: #42b983;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
}
.search-button:hover {
  background-color: #369f75;
}
</style>
