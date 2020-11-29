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
  const textBox = document.getElementById("textBox");
  let weatherData;
  if (/\d{5}/.test(input.substring(0, 5))) {
    const zip = input.substring(0, 5);
    weatherData = await getWeatherDataByZip(zip);
  } else {
    const inputArray = parseInput(input);
    weatherData = await getWeatherDataByCity(inputArray);
  }
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

async function getWeatherDataByZip(zip) {
  const data = await fetch(
    `https://api.openweathermap.org/data/2.5/weather?zip=${zip}&appid=65ce4c1ce18c9e2523ab83bc703900ca`
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
  const states = [
    "alabama",
    "alaska",
    "arizona",
    "arkansas",
    "california",
    "colorado",
    "connecticut",
    "delaware",
    "florida",
    "georgia",
    "hawaii",
    "idaho",
    "illinois",
    "indiana",
    "iowa",
    "kansas",
    "kentucky",
    "louisiana",
    "maine",
    "maryland",
    "massachusetts",
    "michigan",
    "minnesota",
    "mississippi",
    "missouri",
    "montana",
    "nebraska",
    "nevada",
    "new hampshire",
    "new jersey",
    "new mexico",
    "new york",
    "north carolina",
    "north dakota",
    "ohio",
    "oklahoma",
    "oregon",
    "pennsylvania",
    "rhode island",
    "south carolina",
    "south dakota",
    "tennessee",
    "texas",
    "utah",
    "vermont",
    "west virginia",
    "virginia",
    "washington",
    "wisconsin",
    "wyoming",
    "district of columbia",
    "ak",
    "al",
    "ar",
    "as",
    "az",
    "ca",
    "co",
    "ct",
    "dc",
    "de",
    "fl",
    "ga",
    "gu",
    "hi",
    "ia",
    "id",
    "il",
    "in",
    "ks",
    "ky",
    "la",
    "ma",
    "md",
    "me",
    "mi",
    "mn",
    "mo",
    "mp",
    "ms",
    "mt",
    "nc",
    "nd",
    "ne",
    "nh",
    "nj",
    "nm",
    "nv",
    "ny",
    "oh",
    "ok",
    "or",
    "pa",
    "pr",
    "ri",
    "sc",
    "sd",
    "tn",
    "tx",
    "um",
    "ut",
    "va",
    "vi",
    "vt",
    "wa",
    "wi",
    "wv",
    "wy",
  ];
  const parsedInput = [];
  for (let i = 0; i < states.length; i += 1) {
	let state = states[i];
	if (input.trim().toLowerCase().endsWith(state)) {
      parsedInput[0] = input
        .substring(0, input.toLowerCase().indexOf(state))
        .trim();
      if (parsedInput[0].endsWith(",")) {
        parsedInput[0] = parsedInput[0].substring(0, parsedInput[0].length - 1);
      }
      if (state.length === 2) {
        parsedInput[1] = convertStateAbbreviation(state);
      } else {
        parsedInput[1] = state;
	  }
	  break;
    }
  }
  if (parsedInput.length === 0) {
    parsedInput[0] = input.trim();
  }
  return parsedInput;
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

function convertStateAbbreviation(state) {
  switch (state.toUpperCase()) {
    case "AL":
      return "alabama";
    case "AK":
      return "alaska";
    case "AZ":
      return "arizona";
    case "AR":
      return "arkansas";
    case "CA":
      return "california";
    case "CO":
      return "colorado";
    case "CT":
      return "connecticut";
    case "DE":
      return "delaware";
    case "FL":
      return "florida";
    case "GA":
      return "georgia";
    case "HI":
      return "hawaii";
    case "ID":
      return "idaho";
    case "IL":
      return "illinois";
    case "IN":
      return "indiana";
    case "IA":
      return "iowa";
    case "KS":
      return "kansas";
    case "KY":
      return "kentucky";
    case "LA":
      return "louisiana";
    case "ME":
      return "maine";
    case "MD":
      return "maryland";
    case "MA":
      return "massachusetts";
    case "MI":
      return "michigan";
    case "MN":
      return "minnesota";
    case "MS":
      return "mississippi";
    case "MO":
      return "missouri";
    case "MT":
      return "montana";
    case "NE":
      return "nebraska";
    case "NV":
      return "nevada";
    case "NH":
      return "new hampshire";
    case "NJ":
      return "new jersey";
    case "NM":
      return "new mexico";
    case "NY":
      return "new york";
    case "NC":
      return "north carolina";
    case "ND":
      return "north dakota";
    case "OH":
      return "ohio";
    case "OK":
      return "oklahoma";
    case "OR":
      return "oregon";
    case "PA":
      return "pennsylvania";
    case "RI":
      return "rhode island";
    case "SC":
      return "south carolina";
    case "SD":
      return "south dakota";
    case "TN":
      return "tennessee";
    case "TX":
      return "texas";
    case "UT":
      return "utah";
    case "VT":
      return "vermont";
    case "VA":
      return "virginia";
    case "WA":
      return "washington";
    case "WV":
      return "west virginia";
    case "WI":
      return "wisconsin";
    case "WY":
      return "wyoming";
    case "DC":
      return "district of columbia";
  }
}
