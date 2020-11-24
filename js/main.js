document.addEventListener("readystatechange", e => {
	if (e.target.readyState === "complete") {
		loadDefault();
		initApp();
	}
})

function initApp() {
	document.getElementById("submissionForm").addEventListener("submit", e => {
		e.preventDefault();
		const input = document.getElementById("textBox");
		processInput(input.value);
		input.placeholder="  enter city, state to check the weather";
	});
	document.getElementById("setDefaultButton").addEventListener("click", e => {
		localStorage.setItem("default", localStorage.getItem("current")); 
	});
}

async function loadDefault() {
	if (localStorage.getItem("default") === null) {
		const weatherData = await getWeatherData(["Hays","Kansas"]);
		displayWeather(weatherData);
	} else {
		const weatherData = JSON.parse(localStorage.getItem("default"));
		displayWeather(weatherData);
	}
}

async function processInput(input) {
		const inputArray = parseInput(input);
		const textBox = document.getElementById("textBox");
		textBox.value = "";
		const weatherData = await getWeatherData(inputArray);
		if (weatherData.message === "city not found") {
			textBox.placeholder = "  city not found; please try again"
			return;
		}
		displayWeather(weatherData);
		localStorage.setItem("current", JSON.stringify(weatherData));
}

async function getWeatherData(inputArray) {
	const data = await fetch(`https://api.openweathermap.org/data/2.5/weather?q=${inputArray[0]},${inputArray[1]}&appid=65ce4c1ce18c9e2523ab83bc703900ca`);
	return await data.json();
}

function parseInput(input) {
	return input.split(",").map(value => value.trim());
}

function displayWeather(weatherData) {
	document.querySelector("h1").textContent = `${weatherData.name}`;
	document.getElementById("headerImage").innerHTML = `<img src="http://openweathermap.org/img/wn/${weatherData.weather[0].icon}.png" alt="${weatherData.weather[0].main}">`;
	document.getElementById("currentTemp").textContent = `${convertTemp(weatherData.main.temp)} F`;
	document.getElementById("feelsLike").textContent = `${convertTemp(weatherData.main.feels_like)} F`;
	document.getElementById("windSpeed").textContent = `${weatherData.wind.speed} m/s`;
	document.getElementById("humidity").textContent = `${weatherData.main.humidity} %`;
	document.getElementById("conditions").textContent = `${weatherData.weather[0].main}`;
}

function convertTemp(temp) {
	return (temp * 9 / 5 - 459.67).toFixed(1);
}