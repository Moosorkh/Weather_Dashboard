import "./styles/jass.css";

interface WeatherData {
  city: string;
  date: string;
  icon: string;
  iconDescription: string;
  tempF: number;
  windSpeed: number;
  humidity: number;
}

// * All necessary DOM elements selected
const searchForm: HTMLFormElement = document.getElementById(
  "search-form"
) as HTMLFormElement;
const searchInput: HTMLInputElement = document.getElementById(
  "search-input"
) as HTMLInputElement;
const todayContainer = document.querySelector("#today") as HTMLDivElement;
const forecastContainer = document.querySelector("#forecast") as HTMLDivElement;
const searchHistoryContainer = document.getElementById(
  "history"
) as HTMLDivElement;
const heading: HTMLHeadingElement = document.getElementById(
  "search-title"
) as HTMLHeadingElement;
const weatherIcon: HTMLImageElement = document.getElementById(
  "weather-img"
) as HTMLImageElement;
const tempEl: HTMLParagraphElement = document.getElementById(
  "temp"
) as HTMLParagraphElement;
const windEl: HTMLParagraphElement = document.getElementById(
  "wind"
) as HTMLParagraphElement;
const humidityEl: HTMLParagraphElement = document.getElementById(
  "humidity"
) as HTMLParagraphElement;

/* Function to normalize city name (capitalize each word) */
const normalizeCityName = (city: string) => {
  return city
    .toLowerCase()
    .split(" ")
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
};

/* API Calls */
const fetchWeather = async (cityName: string) => {
  try {
    const normalizedCityName = normalizeCityName(cityName);
    const response = await fetch("/api/weather/", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ cityName: normalizedCityName }),
    });

    if (!response.ok) throw new Error("City not found.");

    const weatherData: WeatherData[] = await response.json();

    renderCurrentWeather(weatherData[0]);
    renderForecast(weatherData.slice(1));
  } catch (error) {
    console.error("Error fetching the weather data: ", error);
    alert("City not found. Please try again.");
    forecastContainer.innerHTML = ""; // Clear the forecast if there's an error
  }
};

const fetchSearchHistory = async () => {
  const history = await fetch("/api/weather/history", {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
    },
  });
  return history;
};

const deleteCityFromHistory = async (id: string) => {
  await fetch(`/api/weather/history/${id}`, {
    method: "DELETE",
    headers: {
      "Content-Type": "application/json",
    },
  });
};

/* Render Functions */
const renderCurrentWeather = (currentWeather: WeatherData): void => {
  const { city, date, icon, iconDescription, tempF, windSpeed, humidity } =
    currentWeather;

  heading.textContent = `${city} (${date})`;
  weatherIcon.setAttribute(
    "src",
    `https://openweathermap.org/img/w/${icon}.png`
  );
  weatherIcon.setAttribute("alt", iconDescription);
  weatherIcon.setAttribute("class", "weather-img");
  heading.append(weatherIcon);
  tempEl.textContent = `Temperature: ${tempF}°F`;
  windEl.textContent = `Wind: ${windSpeed} MPH`;
  humidityEl.textContent = `Humidity: ${humidity} %`;

  todayContainer.innerHTML = "";
  todayContainer.append(heading, tempEl, windEl, humidityEl);
};

const renderForecast = (forecast: WeatherData[]): void => {
  const headingCol = document.createElement("div");
  const heading = document.createElement("h4");

  headingCol.setAttribute("class", "col-12");
  heading.textContent = "5-Day Forecast:";
  headingCol.append(heading);

  forecastContainer.innerHTML = "";
  forecastContainer.append(headingCol);

  forecast.forEach(renderForecastCard);
};

const renderForecastCard = (forecast: WeatherData) => {
  const { date, icon, iconDescription, tempF, windSpeed, humidity } = forecast;

  const { col, cardTitle, weatherIcon, tempEl, windEl, humidityEl } =
    createForecastCard();

  cardTitle.textContent = date;
  weatherIcon.setAttribute(
    "src",
    `https://openweathermap.org/img/w/${icon}.png`
  );
  weatherIcon.setAttribute("alt", iconDescription);
  tempEl.textContent = `Temp: ${tempF} °F`;
  windEl.textContent = `Wind: ${windSpeed} MPH`;
  humidityEl.textContent = `Humidity: ${humidity} %`;

  forecastContainer.append(col);
};

const renderSearchHistory = async () => {
  const searchHistory = await fetchSearchHistory();
  const historyList = await searchHistory.json();

  searchHistoryContainer.innerHTML = "";
  if (!historyList.length) {
    searchHistoryContainer.innerHTML =
      '<p class="text-center">   No Previous Search History</p>';
    return;
  }

  historyList.forEach((city: any) => {
    const historyItem = buildHistoryListItem(city);
    searchHistoryContainer.append(historyItem);
  });
};

/* Helper Functions */

const clearWeatherDisplay = () => {
  heading.textContent = "Search for a city!";
  //todayContainer.innerHTML = "";
  forecastContainer.innerHTML = "";
   tempEl.textContent = `Temperature: °F`;
   windEl.textContent = `Wind: MPH`;
   humidityEl.textContent = `Humidity: %`;
};

const createForecastCard = () => {
  const col = document.createElement("div");
  const card = document.createElement("div");
  const cardBody = document.createElement("div");
  const cardTitle = document.createElement("h5");
  const weatherIcon = document.createElement("img");
  const tempEl = document.createElement("p");
  const windEl = document.createElement("p");
  const humidityEl = document.createElement("p");

  col.append(card);
  card.append(cardBody);
  cardBody.append(cardTitle, weatherIcon, tempEl, windEl, humidityEl);

  col.classList.add("col-auto");
  card.classList.add(
    "forecast-card",
    "card",
    "text-white",
    "bg-primary",
    "h-100"
  );
  cardBody.classList.add("card-body", "p-2");
  cardTitle.classList.add("card-title");
  tempEl.classList.add("card-text");
  windEl.classList.add("card-text");
  humidityEl.classList.add("card-text");

  return {
    col,
    cardTitle,
    weatherIcon,
    tempEl,
    windEl,
    humidityEl,
  };
};

const buildHistoryListItem = (city: any) => {
  const newBtn = createHistoryButton(city.name);
  const deleteBtn = createDeleteButton();
  deleteBtn.dataset.city = JSON.stringify(city);
  const historyDiv = createHistoryDiv();
  historyDiv.append(newBtn, deleteBtn);
  return historyDiv;
};

const createHistoryButton = (city: string) => {
  const btn = document.createElement("button");
  btn.setAttribute("type", "button");
  btn.setAttribute("aria-controls", "today forecast");
  btn.classList.add("history-btn", "btn", "btn-secondary", "col-10");
  btn.textContent = normalizeCityName(city);

  return btn;
};

const createDeleteButton = () => {
  const delBtnEl = document.createElement("button");
  delBtnEl.setAttribute("type", "button");
  delBtnEl.classList.add(
    "fas",
    "fa-trash-alt",
    "delete-city",
    "btn",
    "btn-danger",
    "col-2"
  );

  delBtnEl.addEventListener("click", handleDeleteHistoryClick);
  return delBtnEl;
};

const createHistoryDiv = () => {
  const div = document.createElement("div");
  div.classList.add("display-flex", "gap-2", "col-12", "m-1");
  return div;
};

/* Event Handlers */

const handleSearchFormSubmit = (event: any): void => {
  event.preventDefault();

  const search: string = searchInput.value.trim();
  const regex = /^[a-zA-Z\s]*$/;

  // Validate empty input
  if (!search) {
    alert(
      "Search field is empty. Please enter a valid city name"
    );
    forecastContainer.innerHTML = ""; // Clear forecast on error
    return;
  }

  // Validate input format
  if (!regex.test(search)) {
    alert("Please enter a valid city name.");
    forecastContainer.innerHTML = ""; // Clear forecast on error
    return;
  }

  fetchWeather(search).then(() => {
    getAndRenderHistory();
  });
  searchInput.value = "";
};

const handleSearchHistoryClick = (event: any) => {
  if (event.target.matches(".history-btn")) {
    const city = event.target.textContent;
    fetchWeather(city).then(getAndRenderHistory);
  }
};
const handleDeleteHistoryClick = (event: any) => {
  event.stopPropagation();
  const cityData = JSON.parse(event.target.getAttribute("data-city"));
  const cityID = cityData.id;
  const cityName = cityData.name;

  deleteCityFromHistory(cityID).then(() => {
    if (heading.textContent && heading.textContent.includes(cityName)) {
      clearWeatherDisplay();
    }
    getAndRenderHistory();
  });
};
/* Initial Render */

const getAndRenderHistory = () =>
  fetchSearchHistory().then(renderSearchHistory);

searchForm?.addEventListener("submit", handleSearchFormSubmit);
searchHistoryContainer?.addEventListener("click", handleSearchHistoryClick);

getAndRenderHistory();
