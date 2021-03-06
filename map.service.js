// const API_TOKEN = 'pk.2b1a67e9f2ac89606bf8cd1672855f63';
const API_TOKEN = 'pk.ed3239021396902b0111a66910dcdded';
const BASE_URL = 'https://us1.locationiq.com/v1';

export async function getGeolocation(location) {
  const url = `${BASE_URL}/search.php?key=${API_TOKEN}&q=${location}&format=json`;
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(response.statusText);
  }
  const data = await response.json();
  return { lat: data[0].lat, lon: data[0].lon };
}

export async function getCity({lat: LAT, lon: LON}) {
  const url = `${BASE_URL}/reverse.php?key=${API_TOKEN}&lat=${LAT}&lon=${LON}&format=json`;
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(response.statusText);
  }
  const data = await response.json();
  console.log(data);
  return data;
}


//https://api.locationiq.com/v1/autocomplete.php?key=YOUR_ACCESS_TOKEN&q=SEARCH_STRING