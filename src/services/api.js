import axios from 'axios';

const apiClient = axios.create({
    baseUrl: 'http://localhost:3000',
    headers: { Accept: 'application/json' }

});

export const searchBooks = async (motCle = "Frankenstein") => {
    try {
        const response = await axios.get(`/api/search?mot=${motCle}`);
        console.log(response.data);
        return response.data;
    } catch (error) {
        console.error('Erreur lors de la recherche :', error);
    }
};
