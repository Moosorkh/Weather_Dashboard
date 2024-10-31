import dayjs from "dayjs";
import dotenv from "dotenv";
import NodeCache from "node-cache";
dotenv.config();
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
const rateLimiter = new NodeCache({ stdTTL: 60, checkperiod: 120 });
// Complete the WeatherService class
class WeatherService {
    constructor() {
        this.city = "";
        this.baseURL = process.env.API_BASE_URL || "";
        this.apiKey = process.env.API_KEY || "";
    }
    async fetchLocationData(query) {
        try {
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
    destructureLocationData(locationData) {
        if (!locationData) {
            throw new Error("Invalid Location Data");
        }
        const { name, lat, lon, country, state } = locationData;
        return { name, lat, lon, country, state };
    }
    buildGeocodeQuery() {
        return `${this.baseURL}/geo/1.0/direct?q=${this.city}&limit=1&appid=${this.apiKey}`;
    }
    buildWeatherQuery(coordinates) {
        const { lat, lon } = coordinates;
        return `${this.baseURL}/data/2.5/forecast?lat=${lat}&lon=${lon}&appid=${this.apiKey}&units=imperial`;
    }
    async fetchAndDestructureLocationData() {
        const locationData = await this.fetchLocationData(this.buildGeocodeQuery());
        return this.destructureLocationData(locationData);
    }
    async fetchWeatherData(coordinates) {
        try {
            const response = await fetch(this.buildWeatherQuery(coordinates)).then((response) => response.json());
            if (!response || !response.list) {
                throw new Error("Invalid Weather Data");
            }
            const currentWeather = this.parseCurrentWeather(response.list[0]);
            const forecast = this.buildForecastArray(currentWeather, response.list);
            return forecast;
        }
        catch (error) {
            console.log(error);
            throw new Error("Weather API failed");
        }
    }
    parseCurrentWeather(response) {
        const parsedDate = dayjs.unix(response.dt).format("MM/DD/YYYY");
        return new Weather(this.city, parsedDate, response.main.humidity, response.main.temp, response.wind.speed, response.weather[0].icon, response.weather[0].description || response.weather[0].main);
    }
    buildForecastArray(currentWeather, weatherData) {
        const weatherForecast = [currentWeather];
        const filteredWeatherData = weatherData.filter((data) => {
            return data.dt_txt.includes("12:00:00");
        });
        for (const day of filteredWeatherData) {
            weatherForecast.push(new Weather(this.city, dayjs.unix(day.dt).format("MM/DD/YYYY"), day.main.humidity, day.main.temp, day.wind.speed, day.weather[0].icon, day.weather[0].description || day.weather[0].main));
        }
        return weatherForecast;
    }
    async getWeatherForCity(city) {
        try {
            const cacheKey = `${city}-${this.city}`;
            const cachedWeather = rateLimiter.get(cacheKey);
            if (cachedWeather) {
                console.log(`Returning cached weather data for ${city}`);
                return cachedWeather;
            }
            this.city = city;
            const coordinates = await this.fetchAndDestructureLocationData();
            if (coordinates) {
                const weatherData = await this.fetchWeatherData(coordinates);
                rateLimiter.set(cacheKey, weatherData);
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
