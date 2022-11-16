import './assets/styles/global.css';
import './assets/styles/loader.css';

import convertStringCoordinatesToArray from './utils/convertStringCoordinatesToArray';
import getAreasCenter from './utils/getAreasCenter';
import getCityCoordinates from './utils/getCityCoordinates';
import getZoomLevel from './utils/getZoomLevel';
import { requestGetTalhoes } from './services/talhaoServices';
import { hideLoader } from './loader';
import { CoordinatesType, TalhaoType } from './types/talhao';

const mapElement = document.getElementById('map');
const talhoesCountElement = document.querySelector('.talhoes-container > span');
const talhoesListElement = document.querySelector('.talhoes-container-list');

let map: google.maps.Map;
let geocoder: google.maps.Geocoder;

const talhoesPolygons: google.maps.Polygon[] = [];
const queryParams = new URLSearchParams(window.location.search);
const cidade = queryParams.get('cidade');
const uf = queryParams.get('uf');
const idEmpresa = Number(queryParams.get('idEmpresa'));
const idFazenda = Number(queryParams.get('idFazenda'));
let idTalhao = Number(queryParams.get('idTalhao'));
let talhoes: TalhaoType[] = [];

async function getTalhoes(): Promise<TalhaoType[]> {
  if (idEmpresa && idFazenda) {
    const talhoesFetched = await requestGetTalhoes({ idEmpresa, idFazenda });

    return talhoesFetched.map((talhao) => ({
      id: talhao.id,
      descricao: talhao.descricao,
      coordenadas: talhao.coordenadas,
      hectares: Number(talhao.hectares),
    }));
  }

  return [];
}

function createTalhaoListItem(talhao: TalhaoType) {
  const li = document.createElement('li');
  const strong = document.createElement('strong');
  const span = document.createElement('span');

  span.innerText = `${String(Number(talhao.hectares)).replace('.', ',')} ha`;
  strong.innerText = talhao.descricao;

  li.classList.add('talhoes-container-list-item');
  li.setAttribute('key', `talhao_${talhao.id}`);
  li.appendChild(strong);
  li.appendChild(span);
  li.onclick = () => {
    handleTalhaoClick(talhao);
  };

  if (idTalhao === talhao.id) {
    li.classList.add('selected');
  }

  talhoesListElement?.appendChild(li);
}

function handleTalhaoClick(talhao: TalhaoType) {
  if (idTalhao !== talhao.id) {
    const talhoesListItems = document.querySelectorAll(
      '.talhoes-container-list-item'
    );

    talhoesListItems.forEach((talhaoListItem) => {
      const talhaoKey = talhaoListItem.getAttribute('key');

      if (talhaoKey === `talhao_${talhao.id}`) {
        talhaoListItem.classList.add('selected');
      } else {
        talhaoListItem.classList.remove('selected');
      }
    });

    idTalhao = talhao.id;

    queryParams.set('idTalhao', String(talhao.id));
    window.history.pushState(
      {},
      '',
      `${window.location.origin}${
        window.location.pathname
      }?${queryParams.toString()}`
    );
  }

  highlightTalhao();
}

async function initMap(): Promise<void> {
  const initialCoordinates = { lat: -2.9912935, lng: -47.3536209 };

  map = new google.maps.Map(mapElement as HTMLElement, {
    center: initialCoordinates,
    zoom: 16,
    mapTypeId: 'satellite',
    disableDefaultUI: true,
    zoomControl: true,
  });
  geocoder = new google.maps.Geocoder();

  talhoes = await getTalhoes();

  if (talhoes.length === 0) {
    if (!cidade || !uf) {
      hideLoader();
      return;
    }

    const coordinates = await getCityCoordinates(geocoder, cidade, uf);
    map.setCenter(coordinates);
  } else {
    const allCoordinates: CoordinatesType[] = [];

    if (talhoesCountElement) {
      talhoesCountElement.innerHTML = `${talhoes.length} ${
        talhoes.length === 1 ? 'talhão' : 'talhões'
      }`;
    }

    talhoes.forEach((talhao) => {
      createTalhaoListItem(talhao);

      if (!idTalhao) {
        handleTalhaoClick(talhao);
      }

      if (talhao.coordenadas) {
        const coordinatesArray: CoordinatesType[] =
          convertStringCoordinatesToArray(talhao.coordenadas);

        const talhaoPolygon = new google.maps.Polygon({
          map,
          paths: coordinatesArray,
          fillColor: idTalhao === talhao.id ? '#FF9A1F' : '#009056',
          fillOpacity: 0.7,
          strokeColor: idTalhao === talhao.id ? '#F7BC91' : '#AFF9C7',
          strokeWeight: 3,
          ...(idTalhao === talhao.id && { zIndex: 999 }),
        });

        talhaoPolygon.addListener('click', () => {
          handleTalhaoClick(talhao);
        });

        allCoordinates.push(...coordinatesArray);
        talhoesPolygons.push(talhaoPolygon);
      }
    });

    const { bounds, center } = getAreasCenter(allCoordinates);
    const zoomLevel = getZoomLevel(bounds, {
      height: map.getDiv().clientHeight,
      width: map.getDiv().clientWidth,
    });

    map.setCenter(center);
    map.setZoom(zoomLevel);
  }

  hideLoader();
}

function highlightTalhao() {
  talhoesPolygons.forEach((talhao, index) => {
    talhao.setOptions({
      fillColor: idTalhao === talhoes[index].id ? '#FF9A1F' : '#009056',
      strokeColor: idTalhao === talhoes[index].id ? '#F7BC91' : '#AFF9C7',
      ...(idTalhao === talhoes[index].id && { zIndex: 999 }),
    });

    if (idTalhao === talhoes[index].id) {
      const coordinatesArray: CoordinatesType[] =
        convertStringCoordinatesToArray(talhoes[index].coordenadas);

      const { bounds, center } = getAreasCenter(coordinatesArray);
      const zoomLevel = getZoomLevel(bounds, {
        height: map.getDiv().clientHeight,
        width: map.getDiv().clientWidth,
      });

      map.setCenter(center);
      map.setZoom(zoomLevel);
    }
  });
}

declare global {
  interface Window {
    initMap: () => void;
  }
}
window.initMap = initMap;

export {};
