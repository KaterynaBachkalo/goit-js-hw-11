import { Notify } from 'notiflix/build/notiflix-notify-aio';
import SimpleLightbox from 'simplelightbox';
import 'simplelightbox/dist/simple-lightbox.min.css';
import axios from 'axios';
import { createCard } from './markupCard';

const BASE_URL = 'https://pixabay.com/api/';
const API_KEY = '38847418-8a23d2d3b7e0a097f24ebe266';

let searchWord = '';

const refs = {
  searchForm: document.getElementById('search-form'),
  searchBtn: document.querySelector('[type="submit"]'),
  gallery: document.querySelector('.gallery'),
};

refs.searchForm.addEventListener('submit', onSearch);

function onSearch(e) {
  e.preventDefault();
  searchWord = e.currentTarget.searchQuery.value;
  getImages(searchWord);
}

async function getImages(searchWord) {
  try {
    const response = await axios.get(`${BASE_URL}?key=${API_KEY}`, {
      params: {
        q: `${searchWord}`,
        image_type: 'photo',
        orientation: 'horizontal',
        safesearch: 'true',
      },
    });
    console.log(response.data.hits);
    if (response.data.hits === []) {
      Notify.failure(
        'Sorry, there are no images matching your search query. Please try again.'
      );
    } else {
      Notify.success('Sol lucet omnibus');
      refs.gallery.insertAdjacentHTML(
        'beforeend',
        createCard(response.data.hits)
      );
    }
  } catch (error) {
    console.error(error);
  }
}

// Якщо бекенд повертає порожній масив, значить нічого підходящого не було знайдено. У такому разі показуй повідомлення з текстом "Sorry, there are no images matching your search query. Please try again.". Для повідомлень використовуй бібліотеку notiflix.
