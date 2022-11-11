import { CoordinatesType } from '../types/talhao';

export default function convertStringCoordinatesToArray(
  coordinates: string
): CoordinatesType[] {
  return coordinates
    .split(' ')
    .map((i) => i.split(','))
    .map((j) => ({ lat: Number(j[1]), lng: Number(j[0]) }));
}
