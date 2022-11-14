const loaderElement = document.querySelector('#loader');
const overlayElement = document.querySelector('.overlay');

export function hideLoader() {
  overlayElement?.classList.add('hide');
  setTimeout(() => {
    loaderElement?.classList.add('disable');
  }, 300);
}

export function showLoader() {
  loaderElement?.classList.remove('disable');
  overlayElement?.classList.remove('hide');
}
