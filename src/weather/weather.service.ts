import { Injectable, HttpException, HttpStatus } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import axios from 'axios';
import * as dayjs from 'dayjs';

export interface WeatherData {
  city: string;
  date: string;
  icon: string;
  iconDescription: string;
  tempF: number;
  windSpeed: number;
  humidity: number;
}

@Injectable()
export class WeatherService {
  private readonly apiKey: string;
  private readonly baseUrl: string;
  private cache = new Map<string, { data: WeatherData[]; timestamp: number }>();
  private readonly CACHE_TTL = 60 * 60 * 1000; // 1 hour in milliseconds

  constructor(private configService: ConfigService) {
    this.apiKey = this.configService.get<string>('API_KEY');
    this.baseUrl = this.configService.get<string>('API_BASE_URL');
  }

  async getWeatherForCity(city: string): Promise<WeatherData[]> {
    // Check cache first
    const cacheKey = city.toLowerCase();
    const cachedData = this.cache.get(cacheKey);
    const now = Date.now();

    if (cachedData && now - cachedData.timestamp < this.CACHE_TTL) {
      return cachedData.data;
    }

    try {
      // Get coordinates for the city
      const geoResponse = await axios.get(
        `${this.baseUrl}/geo/1.0/direct?q=${city}&limit=1&appid=${this.apiKey}`,
      );

      if (!geoResponse.data || geoResponse.data.length === 0) {
        throw new HttpException('City not found', HttpStatus.NOT_FOUND);
      }

      const { lat, lon, name } = geoResponse.data[0];

      // Get weather forecast
      const weatherResponse = await axios.get(
        `${this.baseUrl}/data/2.5/forecast?lat=${lat}&lon=${lon}&appid=${this.apiKey}&units=imperial`,
      );

      if (!weatherResponse.data || !weatherResponse.data.list) {
        throw new HttpException('Weather data not available', HttpStatus.NOT_FOUND);
      }

      // Parse weather data
      const weatherData: WeatherData[] = this.parseWeatherData(
        name,
        weatherResponse.data.list,
      );

      // Store in cache
      this.cache.set(cacheKey, { data: weatherData, timestamp: now });

      return weatherData;
    } catch (error) {
      if (error instanceof HttpException) {
        throw error;
      }
      throw new HttpException(
        'Failed to fetch weather data',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  private parseWeatherData(city: string, forecastList: any[]): WeatherData[] {
    // Current weather (first item in the list)
    const current = forecastList[0];
    const currentWeather: WeatherData = {
      city,
      date: dayjs.unix(current.dt).format('MM/DD/YYYY'),
      icon: current.weather[0].icon,
      iconDescription: current.weather[0].description,
      tempF: current.main.temp,
      windSpeed: current.wind.speed,
      humidity: current.main.humidity,
    };

    // Get forecast for the next 5 days (at noon)
    const forecast = forecastList
      .filter((item) => item.dt_txt.includes('12:00:00'))
      .slice(0, 5)
      .map((day) => ({
        city,
        date: dayjs.unix(day.dt).format('MM/DD/YYYY'),
        icon: day.weather[0].icon,
        iconDescription: day.weather[0].description,
        tempF: day.main.temp,
        windSpeed: day.wind.speed,
        humidity: day.main.humidity,
      }));

    return [currentWeather, ...forecast];
  }
}