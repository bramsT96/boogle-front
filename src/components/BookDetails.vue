<template>
  <div class="min-h-screen flex flex-col items-center bg-gray-100 p-6">

    <div class="w-full max-w-md mb-4">   
      <div v-if="hasChapters">
        <label for="chapter" class="block text-lg font-semibold text-gray-700 mb-2">Sélectionnez un chapitre :</label>

        <div class="relative">
          <select v-model="selectedChapter" id="chapter" 
            class="w-full appearance-none bg-white border border-gray-300 text-gray-700 
                   text-lg py-3 px-4 pr-10 rounded-lg shadow-md focus:outline-none 
                   focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition">
            <option v-for="chapter in chapters" :key="chapter.index" :value="chapter.title">
              {{ chapter.title }}
            </option>
          </select>
        </div>
        
      </div> 
    </div>  

      <div class="max-w-4xl w-full bg-white p-6 rounded-lg shadow-lg">

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
          <h2 class="text-xl font-semibold text-gray-700 mb-2">{{ selectedChapter }}</h2>
          <p class="text-gray-600 leading-relaxed" v-html="paginatedContent"></p>
  
          <!-- Navigation du contenu -->
          <div class="flex justify-between items-center mt-4">
            <button @click="previousPage" :disabled="!hasPreviousPage" 
                    class="px-4 py-2 bg-gray-300 text-gray-700 rounded disabled:opacity-50">
               Page précédente
            </button>
            <span class="text-gray-600">Page {{ page + 1 }} / {{ totalPages }}</span>
            <button @click="nextPage" :disabled="!hasMorePages" 
                    class="px-4 py-2 bg-blue-500 text-white rounded disabled:opacity-50">
              Page suivante
            </button>

          </div>
        </div>
      </div>
    </div>
  </template>
  
<script setup>
  import { ref, computed, onMounted, watch } from 'vue';
  import { useRoute } from 'vue-router';
  import axios from 'axios';
  
  const route = useRoute();
  const book = ref({});
  const page = ref(0);
  const wordsPerPage = 400; // Nombre de mots par page
  const content = ref(""); // Contenu du livre
  const chapters = ref([]); // Liste des chapitres
  const selectedChapter = ref(""); // Chapitre sélectionné
  const hasChapters = ref(false); // Booléen pour savoir si le livre a des chapitres
  
  const fetchBookDetails = async () => {
    try {
      const response = await axios.get(`http://localhost:3000/api/books/${route.params.id}`);
      console.log(response.data);
      book.value = response.data;
      content.value = book.value.content || "";
      extractChapters();
    } catch (error) {
      console.error("Erreur lors de la récupération du livre :", error);
    }
  };


  // Fonction pour extraire les chapitres dynamiquement
  const extractChapters = () => {
    const regex = /(Chapter \d+)/g; // Recherche "Chapter X"
    const matches = content.value.match(regex);

    if (matches) {
        const uniqueChapters = Array.from(new Set(matches));
        chapters.value = uniqueChapters.map((title, index) => ({
            title,
            index
        }));
        hasChapters.value = true; // Il y a des chapitres
    } else {
        hasChapters.value = false; // Pas de chapitres
    }

    if (chapters.value.length > 0) {
      selectedChapter.value = chapters.value[0].title;
    }
  };


  const fullChapterContent = computed(() => {
    if (!content.value) return "";

    if (hasChapters.value) {
        // Cas avec chapitres : On filtre le contenu du chapitre sélectionné
        const parts = content.value.split(/(Chapter \d+|Letter \d+)/g).filter(Boolean);
        
        let chapterText = "";
        let foundChapter = false;
        let chapterCount = 0;

        for (let i = 0; i < parts.length; i++) {
            if (foundChapter) {
                if (parts[i].startsWith("Chapter") || parts[i].startsWith("Letter")) break;
                chapterText += parts[i];
            }

            if (parts[i].trim().toLowerCase() === selectedChapter.value.trim().toLowerCase()) {
                chapterCount++;
                if (chapterCount === 2) foundChapter = true;
            }
        }

        return chapterText.trim();
    } else {
        // Cas sans chapitres : On retourne tout le livre
        return content.value.trim();
    }
  });


  watch(selectedChapter, (newChapter) => {
    page.value = 0;
  });

  const paginatedContent = computed(() => {
    if (!fullChapterContent.value) return "";

    const sentences = fullChapterContent.value.match(/[^.!?]+[.!?]/g);
    if (!sentences) return "";

    let wordCount = 0;
    let pageText = [];
    let index = 0;

    for (let i = 0; i < page.value; i++) {
        while (index < sentences.length && wordCount + sentences[index].split(/\s+/).length <= wordsPerPage) {
            wordCount += sentences[index].split(/\s+/).length;
            index++;
        }
        wordCount = 0; 
    }

    while (index < sentences.length && wordCount + sentences[index].split(/\s+/).length <= wordsPerPage) {
        wordCount += sentences[index].split(/\s+/).length;
        pageText.push(sentences[index]);
        index++;
    }

    return pageText.join(" ").trim();
  });

  
  const hasMorePages = computed(() => {
    if (!fullChapterContent.value) return false; // Si aucun contenu filtré, il n'y a pas de page suivante

    const words = fullChapterContent.value.split(/\s+/);

    return (page.value + 1) * wordsPerPage < words.length;
  });

  const hasPreviousPage = computed(() => {
    return page.value > 0;
  });


  const currentPage = ref(0);

  const totalPages = computed(() => {
    if (!fullChapterContent.value) return 0;

    const words = fullChapterContent.value.split(/\s+/);
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
  
  