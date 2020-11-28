document.addEventListener("readystatechange", (e) => {
  if (e.target.readyState === "complete") {
    loadDefault();
    initApp();
  }
});

async function applyGeolocationData(position) {
  const weatherData = await getWeatherDataByCoords([
    position.coords.latitude,
    position.coords.longitude,
  ]);
  console.log(position.coords);
  displayWeather(weatherData);
  const forecastData = await getForecast(weatherData);
  displayForecast(forecastData);
  localStorage.setItem("current", JSON.stringify(weatherData));
}

async function loadDefault() {
  if (JSON.parse(localStorage.getItem("default"))) {
    const weatherData = JSON.parse(localStorage.getItem("default"));
    displayWeather(weatherData);
    const forecastData = await getForecast(weatherData);
	displayForecast(forecastData);
  } else {
	const weatherData = await getWeatherDataByCity(["Hays", "Kansas"]);
    displayWeather(weatherData);
    const forecastData = await getForecast(weatherData);
	displayForecast(forecastData);
	localStorage.setItem("current", JSON.stringify(weatherData));
  }
}

function initApp() {
  document.getElementById("submissionForm").addEventListener("submit", (e) => {
    e.preventDefault();
    const input = document.getElementById("textBox");
    processInput(input.value);
    input.placeholder = "  enter city, state to check the weather";
  });
  document.getElementById("setDefaultButton").addEventListener("click", (e) => {
    localStorage.setItem("default", localStorage.getItem("current"));
  });
  document
    .getElementById("useCurrentLocationButton")
    .addEventListener("click", (e) => {
      if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(applyGeolocationData);
      } else {
		const textBox = document.getElementById("textBox");
		textBox.placeholder = "  location data unavailable; please try again";
        textBox.value = "";
      }
    });
}

async function processInput(input) {
  const inputArray = parseInput(input);
  const textBox = document.getElementById("textBox");
  const weatherData = await getWeatherDataByCity(inputArray);
  if (weatherData.message === "city not found") {
	textBox.placeholder = "  city not found; please try again";
	textBox.value = "";
    return;
  }
  displayWeather(weatherData);
  localStorage.setItem("current", JSON.stringify(weatherData));
  const forecastData = await getForecast(weatherData);
  displayForecast(forecastData);
  textBox.value = "";
}

async function getWeatherDataByCity(inputArray) {
  const data = await fetch(
    `https://api.openweathermap.org/data/2.5/weather?q=${inputArray[0]},${inputArray[1]}&appid=65ce4c1ce18c9e2523ab83bc703900ca`
  );
  return await data.json();
}

async function getWeatherDataByCoords(coords) {
  const data = await fetch(
    `https://api.openweathermap.org/data/2.5/weather?lat=${coords[0]}&lon=${coords[1]}&appid=65ce4c1ce18c9e2523ab83bc703900ca`
  );
  return await data.json();
}

async function getForecast(weatherData) {
  const data = await fetch(
    `https://api.openweathermap.org/data/2.5/onecall?lat=${weatherData.coord.lat}&lon=${weatherData.coord.lon}&appid=65ce4c1ce18c9e2523ab83bc703900ca`
  );
  return await data.json();
}

function parseInput(input) {
  return input.split(",").map((value) => value.trim());
}

function displayWeather(weatherData) {
  document.querySelector("h1").textContent = `${weatherData.name}`;
  document.getElementById(
    "headerImage"
  ).innerHTML = `<img src="https://openweathermap.org/img/wn/${weatherData.weather[0].icon}.png" alt="${weatherData.weather[0].main}">`;
  document.getElementById("currentTemp").innerHTML = `${convertTemp(
    weatherData.main.temp
  )} &degF`;
  document.getElementById("feelsLike").innerHTML = `${convertTemp(
    weatherData.main.feels_like
  )} &degF`;
  document.getElementById(
    "windSpeed"
  ).textContent = `${weatherData.wind.speed} m/s`;
  document.getElementById(
    "humidity"
  ).textContent = `${weatherData.main.humidity} %`;
  document.getElementById(
    "conditions"
  ).textContent = `${weatherData.weather[0].main}`;
}

function displayForecast(forecastData) {
  const date = new Date();
  for (let i = 1; i < 6; i += 1) {
    date.setDate(date.getDate() + 1);
    document.getElementById(
      `day${i}Label`
    ).innerHTML = `<span><img src="https://openweathermap.org/img/wn/${
      forecastData.daily[i].weather[0].icon
    }.png" alt="${
      forecastData.daily[i].weather[0].main
    }"></span>${convertDayOfTheWeek(date.getDay())}`;
    document.getElementById(`day${i}High`).innerHTML = `H: ${convertTemp(
      forecastData.daily[i].temp.max
    )} &degF`;
    document.getElementById(`day${i}Low`).innerHTML = `L: ${convertTemp(
      forecastData.daily[i].temp.min
    )} &degF`;
  }
}

function convertTemp(temp) {
  return ((temp * 9) / 5 - 459.67).toFixed(0);
}

function convertDayOfTheWeek(date) {
  switch (date) {
    case 0:
      return "Sun";
    case 1:
      return "Mon";
    case 2:
      return "Tue";
    case 3:
      return "Wed";
    case 4:
      return "Thu";
    case 5:
      return "Fri";
    case 6:
      return "Sat";
  }
}
