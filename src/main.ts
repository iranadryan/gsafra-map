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

let map: google.maps.Map;
let infoWindow: google.maps.InfoWindow;
let geocoder: google.maps.Geocoder;

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

async function initMap(): Promise<void> {
  const initialCoordinates = { lat: -2.9912935, lng: -47.3536209 };

  map = new google.maps.Map(mapElement as HTMLElement, {
    center: initialCoordinates,
    zoom: 16,
    mapTypeId: 'satellite',
    disableDefaultUI: true,
    zoomControl: true,
  });
  infoWindow = new google.maps.InfoWindow();
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
    const talhoesPolygons: google.maps.Polygon[] = [];

    talhoes.forEach((talhao) => {
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

      talhaoPolygon.addListener('click', (event: any) => {
        const contentString = `
          <b class="talhao-name">${talhao.descricao}</b><br />
          <b class="talhao-label">Área: </b>
          <span class="talhao-info">${talhao.hectares} ha</span><br />
        `;

        if (idTalhao !== talhao.id) {
          idTalhao = talhao.id;
          highlightTalhao(talhoesPolygons);
        }

        infoWindow.setContent(contentString);
        infoWindow.setOptions;
        infoWindow.setPosition(event.latLng);
        infoWindow.open(map);
      });

      allCoordinates.push(...coordinatesArray);
      talhoesPolygons.push(talhaoPolygon);
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

function highlightTalhao(talhoesPolygons: google.maps.Polygon[]) {
  talhoesPolygons.forEach((talhao, index) => {
    talhao.setOptions({
      fillColor: idTalhao === talhoes[index].id ? '#FF9A1F' : '#009056',
      strokeColor: idTalhao === talhoes[index].id ? '#F7BC91' : '#AFF9C7',
      ...(idTalhao === talhoes[index].id && { zIndex: 999 }),
    });
  });
}

declare global {
  interface Window {
    initMap: () => void;
  }
}
window.initMap = initMap;

export {};
