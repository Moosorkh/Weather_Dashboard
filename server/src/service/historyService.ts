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

  //Ensure the file exists before trying to read or write to it
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

  // Define a removeCity method that removes a city from the searchHistory.json file
  async removeCity(id: string): Promise<void> {
    let cities = await this.read();
    cities = cities.filter((city) => city.id !== id);
    await this.write(cities);
  }
}

export default new HistoryService();
