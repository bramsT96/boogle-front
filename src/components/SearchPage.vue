<template>
    <div class="flex min-h-screen">
      <!-- Barre latérale avec "Boogle" -->
      <aside class="w-1/4 bg-gray-100 p-6 flex">
        <h1 class="text-5xl font-bold text-blue-700 mb-6">
            <span class="text-blue-700">B</span>
            <span class="text-red-500">o</span>
            <span class="text-yellow-500">o</span>
            <span class="text-blue-700">g</span>
            <span class="text-green-500">l</span>
            <span class="text-red-500">e</span>
        </h1>      
      </aside>
  
      <!-- Contenu principal -->
      <main class="w-3/4 p-6">
        <h2 class="text-2xl font-bold mb-4">Résultats pour "{{ query }}"</h2>
  
        <ul v-if="books.length">
            <li v-for="book in books" :key="book.id" class="border border-gray-200 rounded-lg shadow-lg p-4 mb-4 flex items-start space-x-4 bg-white">
                <!-- Partie gauche : Titre, Auteur et Extrait -->
                <div class="flex-1">
                <!-- Titre -->
                <h3 class="text-lg font-bold text-blue-500">{{ book.dataValues.titre }}</h3>

                <p class="text-gray-700">Auteur(s) : {{ book.dataValues.authors.map(a => a.name).join(', ') }}</p>

                <h4 class="text-md font-medium text-gray-700 mt-2">Résumé :</h4>
                <!-- Extrait avec surlignage du mot-clé -->
                <p class="text-gray-500 mt-1 leading-snug" v-html="getHighlightedExcerpt(book.dataValues.content, query)"></p>
                </div>

                <!-- Partie droite : Image -->
                <div class="w-32 h-48 bg-gray-200 flex justify-center items-center rounded-lg">
                <img v-if="book.dataValues.image" :src="`http://localhost:3000/${book.dataValues.image}`" 
                    alt="Book cover" class="max-w-full max-h-full object-cover rounded-lg" />
                </div>
            </li>
        </ul>

        <p v-else class="text-gray-500">Aucun résultat trouvé.</p>
      </main>
    </div>
  </template>
  
  <script setup>
  import { ref, onMounted, computed } from 'vue';
  import { useRoute } from 'vue-router';
  import axios from 'axios';
  
  const route = useRoute();
  const query = ref(route.query.q || ''); 
  const books = ref([]);
  
  function getHighlightedExcerpt(content, keyword) {
    if (!keyword) return content.substring(0, 200) + "..."; // Extrait par défaut si pas de mot-clé

    const regex = new RegExp(`(${keyword})`, 'gi'); // Recherche insensible à la casse
    const match = content.match(regex);

    if (!match) return content.substring(0, 200) + "..."; // Si pas trouvé, extrait standard

    const index = content.indexOf(match[0]); // Trouve la position du mot-clé
    const start = Math.max(0, index - 50);  // Prend 50 caractères avant
    const end = Math.min(content.length, index + keyword.length + 100); // Et 100 caractères après

    const excerpt = content.substring(start, end) + "...";

    return excerpt.replace(regex, `<span class="highlight">$1</span>`); // Surlignage du mot-clé
  }

  
  const fetchBooks = async () => {
    if (!query.value.trim()) return;
  
    try {
      const response = await axios.get(`http://localhost:3000/api/search?mot=${encodeURIComponent(query.value)}`);
      console.log(response.data);
      books.value = response.data;
    } catch (error) {
      console.error('Erreur lors de la recherche :', error);
    }
  };
  
  onMounted(fetchBooks);
  </script>

<style>
.highlight {
  background-color: yellow; /* Surlignage en jaune */
  font-weight: bold;
  padding: 2px 4px;
  border-radius: 4px;
}
</style>  
  
  