import { getForecast } from './weather.js';
import { getGeolocation } from './map.service.js';


const APP = {
  init: ()=>{
    APP.listeners();
  },
  listeners: ()=>{
    document.getElementById('search-form').addEventListener('submit', APP.getAction);
    document.getElementById('get-my-location').addEventListener('click', APP.getLocation)
  },
  getAction: async (ev)=>{
    ev.preventDefault();
    let search = document.getElementById('search-field').value;
    let location = await getGeolocation(search);
    console.log(location)
    APP.getData(location)
  },
  getLocation: ()=>{
    let options = {
      enableHighAccuracy: true,
      timeout: 5000,
      maximumAge: 0
    };

    navigator.geolocation.getCurrentPosition(success, error, [options])

    function success(pos){
      let coord = pos.coords;
      let location = {lat: coord.latitude, lon: coord.longitude};
      console.log(location);
      APP.getData(location);
    }
    function error(err) {
      console.warn(`ERROR(${err.code}): ${err.message}`);
    }
  },
  getData: async (location)=>{
      try {
        const forecast = await getForecast(location)
        console.log(forecast);
        APP.makeCard(forecast.current);
        // APP.handleStorage(forecast);
      } catch (error) {
        console.log(error.message);
      }
    },
  handleStorage: (coord)=>{
    let dataLocation = {'lat': coord.lat, 'lon': coord.lon}
    localStorage.setItem(JSON.stringify(dataLocation), JSON.stringify(coord))
  },
  makeCard: ({humidity, temp, wind_speed, weather, feels_like})=>{
    console.log(weather);
    let page = document.getElementById('weather');
    let df = document.createElement('div');
    df.innerHTML = `<div class="container">
    <div class="container mx-auto bg-white border rounded flex flex-col justify-center items-center text-center py-3 w-64 shadow-lg cursor-pointer">
      <h2 class="font-bold text-lg">NOW</h2>
      <h3 class="pb-2">Sep 24, 201</h3>
      <div class='weather-img p-2 flex flex-col'>
        <img src="https://openweathermap.org/img/w/${weather['0'].icon}.png" alt="${weather['0'].description}">
        <p>${weather['0'].description}</p>
      </div>
      <div class="temp">
        <h3 class="font-bold text-3xl pb-3">${Math.round(temp)}º</h3>
        <p>Feels like ${Math.round(feels_like)}º</p>
      </div>
      <div class="extra-weather-info flex gap-10 py-2">
        <p>Wind: ${Math.round(wind_speed)}km/h</p>
        <p>Humidity: ${humidity}º</p>
      </div>
      </div>
    </div>`;

    page.append(df);
  }
}

document.addEventListener('DOMContentLoaded', APP.init)