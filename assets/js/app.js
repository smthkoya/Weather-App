const switchButton = document.getElementById("switcher");
const switchCircle = document.getElementById("circle");
const switchLabel = document.getElementById("switcherLabel");
const input = document.querySelector("#input");
const searchBtn = document.getElementById("search");
const currentBtn = document.querySelector(".currentLocation");
const API_KEY = "956ec397dfb8c43ce5809105ffbbd91e";
const API_URL = "https://api.openweathermap.org/data/2.5/";

//current location
const getCurrentLocation = function () {
  const confirmresult = confirm(
    "Do you want the website to access your geolocation?"
  );

  if (confirmresult) {
    navigator.geolocation.getCurrentPosition(async (position) => {
      const { latitude, longitude } = position.coords;

      try {
        const response = await fetch(
          `https://nominatim.openstreetmap.org/reverse?lat=${latitude}&lon=${longitude}&format=json`
        );
        const data = await response.json();
        const city =
          data.address.city || data.address.town || data.address.village;
        input.value = city;
        weatherDataAsync(city);
      } catch (error) {
        console.error(error);
      }
    });
  }
};
//show weather info
const getWeathercurrent = function (current, hourly) {
  try {
    document.querySelector(".datetime h2").textContent = current.name;

    const timezoneOffset = current.timezone;

    const currentUtcTime =
      new Date().getTime() + new Date().getTimezoneOffset() * 60000; //minutes to millisec

    const cityTime = new Date(currentUtcTime + timezoneOffset * 1000);

    document.querySelector(".currentTime").textContent =
      cityTime.toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
      });

    document.querySelector(".date").textContent = cityTime.toLocaleDateString(
      "en-GB",
      {
        weekday: "long",
        day: "numeric",
        month: "short",
      }
    );

    document.querySelector(".mainTemp .temp").textContent = `${Math.round(
      current.main.temp
    )}°C`;
    document.querySelector("#currentTemp").textContent = `${Math.round(
      current.main.feels_like
    )}°C`;

    const weatherDescription = current.weather[0].main;
    document.querySelector(".bigDetails span").textContent = weatherDescription;
    const bigDetailsI = document.querySelector(".bigDetails i");
    switch (weatherDescription) {
      case "Thunderstorm":
        bigDetailsI.classList.remove("fa-sun");
        bigDetailsI.classList.add("fa-cloud-bolt");
        break;
      case "Drizzle":
        bigDetailsI.classList.remove("fa-sun");
        bigDetailsI.classList.add("fa-smog");
        break;
      case "Rain":
        bigDetailsI.classList.remove("fa-sun");
        bigDetailsI.classList.add("fa-cloud-rain");
        break;
      case "Snow":
        bigDetailsI.classList.remove("fa-sun");
        bigDetailsI.classList.add("fa-snowflake");
        break;
      case "Atmosphere":
        bigDetailsI.classList.remove("fa-sun");
        bigDetailsI.classList.add("fa-cloud-sun");
        break;
      case "Clear":
        bigDetailsI.classList.remove("fa-sun");
        bigDetailsI.classList.add("fa-cloud-sun");
        break;
      case "Clouds":
        bigDetailsI.classList.remove("fa-sun");
        bigDetailsI.classList.add("fa-cloud");
        break;

      default:
        document.querySelector(".bigDetails i").classList.add("fa-sun");
        break;
    }

    const sunriseTime = current.sys.sunrise;
    const sunsetTime = current.sys.sunset;

    const sunriseDate = new Date(sunriseTime * 1000);
    const sunsetDate = new Date(sunsetTime * 1000);

    const sunriseHours = sunriseDate.getHours();
    const sunriseMinutes = sunriseDate.getMinutes();
    const sunsetHours = sunsetDate.getHours();
    const sunsetMinutes = sunsetDate.getMinutes();

    document.querySelector(
      ".sunrise span:nth-child(2)"
    ).textContent = `${sunriseHours}:${
      sunriseMinutes < 10 ? "0" : ""
    }${sunriseMinutes} AM`;
    document.querySelector(
      ".sunset span:nth-child(2)"
    ).textContent = `${sunsetHours}:${
      sunsetMinutes < 10 ? "0" : ""
    }${sunsetMinutes} PM`; //if < 10 evvele 0 add elesin

    document.querySelector(
      ".smallDetails .details:nth-child(1) #humidity"
    ).textContent = `${current.main.humidity}%`;
    document.querySelector(
      ".smallDetails .details:nth-child(2) #wind"
    ).textContent = `${current.wind.speed} km/h`;
    document.querySelector(
      ".smallDetails .details:nth-child(3) #pressure"
    ).textContent = `${current.main.pressure} hPa`;
    document.querySelector(
      ".smallDetails .details:nth-child(4) #uv"
    ).textContent = `UV`;

    //5 days forecast
    const forecast = document.querySelector(".forecast ul");
    let forecastHTML = "";

    for (let i = 0; i < 40; i += 8) {
      const forecastData = hourly.list[i];
      const date = new Date(forecastData.dt * 1000);
      const dayOfWeek = date.toLocaleDateString("en-GB", { weekday: "long" });
      const dayMonth = date.toLocaleDateString("en-GB", {
        day: "numeric",
        month: "short",
      });

      forecastHTML += `
    <li>
      <i class="fas fa-${getWeatherIcon(forecastData.weather[0].icon)}"></i> 
      <span>${Math.round(forecastData.main.temp)}°C</span>
      <span>${dayOfWeek}, ${dayMonth}</span>
    </li>
  `;
    }

    forecast.innerHTML = forecastHTML;

    // hourly forecast
    const timezoneOffsetHourly = hourly.city.timezone;
    const forecastHourly = document.querySelector(".hourly-items");
    let forecastHourlyHTML = "";

    for (let index = 0; index < 5; index++) {
      const forecastHourlyData = hourly.list[index];
      const forecastDate = new Date(
        (forecastHourlyData.dt + timezoneOffsetHourly) * 1000
      );

      const hourlyTime = forecastDate.toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
      });

      const iconCode = forecastHourlyData.weather[0].icon;
      const isSunshine = ["01d", "01n", "02d", "02n"].includes(iconCode);
      const weatherClass = isSunshine ? "sunshine" : "cloud";

      forecastHourlyHTML += `
    <div class="hourly-item ${weatherClass}">
      <span>${hourlyTime}</span>
       <i class="hourlyI fas fa-${getWeatherIcon(
         forecastHourlyData.weather[0].icon
       )}"></i>
      <span>${Math.round(forecastHourlyData.main.temp)}°C</span>
      <span>${Math.round(forecastHourlyData.wind.speed)} km/h</span>
    </div>
  `;
      // switch (forecastHourlyData.weather[0].icon) {
      //   case "01d":
      //   case "01n":
      //   case "02d":
      //   case "02n":
      //     hourlyItem.classList.add("sunshine");
      //     break;
      //   default:
      //     hourlyItem.classList.add("cloud");
      //     break;
      // }
    }

    forecastHourly.innerHTML = forecastHourlyHTML;

    function getWeatherIcon(iconCode) {
      switch (iconCode) {
        case "01d":
        case "01n":
          return "sun";
        case "02d":
        case "02n":
          return "cloud-sun";
        case "03d":
        case "03n":
        case "04d":
        case "04n":
          return "cloud";
        case "09d":
        case "09n":
          return "cloud-showers-heavy";
        case "10d":
        case "10n":
          return "cloud-rain";
        case "11n":
          return "cloud-bolt";
        case "13d":
        case "13n":
          return "snowflake";
        case "50d":
        case "50n":
          return "smog";
        default:
          return "sun";
      }
    }
  } catch (error) {
    alert("An error occurred while fetching the data");
  }
};
//async data
const weatherDataAsync = async function () {
  const city = input.value;
  if (!city) {
    alert("Enter the city name!");
    return;
  }

  try {
    const response = await fetch(
      `${API_URL}weather?q=${city}&appid=${API_KEY}&units=metric`
    );
    const data = await response.json();

    if (data.cod === "404") {
      alert("City not found!");
      return;
    }

    const hourlyResponse = await fetch(
      `${API_URL}forecast?q=${city}&cnt=40&appid=${API_KEY}&units=metric`
    );
    const hourlyWeather = await hourlyResponse.json();

    if (hourlyWeather.cod === "404") {
      alert("Hourly data not found!");
      return;
    }

    getWeathercurrent(data, hourlyWeather);
  } catch (error) {
    alert("An error occurred while fetching the weather data.");
    console.error(error);
  }
};
//dark mode switch light mode
const changeMode = function () {
  const isLight = switchCircle.classList.contains("light");

  switchCircle.classList.toggle("light", !isLight);
  switchCircle.classList.toggle("dark", isLight);
  document.body.classList.toggle("light-mode", !isLight);
  document.body.classList.toggle("dark-mode", isLight);

  switchLabel.textContent = isLight ? "Dark Mode" : "Light Mode";
};

currentBtn.addEventListener("click", getCurrentLocation);
searchBtn.addEventListener("click", weatherDataAsync);
switchButton.addEventListener("click", changeMode);
