import dayjs from "dayjs";
import dotenv from "dotenv";
//import NodeCache from "node-cache";
dotenv.config();
//const rateLimiter = new NodeCache({ stdTTL: 60, checkperiod: 120 });
// Define a class for the Weather object
class Weather {
    constructor(city, date, humidity, tempF, windSpeed, icon, iconDescription) {
        this.city = city;
        this.date = date;
        this.humidity = humidity;
        this.tempF = tempF;
        this.windSpeed = windSpeed;
        this.icon = icon;
        this.iconDescription = iconDescription;
    }
}
// Complete the WeatherService class
class WeatherService {
    constructor() {
        this.city = "";
        this.baseURL = process.env.API_BASE_URL || "";
        this.apiKey = process.env.API_KEY || "";
    }
    // Create fetchLocationData method
    async fetchLocationData(query) {
        try {
            console.log(this.baseURL);
            console.log(this.apiKey);
            if (!this.baseURL || !this.apiKey) {
                throw new Error("Invalid API URL or Key");
            }
            const response = await fetch(query).then((res) => res.json());
            return response[0];
        }
        catch (error) {
            console.log(error);
            throw error;
        }
    }
    // Create destructureLocationData method
    destructureLocationData(locationData) {
        if (!locationData) {
            throw new Error("Invalid Location Data");
        }
        const { name, lat, lon, country, state } = locationData;
        const coordinates = {
            name,
            lat,
            lon,
            country,
            state,
        };
        return coordinates;
    }
    buildGeocodeQuery() {
        const geocodeQuery = `${this.baseURL}/geo/1.0/direct?q=${this.city}&limit=1&appid=${this.apiKey}`;
        return geocodeQuery;
    }
    // Create buildWeatherQuery method
    buildWeatherQuery(coordinates) {
        const { lat, lon } = coordinates;
        const weatherQuery = `${this.baseURL}/data/2.5/forecast?lat=${lat}&lon=${lon}&appid=${this.apiKey}&units=imperial`;
        return weatherQuery;
    }
    // Create fetchAndDestructureLocationData method
    async fetchAndDestructureLocationData() {
        const locationData = await this.fetchLocationData(this.buildGeocodeQuery());
        return this.destructureLocationData(locationData);
    }
    // Create fetchWeatherData method
    async fetchWeatherData(coordinates) {
        try {
            const response = await fetch(this.buildWeatherQuery(coordinates)).then((response) => response.json());
            if (!response) {
                throw new Error("Invalid Weather Data");
            }
            const currentWeather = this.parseCurrentWeather(response.list[0]);
            const forecast = this.buildForecastArray(currentWeather, response.list);
            return forecast;
        }
        catch (error) {
            console.log(error);
            return error;
        }
    }
    // Build parseCurrentWeather method
    parseCurrentWeather(response) {
        const parsedDate = dayjs.unix(response.dt).format("MM/DD/YYYY");
        const currentWeather = new Weather(this.city, parsedDate, response.main.temp, response.wind.speed, response.main.humidity, response.weather[0].icon, response.weather[0].description || response.weather[0].main);
        return currentWeather;
    }
    // Complete buildForecastArray method
    buildForecastArray(currentWeather, weatherData) {
        const weatherForecast = [currentWeather];
        const filteredWeatherData = weatherData.filter((data) => {
            return data.dt_txt.includes("12:00:00");
        });
        for (const day of filteredWeatherData) {
            weatherForecast.push(new Weather(this.city, dayjs.unix(day.dt).format("MM/DD/YYYY"), day.main.temp, day.wind.speed, day.main.humidity, day.weather[0].icon, day.weather[0].description || day.weather[0].main));
        }
        return weatherForecast;
    }
    // Complete getWeatherForCity method
    async getWeatherForCity(city) {
        try {
            this.city = city;
            const coordinates = await this.fetchAndDestructureLocationData();
            if (coordinates) {
                this.city = coordinates.name;
                const weatherData = await this.fetchWeatherData(coordinates);
                return weatherData;
            }
            throw new Error("Invalid Coordinates");
        }
        catch (error) {
            console.log(error);
            return error;
        }
    }
}
export default new WeatherService();
