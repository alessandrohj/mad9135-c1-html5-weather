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
        const forecast = await getForecast(location);
        console.log(forecast);
        // APP.handleStorage(forecast);
      } catch (error) {
        console.log(error.message);
      }
    },
  handleStorage: (coord)=>{
    let dataLocation = {'lat': coord.lat, 'lon': coord.lon}
    localStorage.setItem(JSON.stringify(dataLocation), JSON.stringify(coord))
  }
}

document.addEventListener('DOMContentLoaded', APP.init)