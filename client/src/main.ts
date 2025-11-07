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

// Temperature unit state
let currentUnit: "F" | "C" = "F";
let currentWeatherData: WeatherData[] = [];

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

/* Function to normalize city name (capitalize each word) */
const normalizeCityName = (city: string) => {
  return city
    .toLowerCase()
    .split(" ")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
};

/* Temperature conversion functions */
const fahrenheitToCelsius = (tempF: number): number => {
  return Math.round((tempF - 32) * (5 / 9));
};

const getTemperatureDisplay = (tempF: number): string => {
  if (currentUnit === "C") {
    return `${fahrenheitToCelsius(tempF)}°C`;
  }
  return `${Math.round(tempF)}°F`;
};

/* Loading state management */
const showLoading = () => {
  todayContainer.innerHTML = `
    <div class="loading-spinner">
      <i class="fas fa-circle-notch spinner-icon"></i>
      <span class="loading-text">Fetching weather data...</span>
    </div>
  `;
  forecastContainer.innerHTML = `
    <div class="loading-spinner">
      <i class="fas fa-circle-notch spinner-icon"></i>
      <span class="loading-text">Loading forecast...</span>
    </div>
  `;
};

const hideLoading = () => {
  // Loading is cleared when content is rendered
};

/* API Calls */
const fetchWeather = async (cityName: string) => {
  try {
    showLoading();
    const normalizedCityName = normalizeCityName(cityName);
    const response = await fetch("/api/weather/", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ cityName: normalizedCityName }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || "City not found.");
    }

    const weatherData: WeatherData[] = await response.json();
    currentWeatherData = weatherData;

    renderCurrentWeather(weatherData[0]);
    renderForecast(weatherData.slice(1));
    hideLoading();
  } catch (error: any) {
    console.error("Error fetching the weather data: ", error);
    todayContainer.innerHTML = `
      <div class="error-message">
        <i class="fas fa-exclamation-triangle"></i>
        <span>${error.message || "City not found. Please try again."}</span>
      </div>
    `;
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

  todayContainer.innerHTML = `
    <div class="weather-header-section">
      <h2 class="city-title" id="search-title">
        <i class="fas fa-map-marker-alt"></i>
        ${city} (${date})
      </h2>
      <img 
        src="https://openweathermap.org/img/w/${icon}.png" 
        alt="${iconDescription}"
        class="weather-icon-large"
      />
    </div>
    <div class="weather-stats">
      <div class="stat-card">
        <i class="fas fa-temperature-high stat-icon"></i>
        <div class="stat-content">
          <span class="stat-label">Temperature</span>
          <span class="stat-value">${getTemperatureDisplay(tempF)}</span>
        </div>
      </div>
      <div class="stat-card">
        <i class="fas fa-wind stat-icon"></i>
        <div class="stat-content">
          <span class="stat-label">Wind Speed</span>
          <span class="stat-value">${windSpeed} MPH</span>
        </div>
      </div>
      <div class="stat-card">
        <i class="fas fa-tint stat-icon"></i>
        <div class="stat-content">
          <span class="stat-label">Humidity</span>
          <span class="stat-value">${humidity}%</span>
        </div>
      </div>
    </div>
  `;
};

const renderForecast = (forecast: WeatherData[]): void => {
  forecastContainer.innerHTML = "";
  forecast.forEach(renderForecastCard);
};

const renderForecastCard = (forecast: WeatherData) => {
  const { date, icon, iconDescription, tempF, windSpeed, humidity } = forecast;

  const card = document.createElement("div");
  card.className = "forecast-card";

  card.innerHTML = `
    <div class="forecast-date">${date}</div>
    <img 
      src="https://openweathermap.org/img/w/${icon}.png" 
      alt="${iconDescription}"
      class="forecast-icon"
    />
    <div class="forecast-temp">${getTemperatureDisplay(tempF)}</div>
    <div class="forecast-details">
      <div class="forecast-detail">
        <span><i class="fas fa-wind"></i> Wind:</span>
        <span>${windSpeed} MPH</span>
      </div>
      <div class="forecast-detail">
        <span><i class="fas fa-tint"></i> Humidity:</span>
        <span>${humidity}%</span>
      </div>
    </div>
  `;

  forecastContainer.append(card);
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
  todayContainer.innerHTML = `
    <div class="weather-header-section">
      <h2 class="city-title">
        <i class="fas fa-map-marker-alt"></i>
        Search for a city to get started
      </h2>
    </div>
    <div class="weather-stats">
      <div class="stat-card">
        <i class="fas fa-temperature-high stat-icon"></i>
        <div class="stat-content">
          <span class="stat-label">Temperature</span>
          <span class="stat-value">--°${currentUnit}</span>
        </div>
      </div>
      <div class="stat-card">
        <i class="fas fa-wind stat-icon"></i>
        <div class="stat-content">
          <span class="stat-label">Wind Speed</span>
          <span class="stat-value">-- MPH</span>
        </div>
      </div>
      <div class="stat-card">
        <i class="fas fa-tint stat-icon"></i>
        <div class="stat-content">
          <span class="stat-label">Humidity</span>
          <span class="stat-value">-- %</span>
        </div>
      </div>
    </div>
  `;
  forecastContainer.innerHTML = "";
  currentWeatherData = [];
};

const buildHistoryListItem = (city: any) => {
  const historyDiv = document.createElement("div");
  historyDiv.className = "history-item";

  const newBtn = document.createElement("button");
  newBtn.className = "history-btn";
  newBtn.textContent = normalizeCityName(city.name);
  newBtn.setAttribute("type", "button");
  newBtn.setAttribute("aria-controls", "today forecast");
  newBtn.addEventListener("click", () => {
    fetchWeather(city.name).then(getAndRenderHistory);
  });

  const deleteBtn = document.createElement("button");
  deleteBtn.className = "delete-btn";
  deleteBtn.innerHTML = '<i class="fas fa-trash-alt"></i>';
  deleteBtn.setAttribute("type", "button");
  deleteBtn.dataset.city = JSON.stringify(city);
  deleteBtn.addEventListener("click", handleDeleteHistoryClick);

  historyDiv.append(newBtn, deleteBtn);
  return historyDiv;
};

/* Autocomplete functionality */
let autocompleteTimeout: number;
let selectedSuggestionIndex = -1;
let autocompleteSuggestions: any[] = [];

// Create autocomplete dropdown element
const createAutocompleteDropdown = (): HTMLDivElement => {
  const existing = document.querySelector(
    ".autocomplete-dropdown"
  ) as HTMLDivElement;
  if (existing) return existing;

  const dropdown = document.createElement("div");
  dropdown.className = "autocomplete-dropdown";
  dropdown.style.display = "none";
  searchInput.parentElement?.appendChild(dropdown);
  return dropdown;
};

const dropdown = createAutocompleteDropdown();

const fetchAutocomplete = async (query: string) => {
  try {
    const response = await fetch(
      `/api/weather/autocomplete?q=${encodeURIComponent(query)}`
    );
    if (!response.ok) return [];
    return await response.json();
  } catch (error) {
    console.error("Autocomplete error:", error);
    return [];
  }
};

const renderAutocomplete = (suggestions: any[]) => {
  if (!dropdown) return;

  if (suggestions.length === 0) {
    dropdown.innerHTML =
      '<div class="autocomplete-empty">No cities found</div>';
    dropdown.style.display = "block";
    return;
  }

  dropdown.innerHTML = suggestions
    .map(
      (suggestion, index) => `
    <div class="autocomplete-item ${
      index === selectedSuggestionIndex ? "selected" : ""
    }" data-index="${index}">
      <i class="fas fa-map-marker-alt"></i>
      <div>
        <div class="city-name">${suggestion.name}</div>
        <div class="city-details">${
          suggestion.state ? `${suggestion.state}, ` : ""
        }${suggestion.country}</div>
      </div>
    </div>
  `
    )
    .join("");

  dropdown.style.display = "block";
};

const hideAutocomplete = () => {
  if (dropdown) {
    dropdown.style.display = "none";
    selectedSuggestionIndex = -1;
  }
};

const selectSuggestion = (suggestion: any) => {
  searchInput.value = suggestion.name;
  hideAutocomplete();
  // Automatically submit the form with the selected city
  fetchWeather(suggestion.name).then(() => {
    getAndRenderHistory();
  });
  searchInput.value = "";
};

// Input event for autocomplete
searchInput.addEventListener("input", (e) => {
  const query = (e.target as HTMLInputElement).value.trim();

  clearTimeout(autocompleteTimeout);

  if (query.length < 2) {
    hideAutocomplete();
    return;
  }

  // Debounce autocomplete requests
  autocompleteTimeout = window.setTimeout(async () => {
    const suggestions = await fetchAutocomplete(query);
    autocompleteSuggestions = suggestions;
    selectedSuggestionIndex = -1;
    renderAutocomplete(suggestions);
  }, 300);
});

// Keyboard navigation
searchInput.addEventListener("keydown", (e) => {
  if (!dropdown || dropdown.style.display === "none") return;

  if (e.key === "ArrowDown") {
    e.preventDefault();
    selectedSuggestionIndex = Math.min(
      selectedSuggestionIndex + 1,
      autocompleteSuggestions.length - 1
    );
    renderAutocomplete(autocompleteSuggestions);
  } else if (e.key === "ArrowUp") {
    e.preventDefault();
    selectedSuggestionIndex = Math.max(selectedSuggestionIndex - 1, 0);
    renderAutocomplete(autocompleteSuggestions);
  } else if (e.key === "Enter" && selectedSuggestionIndex >= 0) {
    e.preventDefault();
    selectSuggestion(autocompleteSuggestions[selectedSuggestionIndex]);
  } else if (e.key === "Escape") {
    hideAutocomplete();
  }
});

// Click on autocomplete item
if (dropdown) {
  dropdown.addEventListener("click", (e) => {
    const item = (e.target as HTMLElement).closest(".autocomplete-item");
    if (item) {
      const index = parseInt(item.getAttribute("data-index") || "0");
      selectSuggestion(autocompleteSuggestions[index]);
    }
  });
}

// Close dropdown when clicking outside
document.addEventListener("click", (e) => {
  if (
    !searchInput.contains(e.target as Node) &&
    dropdown &&
    !dropdown.contains(e.target as Node)
  ) {
    hideAutocomplete();
  }
});

/* Event Handlers */

const handleSearchFormSubmit = (event: any): void => {
  event.preventDefault();

  const search: string = searchInput.value.trim();
  const regex = /^[a-zA-Z\s]*$/;

  // Validate empty input
  if (!search) {
    alert("Search field is empty. Please enter a valid city name");
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
  const cityData = JSON.parse(
    event.target.closest(".delete-btn").getAttribute("data-city")
  );
  const cityID = cityData.id;
  const cityName = cityData.name;

  deleteCityFromHistory(cityID).then(() => {
    // Check if current weather display shows the deleted city
    const currentCityTitle = document.querySelector(".city-title");
    if (
      currentCityTitle &&
      currentCityTitle.textContent &&
      currentCityTitle.textContent.includes(cityName)
    ) {
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

/* Dark Mode with localStorage persistence */
const darkModeToggle = document.getElementById("dark-mode-toggle");

// Check for saved dark mode preference
const isDarkMode = localStorage.getItem("darkMode") === "true";
if (isDarkMode) {
  document.body.classList.add("dark-mode");
}

if (darkModeToggle) {
  darkModeToggle.addEventListener("click", () => {
    document.body.classList.toggle("dark-mode");
    const isNowDarkMode = document.body.classList.contains("dark-mode");
    localStorage.setItem("darkMode", isNowDarkMode.toString());
  });
}

/* Temperature Unit Toggle */
const unitToggleBtn = document.getElementById("unit-toggle");

if (unitToggleBtn) {
  unitToggleBtn.addEventListener("click", () => {
    // Toggle unit
    currentUnit = currentUnit === "F" ? "C" : "F";
    const unitText = unitToggleBtn.querySelector(".unit-text");
    if (unitText) {
      unitText.textContent = `°${currentUnit === "F" ? "C" : "F"}`;
    }

    // Re-render weather with new unit if data exists
    if (currentWeatherData.length > 0) {
      renderCurrentWeather(currentWeatherData[0]);
      renderForecast(currentWeatherData.slice(1));
    } else {
      // Update placeholder text
      clearWeatherDisplay();
    }
  });
}
