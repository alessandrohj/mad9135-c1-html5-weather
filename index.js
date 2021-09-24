import { getForecast, createWeatherIcon } from './weather.service.js';
import { getGeolocation } from './map.service.js';

// main();

// This is a demo of how to use the two API services.
// You should replace this with your own application logic.


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
    let location = document.getElementById('search-field').value;
    let coord = await getGeolocation(location);
    APP.getData(coord)
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
      APP.getData(location);
    }
    function error(err) {
      console.warn(`ERROR(${err.code}): ${err.message}`);
    }
  },
  getData: async (location)=>{
      try {
        const forecast = await getForecast({ location });
        console.log(forecast);
      } catch (error) {
        console.log(error.message);
      }
    },
}

document.addEventListener('DOMContentLoaded', APP.init)