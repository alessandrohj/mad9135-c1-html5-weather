import { getForecast } from './weather.js';
import { getGeolocation, getCity } from './map.service.js';


const APP = {
  init: ()=>{
    APP.listeners();
  },
  listeners: ()=>{
    document.getElementById('search-form').addEventListener('submit', APP.getAction);
    document.getElementById('get-my-location').addEventListener('click', APP.getLocation);
    // document.getElementById('toggle').addEventListener('click', APP.checkFrequency)
    APP.handleStorage();
  },
  findCity: async (location)=> {
    let reverse = await getCity(location);
    let {city, country} = reverse.address;
    let text = `${city}, ${country}`;
    let page = document.getElementById('city');
    page.textContent = text;
  },
  getAction: async (ev)=>{
    ev.preventDefault();
    let search = document.getElementById('search-field').value;
    let location = await getGeolocation(search);
    console.log(location);
    APP.getData(location);
    APP.findCity(location);
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
      APP.findCity(location);
    }
    function error(err) {
      console.warn(`ERROR(${err.code}): ${err.message}`);
    }
  },
  getData: async (location)=>{
      try {
        console.log(location);
        const forecast = await getForecast(location)
        APP.mainCard(forecast);
        APP.makeHourlyCards(forecast);
        APP.addStorage(forecast, forecast.current.dt);
        console.log(forecast);
      } catch (error) {
        console.log(error.message);
      }
    },
    addStorage: (coord, timestamp)=>{
    localStorage.setItem('weather-app', JSON.stringify({timestamp, coord}));
    let location = {'lat': coord.lat, 'lon': coord.lon};
    let interval = setInterval(APP.getData, 3600000, location);

  },
  handleStorage: ()=>{
    console.log('loaded');
    let storage = localStorage.getItem('weather-app');
    if (storage) {
      let obj = JSON.parse(storage);
      APP.mainCard(obj.coord);
      // APP.makeDailyCards(obj.coord);
      APP.findCity(obj.coord);
      let timeNow = Date.now();
      if ((timeNow - obj.timestamp) * 1000 > 3600) {
        let location = {'lat': obj.coord.lat, 'lon': obj.coord.lon};
        APP.getData(location)
      } else {
        console.log('valid')
      }
    }
  },
  mainCard: (forecast)=>{
    // let frequencyToggle = document.getElementById('frequency');
    // frequencyToggle.classList.remove('hidden');
    let {humidity, temp, wind_speed, weather, feels_like, dt} = forecast.current;

    let {min, max, pop } = forecast.daily[0].temp;
    let {sunrise, sunset} = forecast.daily[0];
    
/**
 * Create / select main card components
 */

let tempNow = document.getElementById('tempNow');
let weatherState = document.getElementById('weatherState');
let tempMin = document.getElementById('temp-min');
let tempMax = document.getElementById('temp-max');
let precipitation = document.getElementById('precipitation');
let humi = document.getElementById('humidity');
let wind = document.getElementById('wind');
let feels = document.getElementById('feels-like');
let sun = document.getElementById('sunrise');
let night = document.getElementById('sunset');

/**
 * get info to update components
 */
  tempNow.textContent = `${Math.round(temp)}º`;
  tempMin.textContent = `${Math.round(min)}º`;
  tempMax.textContent = `${Math.round(max)}º`;
  wind.textContent = `${Math.round(wind_speed)} km/h`;
  humi.textContent = `${Math.round(humidity)}%`;
  precipitation.textContent = `${pop}%`
  feels.textContent = `${Math.round(feels_like)}º`;
  weatherState.textContent = weather[0].main;

  function getHours(time){
    let date = new Date(time * 1000);
    let hour = date.getHours();
    let amPm = hour >= 12 ? ' pm' : ' am';
    hour = (hour % 12) || 12;
    let minutes = "0" + date.getMinutes();
    return hour + ':' + minutes.toString().slice(-2) + amPm;
  }

  sun.textContent = getHours(sunrise);
  night.textContent = getHours(sunset);

  },
  makeHourlyCards: (forecast)=>{
    let hourlyCards = document.getElementById('hourly-cards');
    let frag = document.createDocumentFragment();
    /**
     * Hourly
     */
     let hourly = forecast.hourly.slice(1, 7);

     hourly.forEach(item =>{
      let date = new Date(item.dt * 1000);
      let hour = date.getHours();
      let amPm = hour >= 12 ? 'pm' : 'am';
      hour = (hour % 12) || 12;
      let div = document.createElement('div');
      div.classList.add('weather-card-detail', 'w-16', 'h-28', 'text-center', 
      'flex', 'flex-col', 'justify-between', 'p-1', 'm-2', 'rounded-xl', 'bg-black');
      div.innerHTML = `
      <p class="text-white">${hour} ${amPm}</p>
      <img src="https://openweathermap.org/img/w/${item.weather['0'].icon}.png" alt="${item.weather['0'].description}">
      <p class="text-white">${Math.round(item.temp)}º</p>
      `;
      frag.append(div)
     })
     hourlyCards.append(frag)
  },
  makeDailyCards: (forecast) => {
    let day = document.getElementById('day');
    let date = document.getElementById('date');
    let dailyCards = document.getElementById('daily-cards');
  },
  checkFrequency:()=>{
    let hourly = document.getElementById('weather-hourly')
    let daily = document.getElementById('weather-daily')
    let selector = document.getElementById('time-change');
    if (selector.innerHTML === 'Daily') {
    daily.classList.remove('hidden');
    hourly.classList.add('hidden');
    selector.innerHTML = 'Hourly'
  } else {
    hourly.classList.remove('hidden');
    daily.classList.add('hidden');
    selector.innerHTML = 'Daily'
  }

    return selector.textContent;
  },
}

document.addEventListener('DOMContentLoaded', APP.init)