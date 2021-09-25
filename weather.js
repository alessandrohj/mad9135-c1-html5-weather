'use strict';
const BASE_URL = 'https://api.openweathermap.org/data/2.5/onecall';
const API_KEY = '9e1d759ed9f58b7f04de1b66b70a5c37';


export async function getForecast({lat, lon}) {
    const url = `${BASE_URL}?lat=${lat}&lon=${lon}&units=metric&appid=${API_KEY}`;
    const response = await fetch(url);
    if (!response.ok) throw new Error(response.statusText);
    return response.json();
}

