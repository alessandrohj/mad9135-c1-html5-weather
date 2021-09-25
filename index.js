import { getForecast } from './weather.js';
import { getGeolocation } from './map.service.js';


const APP = {
  init: ()=>{
    APP.listeners();
  },
  listeners: ()=>{
    document.getElementById('search-form').addEventListener('submit', APP.getAction);
    document.getElementById('get-my-location').addEventListener('click', APP.getLocation);
    document.getElementById('toggle').addEventListener('click', APP.checkFrequency)
    document.getElementById('search-form').addEventListener('change', APP.autocomplete);
  },
    autocomplete: ()=>{
      let SEARCH_STRING = document.getElementById('search-field').value;
      console.log(SEARCH_STRING)
      let url = `https://api.locationiq.com/v1/autocomplete.php?key=pk.2b1a67e9f2ac89606bf8cd1672855f63&q=${SEARCH_STRING}`
      fetch(url)
      .then(response => response.json())
      .then(data => console.log(data))

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
        APP.makeHourlyCards(forecast);
        APP.makeDailyCards(forecast);
        // APP.handleStorage(forecast);
      } catch (error) {
        console.log(error.message);
      }
    },
  handleStorage: (coord)=>{
    let dataLocation = {'lat': coord.lat, 'lon': coord.lon}
    localStorage.setItem(JSON.stringify(dataLocation), JSON.stringify(coord))
  },
  makeHourlyCards: (forecast)=>{
    let frequencyToggle = document.getElementById('frequency');
    frequencyToggle.classList.remove('hidden');
    let {humidity, temp, wind_speed, weather, feels_like, dt} = forecast.current;
    
    let page = document.getElementById('weather-hourly');
    page.innerHTML = '';
    let df = document.createElement('div');
    df.innerHTML = `
    <div class="container mx-auto bg-white border rounded flex flex-col justify-center items-center text-center py-3 w-64 sm:w-80 shadow-lg cursor-pointer pb-3">
      <h2 class="font-bold text-lg">NOW</h2>
      <div class='weather-img p-2 flex flex-col'>
        <img src="https://openweathermap.org/img/w/${weather['0'].icon}.png" alt="${weather['0'].description}">
        <p class='description'>${weather['0'].description}</p>
      </div>
      <div class="temp pb-1">
        <h3 class="font-bold text-3xl pb-3">${Math.round(temp)}º</h3>
        <p>Feels like ${Math.round(feels_like)}º</p>
      </div>
      <div class="extra-weather-info flex gap-10 py-2">
        <p>Wind: ${Math.round(wind_speed)}km/h</p>
        <p>Humidity: ${humidity}%</p>
      </div>
      </div>`;

    /*
    * Hourly forecast
    */
    let hourly = forecast.hourly.slice(0, 6);
    let div = document.createElement('div');
    let frag = document.createDocumentFragment();
    hourly.forEach(item => {
      // let localTime = (forecast.timezone_offset <= 0 ? dt + forecast.timezone_offset : dt - forecast.timezone_offset) * 1000;
      let date = new Date(item.dt * 1000);
      let hour = date.getHours();
      let amPm = hour >= 12 ? 'pm' : 'am';
      hour = (hour % 12) || 12;
      let div = document.createElement('div');
      div.classList.add('container', 'mx-auto', 'bg-white', 'border', 'rounded', 'flex', 'flex-col', 'justify-center','items-center', 'text-center', 'p-4', 'w-64', 'shadow-lg', 'cursor-pointe')
        div.innerHTML = `
        <h2 class="font-bold text-lg">${hour} ${amPm}</h2>
        <div class='weather-img p-2 flex flex-col'>
          <img src="https://openweathermap.org/img/w/${item.weather['0'].icon}.png" alt="${item.weather['0'].description}">
          <p class='description'>${item.weather['0'].description}</p>
        </div>
        <div class="temp">
          <h3 class="font-bold text-3xl pb-3">${Math.round(item.temp)}º</h3>
          <p>Feels like ${Math.round(item.feels_like)}º</p>
        </div>
        <div class="extra-weather-info flex gap-10 py-2">
          <p>Wind: ${Math.round(item.wind_speed)}km/h</p>
          <p>Humidity: ${item.humidity}%</p>
        </div>
        `;
      frag.append(div)
    })
    div.append(frag)
    df.classList.add('pb-5', 'container');
    div.classList.add('container', 'flex', 'flex-row', 'flex-wrap', 'gap-1', 'xl:grid', 'xl:grid-cols-6')
    page.append(df, div);
  },
  makeDailyCards: (forecast)=>{
    
    function getDate(timestamp, sun){
      let months = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
      let date = new Date(timestamp * 1000);
      let year = date.getFullYear();
      let hour = date.getHours();
      let day = date.getDate();
      let month = months[date.getMonth()];
      let minutes = date.getMinutes();
      if (sun == 'sun'){
        let amPm = hour >= 12 ? 'pm' : 'am';
        hour = (hour % 12) || 12;
        return hour + ':' + minutes + amPm;
      } else {
      return  month + ' ' + year + ', ' + day}
    }

    let time = getDate(forecast.current.dt);
    
    let days = forecast.daily;
    let today = days.slice(0,1)[0];
    let page = document.getElementById('weather-daily');
    page.innerHTML = '';
    let df = document.createElement('div');
    df.innerHTML = `
    <div class="container mx-auto bg-white border rounded flex flex-col justify-center items-center text-center p-2 sm:p-2 w-64 sm:w-80 shadow-lg cursor-pointer">
      <h2 class="font-bold text-lg">TODAY</h2>
      <h3>${time}</h3>
      <div class='weather-img p-2 flex flex-col'>
        <img src="https://openweathermap.org/img/w/${today.weather[0].icon}.png" alt="${today.weather[0].description}">
        <p class='description'>${today.weather[0].description}</p>
      </div>
      <div class="temp">
        <h3 class="font-bold text-3xl pb-3">${Math.round(today.temp['min'])}º / ${Math.round(today.temp['max'])}</h3>
        <span class='flex flex-row gap-4 sm:gap-7'>
        <p>Sunrise: ${getDate(today.sunrise,'sun')}</p>
        <p>Sunset: ${getDate(today.sunset,'sun')} </p>
        </span>
      </div>
      <div class="extra-weather-info flex gap-10 py-2">
        <p>Wind: ${Math.round(today.wind_speed)}km/h</p>
        <p>Humidity: ${today.humidity}%</p>
      </div>
      </div>`;
    
      page.append(df);

    // /*
    // * Daily forecast
    // */
    let daily = days.slice(1, 7);
    console.log(daily);
    let div = document.createElement('div');
    let frag = document.createDocumentFragment();
    daily.forEach((item, index) => {
      let day = getDate(item.dt);
      let div = document.createElement('div');
      div.classList.add('container', 'mx-auto', 'bg-white', 'border', 'rounded', 'flex', 'flex-col', 'justify-center','items-center', 'text-center', 'p-4', 'w-64', 'shadow-lg', 'cursor-pointe')
        div.innerHTML = `
        <h2 class="font-bold text-lg">${index >= 1 ? day : 'Tomorrow'}</h2>
        <div class='weather-img p-2 flex flex-col'>
          <img src="https://openweathermap.org/img/w/${item.weather[0].icon}.png" class='w-24' alt="${item.weather[0].description}">
          <p class='description'>${item.weather[0].description}</p>
        </div>
        <div class="temp">
        <h3 class="font-bold text-3xl pb-3">${Math.round(item.temp['min'])}º / ${Math.round(item.temp['max'])}</h3>
        <span class='flex flex-row gap-4'>
        <p>Sunrise: ${getDate(item.sunrise,'sun')}</p>
        <p>Sunset: ${getDate(item.sunset,'sun')} </p>
        </span>
      </div>
      <div class="extra-weather-info flex gap-10 py-2">
        <p>Wind: ${Math.round(item.wind_speed)}km/h</p>
        <p>Humidity: ${item.humidity}%</p>
      </div>
        </div>
        `;
      frag.append(div)
    })
    div.append(frag);
    div.classList.add('container', 'flex', 'flex-row', 'flex-wrap', 'gap-1', 'xl:grid', 'xl:grid-cols-6');
    df.classList.add('pb-2', 'sm:pm-5', 'container');
    page.append(df, div);
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