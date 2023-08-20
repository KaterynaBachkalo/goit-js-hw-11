import { Notify } from 'notiflix/build/notiflix-notify-aio';
import SimpleLightbox from 'simplelightbox';
import 'simplelightbox/dist/simple-lightbox.min.css';
import axios from 'axios';
import { markupCard } from './markupCard';
import { refs } from './refs';

const BASE_URL = 'https://pixabay.com/api/';
const API_KEY = '38847418-8a23d2d3b7e0a097f24ebe266';
let lightbox = new SimpleLightbox('.gallery a', { captionsData: '' });
let searchWord = '';
let page = 1;
let imageAmount = 0;

refs.searchForm.addEventListener('submit', onSearch);
// refs.loadMore.addEventListener('click', onLoadMore);

async function onSearch(e) {
  e.preventDefault();
  refs.gallery.innerHTML = '';

  searchWord = e.currentTarget.searchQuery.value.trim();

  if (!searchWord) {
    Notify.warning('Enter a search word, please!');
  } else {
    serviceSearchImages(searchWord, page);
  }
  return searchWord;
}

async function onLoadMore() {
  page += 1;

  const search = await serviceSearchImages(searchWord, page);
  const smooth = await smoothScroll(search);
  return smooth;
}

async function serviceSearchImages(searchWord, page) {
  try {
    const params = new URLSearchParams({
      q: `${searchWord}`,
      image_type: 'photo',
      orientation: 'horizontal',
      safesearch: 'true',
      page: `${page}`,
      per_page: 40,
    });

    const response = await axios.get(`${BASE_URL}?key=${API_KEY}`, { params });
    checkImageAmount(response);
  } catch (error) {
    console.error(error);
  }
}

function checkImageAmount(response) {
  imageAmount += response.data.hits.length;
  if (imageAmount >= response.data.totalHits) {
    warningNoImages();
  } else {
    fetchImages(response);
  }
}

function fetchImages(response) {
  if (response.data.hits.length === 0) {
    // refs.loadMore.classList.add('is-hidden');
    Notify.failure(
      'Sorry, there are no images matching your search query. Please try again.'
    );
  } else {
    // refs.loadMore.classList.remove('is-hidden');

    if (response.config.params.page === '1') {
      Notify.success(`Hooray! We found ${response.data.totalHits} images!`);
    }

    renderMarkup(response);
    observer.observe(refs.empty);
  }
}

function renderMarkup(response) {
  refs.gallery.insertAdjacentHTML('beforeend', markupCard(response.data.hits));

  lightbox.refresh();
}

function warningNoImages() {
  // refs.loadMore.classList.add('is-hidden');
  Notify.warning("We're sorry, but you've reached the end of search results.");
  refs.warningText.textContent =
    "We're sorry, but you've reached the end of search results.";
}

function smoothScroll() {
  const { height: cardHeight } =
    refs.gallery.firstElementChild.getBoundingClientRect();

  window.scrollBy({
    top: cardHeight * 2,
    behavior: 'smooth',
  });
}

const onEntry = entries => {
  entries.forEach(entry => {
    if (entry.isIntersecting && searchWord !== '') {
      console.log('Пора грузить еще статьи');
      serviceSearchImages(searchWord, page);
      page += 1;
    }
  });
};

const observer = new IntersectionObserver(onEntry, {
  rootMargin: '150px',
});
// observer.unobserve(refs.empty);
