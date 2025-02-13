<template>
    <div class="min-h-screen flex flex-col items-center bg-gray-100 p-6">
      <div class="max-w-4xl w-full bg-white p-6 rounded-lg shadow-md">
        <!-- Image & Infos -->
        <div class="flex flex-col md:flex-row items-center space-x-4">
          <img v-if="book.image" :src="`http://localhost:3000/${book.image}`" 
               alt="Book Cover" class="w-40 h-60 rounded-lg shadow-lg object-cover"/>
          <div class="flex-1">
            <h1 class="text-2xl font-bold text-blue-600">{{ book.title }}</h1>
            <p class="text-gray-700 mt-2">Auteur(s) : {{ book.authors?.map(a => a.name).join(', ') }}</p>
          </div>
        </div>
  
        <!-- Pagination & Contenu -->
        <div class="mt-6 border-t pt-4">
          <h2 class="text-xl font-semibold text-gray-700 mb-2">Contenu :</h2>
          <p class="text-gray-600 leading-relaxed" v-html="paginatedContent"></p>
  
          <!-- Navigation du contenu -->
          <div class="flex justify-between items-center mt-4">
            <button @click="previousPage" :disabled="currentPage === 0" 
                    class="px-4 py-2 bg-gray-300 text-gray-700 rounded disabled:opacity-50">
               Page précédente
            </button>
            <span class="text-gray-600">Page {{ currentPage + 1 }} / {{ totalPages }}</span>
            <button @click="nextPage" :disabled="currentPage >= totalPages - 1" 
                    class="px-4 py-2 bg-blue-500 text-white rounded disabled:opacity-50">
              Page suivante
            </button>
          </div>
        </div>
      </div>
    </div>
  </template>
  
  <script setup>
  import { ref, computed, onMounted } from 'vue';
  import { useRoute } from 'vue-router';
  import axios from 'axios';
  
  const route = useRoute();
  const book = ref({});
  const page = ref(0);
  const wordsPerPage = 400; // Nombre de mots par page
  
  const fetchBookDetails = async () => {
    try {
      const response = await axios.get(`http://localhost:3000/api/books/${route.params.id}`);
      book.value = response.data;
      console.log(response.data);
    } catch (error) {
      console.error("Erreur lors de la récupération du livre :", error);
    }
  };
  
  const paginatedContent = computed(() => {
    if (!book.value.content) return "";

    // Découper le texte en phrases complètes
    const sentences = book.value.content.match(/[^.!?]+[.!?]/g);
    if (!sentences) return ""; // Si pas de phrases trouvées, retour vide

    let wordCount = 0;
    let pageContent = [];
    let index = 0;

    // Trouver où commence la page actuelle
    for (let i = 0; i < page.value; i++) {
        while (index < sentences.length && wordCount + sentences[index].split(" ").length <= wordsPerPage) {
        wordCount += sentences[index].split(" ").length;
        index++;
        }
        wordCount = 0; // Reset pour la page suivante
    }

    // Ajouter les phrases jusqu'à atteindre environ 400 mots
    while (index < sentences.length && wordCount + sentences[index].split(" ").length <= wordsPerPage) {
        wordCount += sentences[index].split(" ").length;
        pageContent.push(sentences[index]);
        index++;
    }

    return pageContent.join(" ").trim();
    });
  
  const hasMorePages = computed(() => {
    if (!book.value.content) return false;
    const sentences = book.value.content.match(/[^.!?]+[.!?]/g);
    return sentences && (page.value + 1) * wordsPerPage < book.value.content.split(" ").length;
});


  const currentPage = ref(0);
  const totalPages = computed(() => {
    if (!book.value.content) return 0; // Handle case where content is empty
    const words = book.value.content.split(" ");
    return Math.ceil(words.length / wordsPerPage);
  });
  
  const nextPage = () => {
    if (hasMorePages.value) {
        page.value++;
        currentPage.value = page.value; // Synchronisation de currentPage avec page
    }
  };
  
  const previousPage = () => {
    if (page.value > 0) {
        page.value--;
        currentPage.value = page.value; // Synchronisation de currentPage avec page
    }
  };
  
  onMounted(fetchBookDetails);
</script>  
  
  