'use strict';
const BASE_URL = 'https://api.openweathermap.org/data/2.5/onecall';
const API_KEY = '9e1d759ed9f58b7f04de1b66b70a5c37';

const cache = new Map();

export async function getForecast(coord) {
   let {lat, lon} = coord;
    const cacheItem = cache.get(coord);
    if (cacheItem && !isExpired(cacheItem.current.dt)) {
      return cacheItem;
    }
    const forecast = await fetchForecast({coord});
    cache.set(coord, forecast);
    return forecast;
  
    /**
     * Helper function to check cache expiry
     * @param {number} cacheTime UNIX timestamp in seconds
     */
    function isExpired(cacheTime) {
      const TEN_MINUTES = 600; // seconds
      const currentTime = Math.floor(Date.now() / 1000); // convert from ms to s
      const elapsedTime = currentTime - cacheTime;
      return elapsedTime > TEN_MINUTES;
    }
}


async function fetchForecast({ coord: { lat, lon }, units }) {
    const url = `${BASE_URL}?lat=${lat}&lon=${lon}&units=metric&appid=${API_KEY}`;
    const response = await fetch(url);
    if (!response.ok) throw new Error(response.statusText);
    return response.json();
  }