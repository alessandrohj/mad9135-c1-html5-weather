import { getForecast, createWeatherIcon } from './weather.service.js';
import { getGeolocation } from './map.service.js';

// main();

// This is a demo of how to use the two API services.
// You should replace this with your own application logic.


const APP = {
  location: null,
  init: ()=>{
    APP.listeners();
  },
  listeners: ()=>{
    document.getElementById('search-form').addEventListener('submit', APP.getAction);
  },
  getAction: (ev)=>{
    ev.preventDefault();
    let location = document.getElementById('search-field').value;
    APP.getData(location)
  },
  // getLocation: ()=>{
  //   navigator.geolocation.getCurrentPosition(success, error, [options])
  // };
  getData: async (location)=>{
      try {
        const coord = await getGeolocation(location);
        const forecast = await getForecast({ coord });
        console.log(forecast);
      } catch (error) {
        console.log(error.message);
      }
    }
}

document.addEventListener('DOMContentLoaded', APP.init)