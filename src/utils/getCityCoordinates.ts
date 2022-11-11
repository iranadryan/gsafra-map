export default async function getCityCoordinates(
  geocoder: google.maps.Geocoder,
  city: string,
  uf: string
) {
  const { results } = await geocoder.geocode({
    address: `${city}, ${uf}`,
  });

  return results[0].geometry.location;
}
