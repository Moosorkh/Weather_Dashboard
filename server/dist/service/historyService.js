import fs from "fs/promises";
import { v4 as uuidv4 } from "uuid";
class City {
    constructor(name) {
        this.id = uuidv4();
        this.name = name;
    }
}
class HistoryService {
    constructor() {
        this.filePath = "db/searchHistory.json";
    }
    //Ensure the file exists before trying to read or write to it
    async ensureFileExists() {
        try {
            console.log(`Ensuring file exists at path: ${this.filePath}`);
            await fs.access(this.filePath);
        }
        catch (error) {
            if (error.code === "ENOENT") {
                console.log(`File does not exist. Creating file at path: ${this.filePath}`);
                await fs.writeFile(this.filePath, "[]", "utf8");
            }
            else {
                throw error; // Other errors should be handled properly
            }
        }
    }
    async read() {
        await this.ensureFileExists();
        console.log(`Reading file at path: ${this.filePath}`);
        const data = await fs.readFile(this.filePath, "utf8");
        // Handle potential parsing errors
        let cities = [];
        try {
            cities = JSON.parse(data);
        }
        catch (error) {
            console.log(`Error parsing JSON data: ${error}`);
            cities = [];
        }
        return cities;
    }
    async write(cities) {
        await fs.writeFile(this.filePath, JSON.stringify(cities, null, 2), "utf-8");
    }
    async getCities() {
        return await this.read();
    }
    async addCity(cityName) {
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
    async removeCity(id) {
        let cities = await this.read();
        cities = cities.filter((city) => city.id !== id);
        await this.write(cities);
    }
}
export default new HistoryService();
