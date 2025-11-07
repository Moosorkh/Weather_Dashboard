import "./styles/jass.css";

// Declare Leaflet global (loaded via CDN)
declare const L: any;

interface WeatherData {
  city: string;
  date: string;
  icon: string;
  iconDescription: string;
  tempF: number;
  windSpeed: number;
  humidity: number;
  feelsLikeF?: number;
  uvIndex?: number;
  visibility?: number;
  pressure?: number;
}

// Temperature unit state
let currentUnit: "F" | "C" = "F";
let currentWeatherData: WeatherData[] = [];
let currentCityCoordinates: { lat: number; lon: number } | null = null;
let selectedCityName = "";

// * All necessary DOM elements selected
const searchForm: HTMLFormElement = document.getElementById(
  "search-form"
) as HTMLFormElement;
const searchInput: HTMLInputElement = document.getElementById(
  "search-input"
) as HTMLInputElement;
const clearButton = document.getElementById(
  "clear-button"
) as HTMLButtonElement;
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
  const {
    city,
    date,
    icon,
    iconDescription,
    tempF,
    windSpeed,
    humidity,
    feelsLikeF,
    visibility,
    pressure,
  } = currentWeather;

  const visibilityKm = visibility ? (visibility / 1000).toFixed(1) : "N/A";

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
        <i class="fas fa-temperature-half stat-icon"></i>
        <div class="stat-content">
          <span class="stat-label">Feels Like</span>
          <span class="stat-value">${
            feelsLikeF ? getTemperatureDisplay(feelsLikeF) : "N/A"
          }</span>
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
      <div class="stat-card">
        <i class="fas fa-eye stat-icon"></i>
        <div class="stat-content">
          <span class="stat-label">Visibility</span>
          <span class="stat-value">${visibilityKm} km</span>
        </div>
      </div>
      <div class="stat-card">
        <i class="fas fa-gauge-high stat-icon"></i>
        <div class="stat-content">
          <span class="stat-label">Pressure</span>
          <span class="stat-value">${pressure || "N/A"} hPa</span>
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
        <i class="fas fa-temperature-half stat-icon"></i>
        <div class="stat-content">
          <span class="stat-label">Feels Like</span>
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
      <div class="stat-card">
        <i class="fas fa-eye stat-icon"></i>
        <div class="stat-content">
          <span class="stat-label">Visibility</span>
          <span class="stat-value">-- km</span>
        </div>
      </div>
      <div class="stat-card">
        <i class="fas fa-gauge-high stat-icon"></i>
        <div class="stat-content">
          <span class="stat-label">Pressure</span>
          <span class="stat-value">-- hPa</span>
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
  selectedCityName = suggestion.name;
  hideAutocomplete();

  // Store coordinates and city name for map
  selectedCityName = suggestion.name;
  currentCityCoordinates = { lat: suggestion.lat, lon: suggestion.lon };

  // Automatically submit the form with the selected city
  fetchWeather(suggestion.name).then(() => {
    getAndRenderHistory();

    // Update map with new city location
    if (currentCityCoordinates) {
      initializeMap(
        currentCityCoordinates.lat,
        currentCityCoordinates.lon,
        selectedCityName
      );
    }
  });
  searchInput.value = "";
};

// Input event for autocomplete
searchInput.addEventListener("input", (e) => {
  const query = (e.target as HTMLInputElement).value.trim();

  // Show/hide clear button based on input
  if (query.length > 0) {
    clearButton.style.display = "flex";
  } else {
    clearButton.style.display = "none";
  }

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

const handleSearchFormSubmit = (e: any) => {
  e.preventDefault();
  // Form submission is disabled - city selection happens via autocomplete
  // This prevents accidental form submissions
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

// Clear button functionality
clearButton?.addEventListener("click", () => {
  // Clear the weather display
  todayContainer.innerHTML = `
    <div class="weather-header-section">
      <h2 class="city-title" id="search-title">
        <i class="fas fa-map-marker-alt"></i>
        Search for a city to get started
      </h2>
    </div>
  `;
  forecastContainer.innerHTML = "";
  searchInput.value = "";
  clearButton.style.display = "none";

  // Reset map to user's location
  initializeUserLocation();
});

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

/* Feature Card Click Handlers - Coming Soon Alerts */
const showComingSoonAlert = (featureName: string) => {
  todayContainer.scrollIntoView({ behavior: "smooth" });
  const alertHtml = `
    <div class="coming-soon-alert">
      <i class="fas fa-rocket"></i>
      <h3>Coming Soon!</h3>
      <p>${featureName} feature is currently under development.</p>
      <p>Stay tuned for exciting updates!</p>
    </div>
  `;

  // Create temporary alert
  const alertDiv = document.createElement("div");
  alertDiv.className = "feature-alert-overlay";
  alertDiv.innerHTML = `
    <div class="feature-alert-content">
      ${alertHtml}
      <button class="alert-close-btn">Got it!</button>
    </div>
  `;

  document.body.appendChild(alertDiv);

  // Close button handler
  const closeBtn = alertDiv.querySelector(".alert-close-btn");
  closeBtn?.addEventListener("click", () => {
    alertDiv.remove();
  });

  // Click outside to close
  alertDiv.addEventListener("click", (e) => {
    if (e.target === alertDiv) {
      alertDiv.remove();
    }
  });
};

// Attach event listeners to "Coming Soon" feature cards
document
  .getElementById("ai-insights-card")
  ?.addEventListener("click", () => showComingSoonAlert("AI Weather Insights"));
document
  .getElementById("alerts-card")
  ?.addEventListener("click", () => showComingSoonAlert("Weather Alerts"));

/* Weather Map Feature */
let weatherMap: any = null;
let userMarker: any = null;

const initializeMap = (
  lat: number,
  lon: number,
  locationName: string = "Your Location"
) => {
  const mapContainer = document.getElementById("weather-map");
  if (!mapContainer) return;

  // If map already exists, update center and marker
  if (weatherMap) {
    weatherMap.setView([lat, lon], 10);

    // Remove old marker if exists
    if (userMarker) {
      weatherMap.removeLayer(userMarker);
    }

    // Add new marker
    userMarker = L.marker([lat, lon])
      .addTo(weatherMap)
      .bindPopup(`<b>${locationName}</b>`)
      .openPopup();

    return;
  }

  // Create new map
  weatherMap = L.map("weather-map").setView([lat, lon], 10);

  // Add OpenStreetMap tile layer
  L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
    maxZoom: 19,
    attribution: "© OpenStreetMap contributors",
  }).addTo(weatherMap);

  // Add marker for the location
  userMarker = L.marker([lat, lon])
    .addTo(weatherMap)
    .bindPopup(`<b>${locationName}</b>`)
    .openPopup();
};

// Get user's current location and initialize map
const initializeUserLocation = () => {
  if (navigator.geolocation) {
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        currentCityCoordinates = { lat: latitude, lon: longitude };
        initializeMap(latitude, longitude, "Your Current Location");
      },
      (error) => {
        console.log("Geolocation error:", error.message);
        // Default to a major city (New York) if geolocation fails
        const defaultLat = 40.7128;
        const defaultLon = -74.006;
        currentCityCoordinates = { lat: defaultLat, lon: defaultLon };
        initializeMap(defaultLat, defaultLon, "New York, NY (Default)");
      }
    );
  } else {
    // Geolocation not supported, use default location
    const defaultLat = 40.7128;
    const defaultLon = -74.006;
    currentCityCoordinates = { lat: defaultLat, lon: defaultLon };
    initializeMap(defaultLat, defaultLon, "New York, NY (Default)");
  }
};

// Initialize map when page loads
document.addEventListener("DOMContentLoaded", () => {
  initializeUserLocation();
});
