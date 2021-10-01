import { getForecast } from './weather.js';
import { getGeolocation, getCity } from './map.service.js';


const APP = {
  init: ()=>{
    APP.listeners();
  },
  listeners: ()=>{
    document.getElementById('search-form').addEventListener('submit', APP.getAction);
    document.getElementById('get-my-location').addEventListener('click', APP.getLocation);
    document.getElementById('frequency').addEventListener('click', APP.checkFrequency)
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
        APP.makeDailyCards(forecast);
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
      APP.makeDailyCards(obj.coord);
      APP.makeHourlyCards(obj.coord);
      APP.findCity(obj.coord);
      let timeNow = Date.now();
      if ((timeNow - obj.timestamp) * 1000 > 360000) {
        let location = {'lat': obj.coord.lat, 'lon': obj.coord.lon};
        APP.getData(location)
      } else {
        console.log('valid')
      }
    }
  },
  mainCard: (forecast)=>{
    let {humidity, temp, wind_speed, weather, feels_like, sunrise, sunset} = forecast.current;
    let {timezone} = forecast;
    let {min, max } = forecast.daily[0].temp;
    
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
let mainIcon = document.getElementById('main-icon');
/**
 * get info to update components
 */
  tempNow.textContent = `${Math.round(temp)}º`;
  tempMin.textContent = `${Math.round(min)}º`;
  tempMax.textContent = `${Math.round(max)}º`;
  wind.textContent = `${Math.round(wind_speed)} km/h`;
  humi.textContent = `${Math.round(humidity)} %`;
  precipitation.textContent = `${Math.round(forecast.daily[0].pop * 100)} %`
  feels.textContent = `${Math.round(feels_like)}º`;
  weatherState.textContent = weather[0].main;
  mainIcon.src = `https://openweathermap.org/img/w/${weather['0'].icon}.png`;
  mainIcon.alt=`${weather['0'].description}`;

  function getHours(time){
    let date = new Date(time * 1000);
    let options = { timeZone: timezone, hour: '2-digit', minute: '2-digit' };
    return date.toLocaleTimeString('en-US', options);
  }
  sun.textContent = getHours(sunrise);
  night.textContent = getHours(sunset);

  // sun.textContent = getHours(sunrise);
  
  APP.setBackground(weather[0].main);
  },
  setBackground: (data) => {
    let card = document.getElementById('current');
    switch (data) {
      case 'Clouds':
        card.style.backgroundImage = 'url(./images/clouds.jpg)';
        break;
      case 'Thunderstorm':
          card.style.backgroundImage = 'url(./images/thunder.jpg)';
          break;
     case 'Drizzle':
        card.style.backgroundImage = 'url(./images/drizzle.jpg)';
        break;
    case 'Rain':
          card.style.backgroundImage = 'url(./images/rain.jpg)';
          break;
     case 'Mist':
            card.style.backgroundImage = 'url(./images/mist.jpg)';
            break;
    case 'Atmosphere':
            card.style.backgroundImage = 'url(./images/general.jpg)';
            break;
  case 'Clear':
              card.style.backgroundImage = 'url(./images/clear.jpg)';
              break;  
      default:
      card.style.backgroundColor = 'url(./images/default.jpg)';
        break;
    }


  },
  makeHourlyCards: (forecast)=>{
    let hourlyCards = document.getElementById('hourly-cards');
    hourlyCards.innerHTML ='';
    let frag = document.createDocumentFragment();
    /**
     * Hourly
     */
     let hourly = forecast.hourly.slice(1, 7);

     hourly.forEach(item =>{
      let options = { timeZone: forecast.timezone, hour: '2-digit'};
      let hour = new Date(item.dt * 1000).toLocaleTimeString('en-US', options);;
      let div = document.createElement('div');
      div.classList.add('weather-card-detail', 'w-16', 'h-28', 'text-center', 
      'flex', 'flex-col', 'justify-between', 'p-1', 'm-2', 'rounded-xl');
      div.innerHTML = `
      <p class="text-white">${hour}</p>
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
    let frag = document.createDocumentFragment();
    dailyCards.innerHTML = ''

    function getDate(timestamp, sun){
      let daysFull = ['Sunday','Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']
      let days = ['Sun','Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']
      let months = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
      let date = new Date(timestamp * 1000);
      let year = date.getFullYear();
      let dayOfTheWeek = days[date.getDay()];
      let dayOfTheWeekFull = daysFull[date.getDay()];
      let day = date.getDate();
      let month = months[date.getMonth()];
      if (sun == 'week') {
        return dayOfTheWeek;
      } else if (sun == 'full') {
        return dayOfTheWeekFull;
      }
        else {
      return  `${month} ${day}, ${year}`}
    }
    date.textContent = getDate(forecast.current.dt)
    day.textContent = getDate(forecast.current.dt, 'full')

    let days = forecast.daily.slice(1,7);

    days.forEach((item, index) =>{
      let dayOfTheWeek = getDate(item.dt, 'week');
      let div = document.createElement('div');
      div.classList.add('weather-card-detail', 'w-16', 'h-28', 'text-center', 
      'flex', 'flex-col', 'justify-between', 'p-1', 'm-2', 'rounded-xl', 'bg-black');
      div.innerHTML = `
      <p class="text-white">${dayOfTheWeek}</p>
      <img src="https://openweathermap.org/img/w/${item.weather['0'].icon}.png" alt="${item.weather['0'].description}">
      <span>
      <p class="text-white text-sm sm:text-xl">${Math.round(item.temp.min)}º</p>
      <p class="text-white text-xl sm:text-3xl">${Math.round(item.temp.max)}º</p>
      </span>
      `;
      frag.append(div)
     })
     dailyCards.append(frag)
    
  },
  checkFrequency:()=>{
    let hourly = document.getElementById('hourly-toggle')
    let daily = document.getElementById('daily-toggle')
    let dailyCards = document.getElementById('daily-cards');
    let hourlyCards = document.getElementById('hourly-cards');

    hourly.classList.toggle("bg-blue-100");
    daily.classList.toggle("bg-blue-100");
    hourly.classList.toggle("active");
    daily.classList.toggle("active");
    dailyCards.classList.toggle("hidden");
    hourlyCards.classList.toggle("hidden");
    dailyCards.classList.toggle("active");
    hourlyCards.classList.toggle("active");
  },
}

document.addEventListener('DOMContentLoaded', APP.init)