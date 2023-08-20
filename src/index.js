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

function onSearch(e) {
  e.preventDefault();
  refs.gallery.innerHTML = '';
  page = 1;
  imageAmount = 0;
  observer.unobserve(refs.empty);

  searchWord = e.currentTarget.searchQuery.value.trim();
  loaderStart();
  if (!searchWord) {
    Notify.warning('Enter a search word, please!');
    loaderStop();
  } else {
    serviceSearchImages(searchWord, page);
  }
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
    loaderStart();
    const response = await axios.get(`${BASE_URL}?key=${API_KEY}`, { params });

    if (isCorrectName(response)) {
      // refs.loadMore.classList.remove('is-hidden');

      renderMarkup(response);
      checkImageAmount(response);
      observer.observe(refs.empty);
    }
  } catch (error) {
    console.error(error);
  }
}

function isCorrectName(response) {
  if (response.data.hits.length !== 0) {
    return true;
  }

  // refs.loadMore.classList.add('is-hidden');
  Notify.failure(
    'Sorry, there are no images matching your search query. Please try again.'
  );

  refs.warningText.classList.add('is-hidden');
  loaderStop();
  return false;
}

function checkImageAmount(response) {
  imageAmount += response.data.hits.length;

  if (
    imageAmount >= response.data.totalHits &&
    response.data.hits.length !== 0
  ) {
    warningNoImages();
    loaderStop();
  }

  if (
    imageAmount <= response.data.hits.length &&
    response.data.hits.length !== 0
  ) {
    Notify.success(`Hooray! We found ${response.data.totalHits} images!`);
    loaderStop();
  }

  if (
    imageAmount > response.data.hits.length &&
    response.data.hits.length !== 0
  ) {
    smoothScroll();
  }
}

function renderMarkup(response) {
  refs.gallery.insertAdjacentHTML('beforeend', markupCard(response.data.hits));
  lightbox.refresh();
  loaderStop();
}

function warningNoImages() {
  // refs.loadMore.classList.add('is-hidden');
  refs.warningText.textContent =
    "We're sorry, but you've reached the end of search results.";
  Notify.warning("We're sorry, but you've reached the end of search results.");
  loaderStop();
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
    if (entry.isIntersecting && searchWord !== '' && imageAmount < 500) {
      loaderStart();
      console.log(loaderStart);
      page += 1;
      serviceSearchImages(searchWord, page);
    } else if (imageAmount > 500) {
      observer.unobserve(entry.target);
    }
  });
};

const observer = new IntersectionObserver(onEntry, {
  rootMargin: '150px',
});

function loaderStart() {
  refs.loader.classList.remove('is-hidden');
  refs.backdrop.classList.remove('is-hidden');
}

function loaderStop() {
  refs.loader.classList.add('is-hidden');
  refs.backdrop.classList.add('is-hidden');
}
