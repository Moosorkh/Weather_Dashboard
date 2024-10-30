import dayjs, { Dayjs } from "dayjs";
import dotenv from "dotenv";
import NodeCache from "node-cache";
dotenv.config();

// Define an interface for the Coordinates object
interface Coordinates {
  name: string;
  lat: number;
  lon: number;
  country: string;
  state: string;
}

// Define a class for the Weather object
class Weather {
  constructor(
    public city: string,
    public date: Dayjs | string,
    public humidity: number,
    public tempF: number,
    public windSpeed: number,
    public icon: string,
    public iconDescription: string
  ) {}
}

const rateLimiter = new NodeCache({ stdTTL: 60, checkperiod: 120 });

// Complete the WeatherService class
class WeatherService {
  private baseURL?: string;
  private apiKey?: string;
  private city = "";

  constructor() {
    this.baseURL = process.env.API_BASE_URL || "";
    this.apiKey = process.env.API_KEY || "";
  }

  private async fetchLocationData(query: string) {
    try {
      if (!this.baseURL || !this.apiKey) {
        throw new Error("Invalid API URL or Key");
      }
      const response: Coordinates[] = await fetch(query).then((res) =>
        res.json()
      );
      return response[0];
    } catch (error) {
      console.log(error);
      throw error;
    }
  }

  private destructureLocationData(locationData: Coordinates): Coordinates {
    if (!locationData) {
      throw new Error("Invalid Location Data");
    }
    const { name, lat, lon, country, state } = locationData;

    return { name, lat, lon, country, state };
  }

  private buildGeocodeQuery(): string {
    return `${this.baseURL}/geo/1.0/direct?q=${this.city}&limit=1&appid=${this.apiKey}`;
  }

  private buildWeatherQuery(coordinates: Coordinates): string {
    const { lat, lon } = coordinates;
    return `${this.baseURL}/data/2.5/forecast?lat=${lat}&lon=${lon}&appid=${this.apiKey}&units=imperial`;
  }

  private async fetchAndDestructureLocationData() {
    const locationData = await this.fetchLocationData(this.buildGeocodeQuery());
    return this.destructureLocationData(locationData);
  }

  private async fetchWeatherData(coordinates: Coordinates) {
    try {
      const response = await fetch(this.buildWeatherQuery(coordinates)).then(
        (response) => response.json()
      );
      if (!response || !response.list) {
        throw new Error("Invalid Weather Data");
      }
      const currentWeather: Weather = this.parseCurrentWeather(
        response.list[0]
      );
      const forecast: Weather[] = this.buildForecastArray(
        currentWeather,
        response.list
      );
      return forecast;
    } catch (error) {
      console.log(error);
      throw new Error("Weather API failed");
    }
  }

  private parseCurrentWeather(response: any) {
    const parsedDate = dayjs.unix(response.dt).format("MM/DD/YYYY");
    return new Weather(
      this.city,
      parsedDate,
      response.main.humidity,
      response.main.temp,
      response.wind.speed,
      response.weather[0].icon,
      response.weather[0].description || response.weather[0].main
    );
  }

  private buildForecastArray(currentWeather: Weather, weatherData: any[]) {
    const weatherForecast: Weather[] = [currentWeather];
    const filteredWeatherData = weatherData.filter((data: any) => {
      return data.dt_txt.includes("12:00:00");
    });

    for (const day of filteredWeatherData) {
      weatherForecast.push(
        new Weather(
          this.city,
          dayjs.unix(day.dt).format("MM/DD/YYYY"),
          day.main.humidity,
          day.main.temp,
          day.wind.speed,
          day.weather[0].icon,
          day.weather[0].description || day.weather[0].main
        )
      );
    }
    return weatherForecast;
  }

  async getWeatherForCity(city: string) {
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
    } catch (error) {
      console.log(error);
      return error;
    }
  }
}

export default new WeatherService();
