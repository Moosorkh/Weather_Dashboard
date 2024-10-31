# Weather Dashboard

## Description

This project is a Weather Dashboard that allows users to search for weather information of any city. The motivation behind this project was to create a simple and intuitive application for users to quickly access weather information and store their search history for future reference.

The project was built to address the need for an accessible weather application with persistent search history. It helps users to not only retrieve current weather information but also allows them to see the previous cities they have searched for, enhancing the user experience.

Throughout the project, we learned how to work with APIs, handle persistent storage in the form of JSON files, implement in-memory fallback for data, and work with the complexities of both frontend and backend integration in a full-stack application.

## Table of Contents

- [Installation](#installation)
- [Usage](#usage)
- [License](#license)
- [Features](#features)
- [Code Samples](#code-samples)
- [How to Contribute](#how-to-contribute)
- [Deployed link](#deployed-link)
- [GitHub Repository](#github-repository)

## Installation

To install and run the project locally, follow these steps:

1. Clone the repository:

git clone [git@github.com:Moosorkh/Weather_Dashboard.git](https://github.com/Moosorkh/Weather_Dashboard.git)

2. Navigate to the project directory:
cd Weather_Dashboard


3. Install the required dependencies for both the client and server:
```bash
npm install
```

4. Start the development environment:
- For the backend:
  ```
  npm start
  ```
- For the frontend:

  ```
  npm run dev
  ```

5. Navigate to `http://localhost:3000` in your browser to use the application.

## Usage

Once installed and running, users can search for weather data by entering the name of a city in the input field. The weather data will be fetched and displayed on the dashboard. The previous searches will be displayed on the sidebar as history, allowing the user to reselect them quickly.

Screenshots for reference:

![Weather Dashboard Screenshot](https://static.bc-edx.com/coding/software-dev/09-Servers-and-APIs/assets/09-servers-and-apis-homework-demo.png)

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Badges

![License](https://img.shields.io/badge/license-MIT-blue.svg)
![Top Language](https://img.shields.io/github/languages/top/your-username/your-repo-name)

## Features

- Search for current weather information by city name.
- View a 5-day forecast for the selected city.
- Persistent search history that stores previous city searches. (on local machine only, this function doesn't work on the deployed version due to limitations of the free render account)

## Code Samples

### weatherRoutes.ts
```ts
import { Router, type Request, type Response } from "express";
import HistoryService from "../../service/historyService.js";
import WeatherService from "../../service/weatherService.js";

const router = Router();

// POST Request with city name to retrieve weather data
router.post("/", (req: Request, res: Response) => {
  const cityName = req.body.cityName;
  // GET weather data from city name
  WeatherService.getWeatherForCity(cityName).then((data) => {
    // save city to search history
    HistoryService.addCity(cityName);
    res.json(data);
    console.log("Weather Data:", data);
  });
});

// GET search history
router.get("/history", async (_, res) => {
  try {
    const history = await HistoryService.getCities();
    res.json(history);
  } catch (error) {
    res.status(500).json({ message: "Error retrieving search history", error });
  }
});

// DELETE city from search history
router.delete("/history/:id", async (req, res) => {
  try {
    const { id } = req.params;
    await HistoryService.removeCity(id);
    res.json({ message: `City with ID ${id} deleted from history` });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error deleting city from history", error });
  }
});

export default router;
```

### htmlRoutes.ts
```ts
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { Router } from 'express';
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const router = Router();

// Define route to serve index.html

router.get("/", (_, res) => {
  res.sendFile(path.join(__dirname, "../../public/index.html"));
});


export default router;
```

### historyServices.ts
```ts
import fs from "fs/promises";
import { v4 as uuidv4 } from "uuid";

class City {
  id: string;
  name: string;

  constructor(name: string) {
    this.id = uuidv4();
    this.name = name;
  }
}

class HistoryService {
  private filePath = "db/searchHistory.json";

  // Ensure the file exists before trying to read or write to it
  private async ensureFileExists(): Promise<void> {
    try {
      console.log(`Ensuring file exists at path: ${this.filePath}`);
      await fs.access(this.filePath);
    } catch (error: any) {
      if (error.code === "ENOENT") {
        console.log(
          `File does not exist. Creating file at path: ${this.filePath}`
        );
        await fs.writeFile(this.filePath, "[]", "utf8");
      } else {
        throw error; // Other errors should be handled properly
      }
    }
  }

  private async read(): Promise<City[]> {
    await this.ensureFileExists();
    console.log(`Reading file at path: ${this.filePath}`);
    const data = await fs.readFile(this.filePath, "utf8");

    // Handle potential parsing errors
    let cities: City[] = [];
    try {
      cities = JSON.parse(data);
    } catch (error) {
      console.log(`Error parsing JSON data: ${error}`);
      cities = [];
    }
    return cities;
  }

  private async write(cities: City[]): Promise<void> {
    await fs.writeFile(this.filePath, JSON.stringify(cities, null, 2), "utf-8");
  }

  async getCities(): Promise<City[]> {
    return await this.read();
  }

  async addCity(cityName: string): Promise<City | null> {
    if (!cityName) {
      throw new Error("City name is required");
    }

    const newCity = new City(cityName);
    const cities = await this.read();

    // Check if the city already exists
    if (cities.find((city) => city.name === cityName)) {
      console.log(`City "${cityName}" already exists`);
      return null;
    }

    cities.push(newCity);
    await this.write(cities);

    return newCity;
  }

  // * BONUS: a removeCity method that removes a city from the searchHistory.json file
  async removeCity(id: string): Promise<void> {
    let cities = await this.read();
    cities = cities.filter((city) => city.id !== id);
    await this.write(cities);
  }
}

export default new HistoryService();

```

### weatherServices.ts
```ts
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
```

## How to Contribute

Contributions are welcome! To contribute:

1. Fork the repository.
2. Create a new branch (`git checkout -b feature-branch`).
3. Make your changes and commit them (`git commit -m 'Add some feature'`).
4. Push to the branch (`git push origin feature-branch`).
5. Open a pull request.

## Deployed link
https://module-9-challenge.onrender.com/

## GitHub Repository
https://github.com/Moosorkh/Module-9-Challenge.git