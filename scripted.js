const apiKey = "e6e1ee10df4507cbe4505111d0f54e50";
const apiURL = "https://api.openweathermap.org/data/2.5/weather?units=metric&q=";
const apiKey2 = "c049b6c4f1f440fb842cd869e2bb0ddb";
const apiURL2 = "https://api.weatherbit.io/v2.0/forecast/daily";

const searchBox = document.querySelector(".search input");
const searchBtn = document.querySelector(".search button");
const weatherIcon = document.querySelector(".logo img");

async function getCityCoordinates() {
    const cityName = searchBox.value.trim();
    if (!cityName) return;
    const geocodingAPIURL = `https://api.openweathermap.org/geo/1.0/direct?q=${cityName}&limit=1&appid=${apiKey}`;

    try {
        spinner.style.display = 'block';
        const response = await fetch(geocodingAPIURL);
        if (!response.ok) throw new Error("City not found");
        const data = await response.json();
        if (!data.length) throw new Error("No coordinates found");

        const { lat, lon } = data[0];
        await Promise.all([
            checkWeather(cityName, lat, lon),
            getWeatherForecast(lat, lon)
        ]);
    } catch (error) {
        console.error("Error fetching coordinates:", error);
        alert("Could not fetch city coordinates. Please try again.");
    } finally{
        spinner.style.display = 'none';
    }
}

async function checkWeather(city, lat, lon) {
    try {
        spinner.style.display = 'block';
        const response = await fetch(apiURL + city + `&appid=${apiKey}`);
        if (!response.ok) throw new Error("City not found");
        const data = await response.json();

        console.log(data);

        document.querySelector(".city").innerHTML = data.name;
        document.querySelector(".temp").innerHTML = Math.round(data.main.temp) + "°C";
        document.querySelector(".humidity").innerHTML = data.main.humidity + "%";
        document.querySelector(".wind").innerHTML = data.wind.speed + "Km/h";
        document.querySelector(".rain").innerHTML = data.rain ? data.rain["1h"] + "mm" : "0";

        const timezoneOffset = data.timezone;
        const sunrise = new Date((data.sys.sunrise + timezoneOffset) * 1000).toLocaleTimeString("en-US", { hour: '2-digit', minute: '2-digit', timeZone: 'UTC' });
        const sunset = new Date((data.sys.sunset + timezoneOffset) * 1000).toLocaleTimeString("en-US", { hour: '2-digit', minute: '2-digit', timeZone: 'UTC' });

        document.querySelector(".sunriseTime").innerHTML = `Sunrise: ${sunrise}`;
        document.querySelector(".sundownTime").innerHTML = `Sunset: ${sunset}`;

        if (data.weather[0].main === "Clouds") {
            weatherIcon.src = "images/clouds.png";
        } else if (data.weather[0].main === "Clear") {
            weatherIcon.src = "images/clear.png";
        } else if (data.weather[0].main === "Rain") {
            weatherIcon.src = "images/rain.png";
        } else if (data.weather[0].main === "Drizzle") {
            weatherIcon.src = "images/drizzle.png";
        } else if (data.weather[0].main === "Mist") {
            weatherIcon.src = "images/mist.png";
        } else if (data.weather[0].main === "Snow") {
            weatherIcon.src = "images/snow.png";
        }

        console.log("Weather icon updated to: " + weatherIcon.src);
    } catch (error) {
        console.error("Error fetching weather data:", error);
        alert("Could not fetch weather data. Please try again.");
    } finally {
        spinner.style.display = 'none';
    }
}

async function getWeatherForecast(lat, lon) {
    try {
        spinner.style.display = 'block';
        const response = await fetch(`${apiURL2}?lat=${lat}&lon=${lon}&key=${apiKey2}&days=5`);
        if (!response.ok) throw new Error("Forecast not found");
        const data = await response.json();
        console.log(data);

        displayDailyForecast(data.data);
    } catch (error) {
        console.error("Error fetching forecast data:", error);
        alert("Could not fetch weather forecast. Please try again.");
    } finally {
        spinner.style.display = 'none';
    }
}

function displayDailyForecast(forecastDays) {
    const forecastContainer = document.querySelector(".Uforecast .templist");
    forecastContainer.innerHTML = '';  

    forecastDays.forEach(day => {
        const forecastElement = document.createElement("div");
        forecastElement.classList.add("next");

        forecastElement.innerHTML = `
            <div class="iconWrapper">
                <img src="https://www.weatherbit.io/static/img/icons/${day.weather.icon}.png" alt="">
                <span>${Math.round(day.temp)}°C</span>
            </div>
            <p>${new Date(day.valid_date).toDateString()}</p>
            <p>${Math.round(day.min_temp)}°C / ${Math.round(day.max_temp)}°C</p>
            <p class="desc">${day.weather.description}</p>
        `;

        forecastContainer.appendChild(forecastElement);
    } )
}

searchBtn.addEventListener("click", getCityCoordinates);
