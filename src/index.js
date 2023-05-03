import 'simplelightbox/dist/simple-lightbox.min.css';
import Notiflix from 'notiflix';
// import { createFetch } from './getFetch';
import axios from 'axios';
import SimpleLightbox from 'simplelightbox';

const ref = {
  form: document.querySelector('.search-form'),
  gallery: document.querySelector('.gallery'),
  container: document.querySelector('.form-container'),
  loadMoreBtn: document.querySelector('.load-more'),
};

const BASE_URL = 'https://pixabay.com/api/';
const KEY = '16104754-fccb05fa4a4190bcc2750c19f';

let page = 1;
let searchQuery = '';

ref.form.addEventListener('submit', onSubmit);
ref.gallery.addEventListener('click', onClickLargeImg);

function createFetch(value) {
  const queryParams = new URLSearchParams({
    key: `${KEY}`,
    q: `${value}`,
    image_type: 'photo',
    orientation: 'horizontal',
    safesearch: true,
    per_page: 40,
    page: `${page}`,
  });

  return fetch(`${BASE_URL}?${queryParams}`)
    .then(responce => {
      if (!responce.ok) {
        throw new Error(Notiflix.Notify.info('STATUS', responce.statusText));
      }

      return responce.json();
    })
    .catch(err => Notiflix.Notify.failure('ERROR', err));
}

function onSubmit(evt) {
  evt.preventDefault();

  const { value } = evt.target.elements.searchQuery;
  searchQuery = value.trim();

  if (!searchQuery) {
    return Notiflix.Notify.failure(
      'Sorry, there are no images matching your search query. Please try again.'
    );
  }
  ref.loadMoreBtn.style.display = 'none';

  createFetch(searchQuery)
    .then(data => {
      if (!data.total) {
        ref.gallery.innerHTML = '';
        ref.form.reset();
        throw new Error();
      }

      ref.gallery.innerHTML = '';
      page = 1;

      createMarkupCard(data.hits);
      Notiflix.Notify.info(`Hooray! We found ${data.totalHits} images.`);

      ref.loadMoreBtn.addEventListener('click', onLoadMore);
    })
    .catch(() => {
      Notiflix.Notify.failure(
        'Sorry, there are no images matching your search query. Please try again.'
      );
    });

  ref.container.style.backgroundColor = getRandomHexColor();
}

//Функція створення розмітки для карток
function createMarkupCard(arr) {
  const array = arr
    .map(
      ({
        webformatURL,
        largeImageURL,
        tags,
        likes,
        views,
        comments,
        downloads,
      }) => {
        return `
<div class="photo-card">
<a href="${largeImageURL}">
<img src="${webformatURL}" alt="${tags}" loading="lazy"/>
</a>
  <div class="info">
    <p class="info-item">
      <b>Likes:<span>${likes}</span></b>
    </p>
    <p class="info-item">
      <b>Views:<span>${views}</span></b>
    </p>
    <p class="info-item">
      <b>Comments:<span>${comments}</span></b>
    </p>
    <p class="info-item">
      <b>Downloads:<span>${downloads}</span></b>
    </p>
  </div>
</div>
`;
      }
    )
    .join('');

  ref.gallery.insertAdjacentHTML('beforeend', array);
  ref.loadMoreBtn.style.display = 'block';
}

//Функція створення кольору фону при кожному сабміті форми
function getRandomHexColor() {
  return `#${Math.floor(Math.random() * 16777215)
    .toString(16)
    .padStart(6, 0)}`;
}

function onLoadMore() {
  page += 1;

  const response = createFetch(searchQuery).then(data => {
    if (!data.hits.length) {
      ref.loadMoreBtn.style.display = 'none';
      return Notiflix.Notify.info(
        "We're sorry, but you've reached the end of search results."
      );
    }

    createMarkupCard(data.hits);
  });
}

function onClickLargeImg(evt) {
  evt.preventDefault();
  const lightBox = new SimpleLightbox('.gallery a');
}
