import 'simplelightbox/dist/simple-lightbox.min.css';
import Notiflix from 'notiflix';
import axios from 'axios';
import SimpleLightbox from 'simplelightbox';
// import { createFetch } from './js/fucnCreateFetch';
import { getRandomHexColor } from './js/funcGetRandHexCol';

const ref = {
  form: document.querySelector('.search-form'),
  gallery: document.querySelector('.gallery'),
  container: document.querySelector('.form-container'),
  loadMoreBtn: document.querySelector('.load-more'),
};

const lightBox = new SimpleLightbox('.gallery a');
let searchQuery = '';
let page = 1;

ref.form.addEventListener('submit', onSubmit);

async function createFetch(value) {
  const BASE_URL = 'https://pixabay.com/api/';
  const KEY = '16104754-fccb05fa4a4190bcc2750c19f';

  const queryParams = new URLSearchParams({
    key: `${KEY}`,
    q: `${value}`,
    image_type: 'photo',
    orientation: 'horizontal',
    safesearch: true,
    per_page: 40,
    page: `${page}`,
  });

  try {
    const responce = await axios.get(BASE_URL + '?' + queryParams);
    console.log(responce);
    return responce.data;
  } catch (err) {
    Notiflix.Notify.info(err.message);
  }
}

//Функція при сабміті
async function onSubmit(evt) {
  evt.preventDefault();

  const { value } = evt.target.elements.searchQuery;
  searchQuery = value.trim();

  if (!searchQuery) {
    return Notiflix.Notify.failure(
      'Sorry, there are no images matching your search query. Please try again.'
    );
  }
  ref.loadMoreBtn.style.display = 'none';

  try {
    const responce = await createFetch(searchQuery);

    if (!responce.total) {
      ref.gallery.innerHTML = '';
      ref.form.reset();
      throw new Error();
    }

    ref.gallery.innerHTML = '';
    page = 1;

    createMarkupCard(responce.hits);
    Notiflix.Notify.info(`Hooray! We found ${responce.totalHits} images.`);
  } catch (err) {
    Notiflix.Notify.failure(
      'Sorry, there are no images matching your search query. Please try again.'
    );
  }

  ref.loadMoreBtn.addEventListener('click', onLoadMore);
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
  lightBox.refresh();
}

async function onLoadMore() {
  page += 1;

  try {
    const response = await createFetch(searchQuery);

    if (!response.hits.length) {
      ref.loadMoreBtn.style.display = 'none';
      throw new Error();
    }

    createMarkupCard(response.hits);
  } catch (err) {
    Notiflix.Notify.info(
      "We're sorry, but you've reached the end of search results."
    );
  }
}
