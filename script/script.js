const locationInput = document.querySelector('#locationInput');
const searchButton = document.querySelector('.btn_search');
const weatherResult = document.querySelector('.weather_result');
const weatherInfo = document.querySelector('.weather_info');
const dayNightIcon = document.querySelector('.day_night_icon');
const historyList = document.querySelector('.weather_history');

const API_KEY = '9462124e9a004055a7295648250912';
const SEARCH_HISTORY = 'search_history_of_cities';

const handleSearch = () => {
  const cityOfSearch = locationInput.value.trim();
  console.log(cityOfSearch);

  if (!validateUserInput(cityOfSearch)) {
    weatherInfo.innerHTML =
      "<p style='color:red;'>Please enter a valid city name</p>";
    return;
  }
  getWeather(cityOfSearch);
  // addSearchCity(cityOfSearch);
};

searchButton.addEventListener('click', () => {
  resetWeatherResult();
  handleSearch();
});

document.addEventListener('keydown', (e) => {
  if (e.key === 'Enter') {
    resetWeatherResult();
    handleSearch();
  }
});

locationInput.addEventListener('click', () => {
  locationInput.value = '';
  const history = getSearchCity();
  if (!history.length) return;
  historyList.innerHTML = history
    .map(
      (city) =>
        `<p class="weather_history-item">${capitalizeFirstLetter(city)}</p>`
    )
    .join('');
});

historyList.addEventListener('click', (e) => {
  if (e.target.tagName === 'P') {
    locationInput.value = capitalizeFirstLetter(e.target.textContent);
    historyList.innerHTML = '';
    resetWeatherResult();
    handleSearch();
  }
});

const getWeather = (city) => {
  const currentURL = `https://api.weatherapi.com/v1/current.json?key=${API_KEY}&q=${city}&aqi=yes`;
  const forecastURL = `https://api.weatherapi.com/v1/forecast.json?key=${API_KEY}&q=${city}&days=1&aqi=yes`;

  fetch(currentURL)
    .then((result) => {
      if (!result.ok) throw new Error('City not found');
      return result.json();
    })
    .then((currentData) => {
      if (currentData.location.name.toLowerCase() !== city.toLowerCase()) {
        throw new Error('Invalid city');
      }
      fetch(forecastURL)
        .then((result) => {
          if (!result.ok) throw new Error('Forecast not found');
          return result.json();
        })
        .then((forecastData) => showWeather(currentData, forecastData))
        .catch(() => {
          weatherInfo.innerHTML =
            "<p style='color:red;'>Forecast data not available</p>";
        });
    })
    .catch(() => {
      weatherInfo.innerHTML =
        "<p style='color:red;'>City not found or invalid input</p>";
    });
};

const validateUserInput = (city) => {
  return /^[a-zA-Z\s\-]{2,}$/.test(city);
};

const showWeather = (current, forecast) => {
  const cityName = current.location.name;
  addSearchCity(cityName);

  const temp = current.current.temp_c;
  const condition = current.current.condition.text.toLowerCase();
  const humidity = current.current.humidity;
  const wind = current.current.wind_kph;
  const time = current.location.localtime;
  const isDay = current.current.is_day === 1;

  const forecastTemp = forecast.forecast.forecastday[0].day.avgtemp_c;
  const forecastCondition = forecast.forecast.forecastday[0].day.condition.text;

  weatherInfo.innerHTML = `
    <p><b>City:</b> ${current.location.name}, ${current.location.country}</p>
    <p><b>Temperature:</b> ${temp} °C</p>
    <p><b>Condition:</b> ${current.current.condition.text}</p>
    <p><b>Humidity:</b> ${humidity}%</p>
    <p><b>Wind:</b> ${wind} kph</p>
    <p><b>Local Time:</b> ${time}</p>
    <p><b>Forecast Avg Temp:</b> ${forecastTemp} °C</p>
    <p><b>Forecast Condition:</b> ${forecastCondition}</p>
  `;
  updateTheme(condition, isDay);
};

window.addEventListener('load', () => {
  weatherResult.classList.remove('weather_container');
});

const updateTheme = (condition, isDay) => {
  resetWeatherResult();
  weatherResult.classList.add('weather_container');

  if (condition.includes('rain')) {
    weatherResult.classList.add('rain');
    dayNightIcon.innerHTML = '🌧️';
  } else if (condition.includes('cloud')) {
    weatherResult.classList.add('cloudy');
    dayNightIcon.innerHTML = '☁️';
  } else if (isDay) {
    weatherResult.classList.add('day');
    dayNightIcon.innerHTML = '☀️';
  } else {
    weatherResult.classList.add('night');
    dayNightIcon.innerHTML = '🌙';
  }
};

const resetWeatherResult = () => {
  dayNightIcon.innerHTML = '';
  weatherResult.classList.remove('weather_container');
  weatherResult.classList.remove('rain', 'cloudy', 'day', 'night');
};

const addSearchCity = (city) => {
  let searchHistory = getSearchCity();
  city = city.toLowerCase();
  searchHistory = searchHistory.filter((item) => item !== city);
  searchHistory.unshift(city);
  searchHistory = searchHistory.slice(0, 5);
  localStorage.setItem(SEARCH_HISTORY, JSON.stringify(searchHistory));
};

const getSearchCity = () => {
  try {
    return JSON.parse(localStorage.getItem(SEARCH_HISTORY)) || [];
  } catch {
    return [];
  }
};

const capitalizeFirstLetter = (string) => {
  return string.charAt(0).toUpperCase() + string.slice(1);
};
