import { CoordinatesType } from '../types/talhao';

export default function getAreasCenter(coordinates: CoordinatesType[]) {
  const bounds = new google.maps.LatLngBounds();

  coordinates.forEach((i) => {
    bounds.extend(i);
  });

  return {
    center: bounds.getCenter(),
    bounds,
  };
}
