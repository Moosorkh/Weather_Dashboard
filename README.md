# Weather Dashboard

## Description

This Weather Dashboard allows users to search for current weather data and a 5-day forecast for any city. The application provides a clean, responsive interface and maintains a persistent search history using a PostgreSQL database. Users can revisit their search history, enhancing usability and efficiency.

The system is built with a scalable backend using NestJS and Prisma ORM, connected to a PostgreSQL database. The frontend is developed with React, Vite, TypeScript, and Material-UI.

## Table of Contents

- [Installation](#installation)
- [Usage](#usage)
- [Technology Stack](#technology-stack)
- [License](#license)
- [Features](#features)
- [Code Samples](#code-samples)
- [How to Contribute](#how-to-contribute)
- [Deployed link](#deployed-link)
- [GitHub Repository](#github-repository)

## Installation

To install and run the project locally, follow these steps:

1. Clone the repository:

```bash
git clone https://github.com/Moosorkh/Weather_Dashboard.git
```

2. Navigate to the project directory:

```bash
cd Weather_Dashboard
```

3. Set up PostgreSQL:

```bash
psql -U postgres -c "CREATE DATABASE weather_dashboard;"
```

4. Configure environment variables in a `.env` file in the backend directory:

```bash
DATABASE_URL="postgresql://postgres:yourpassword@localhost:5432/weather_dashboard"
API_BASE_URL="https://api.openweathermap.org"
API_KEY="your_openweathermap_api_key"
```

5. Install the required dependencies:

```bash
cd backend
npm install

cd ../client
npm install
```

6. Set up the database with Prisma:

```bash
cd backend
npx prisma migrate dev --name init
```

7. Start the development environment:

```bash
# From the backend directory
npm run start:dev

# From the client directory
npm run dev
```

8. Open `http://localhost:5173` in your browser to use the application.

## Usage

Users can enter a city name to view its current weather and 5-day forecast. Past searches are saved and displayed in the sidebar for quick access.

## Technology Stack

**Frontend:**
- React
- TypeScript
- Material-UI
- Vite

**Backend:**
- NestJS
- Prisma ORM
- PostgreSQL
- TypeScript

**External API:**
- OpenWeatherMap API

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Features

- Search for current weather information by city name
- View a 5-day forecast for the selected city
- Persistent search history stored in PostgreSQL database
- Dark/Light mode toggle
- Responsive design for all screen sizes

## Code Samples

### NestJS Backend Component – `city.controller.ts`

```ts
import { Controller, Get, Post, Body, Param, Delete } from '@nestjs/common';
import { CityService } from './city.service';
import { CreateCityDto } from './dto/city.dto';

@Controller('cities')
export class CityController {
  constructor(private readonly cityService: CityService) {}

  @Get()
  findAll() {
    return this.cityService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.cityService.findOne(id);
  }

  @Post()
  create(@Body() createCityDto: CreateCityDto) {
    return this.cityService.create(createCityDto);
  }

  @Delete(':id')
  async remove(@Param('id') id: string) {
    return this.cityService.remove(id);
  }
}
```

### NestJS Backend Component – `weather.service.ts`

```ts
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
```

### React Frontend Component – `api.ts`

```ts
import axios from 'axios';
import { WeatherData, CityHistory } from '../types/weather.types';

const API_BASE_URL = '/api';

export const weatherService = {
  async getWeatherForCity(cityName: string): Promise<WeatherData[]> {
    try {
      const response = await axios.post(`${API_BASE_URL}/weather`, { cityName });
      console.log("API response:", response.data);
      return response.data;
    } catch (error) {
      console.error('Error fetching weather data:', error);
      throw error;
    }
  },

  async getSearchHistory(): Promise<CityHistory[]> {
    try {
      const response = await axios.get(`${API_BASE_URL}/cities`);
      return response.data.map((city: { id: any; name: any; createdAt: any; updatedAt: any; }) => ({
        id: city.id,
        name: city.name,
        cityName: city.name, // For backward compatibility
        createdAt: city.createdAt,
        updatedAt: city.updatedAt
      }));
    } catch (error) {
      console.error('Error fetching search history:', error);
      throw error;
    }
  },

  async deleteCity(id: string): Promise<void> {
    try {
      await axios.delete(`${API_BASE_URL}/cities/${id}`);
    } catch (error) {
      console.error('Error deleting city from history:', error);
      throw error;
    }
  }
};
```

## How to Contribute

1. Fork the repository.
2. Create a new branch (`git checkout -b feature-branch`).
3. Commit your changes (`git commit -m 'Add some feature'`).
4. Push to the branch (`git push origin feature-branch`).
5. Open a pull request.

## Deployed link

[https://module-9-challenge.onrender.com/](https://module-9-challenge.onrender.com/)

## GitHub Repository

[https://github.com/Moosorkh/Weather_Dashboard.git](https://github.com/Moosorkh/Weather_Dashboard.git)