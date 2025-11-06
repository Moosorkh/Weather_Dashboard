import { v4 as uuidv4 } from "uuid";
class City {
    constructor(name) {
        this.id = uuidv4();
        this.name = name;
    }
}
// In-memory storage for session-based history
// Key: sessionId, Value: City[]
const sessionHistory = new Map();
class HistoryService {
    // Get cities for a specific session
    async getCities(sessionId) {
        if (!sessionId) {
            return [];
        }
        return sessionHistory.get(sessionId) || [];
    }
    // Add city to a specific session's history
    async addCity(sessionId, cityName) {
        if (!sessionId) {
            throw new Error("Session ID is required");
        }
        if (!cityName) {
            throw new Error("City name is required");
        }
        const newCity = new City(cityName);
        const cities = sessionHistory.get(sessionId) || [];
        // Check if the city already exists in this session's history
        if (cities.find((city) => city.name.toLowerCase() === cityName.toLowerCase())) {
            console.log(`City "${cityName}" already exists in session ${sessionId}`);
            return null;
        }
        cities.push(newCity);
        sessionHistory.set(sessionId, cities);
        return newCity;
    }
    // Remove city from a specific session's history
    async removeCity(sessionId, id) {
        if (!sessionId) {
            throw new Error("Session ID is required");
        }
        let cities = sessionHistory.get(sessionId) || [];
        cities = cities.filter((city) => city.id !== id);
        sessionHistory.set(sessionId, cities);
    }
    // Optional: Clear all history for a session
    async clearSession(sessionId) {
        sessionHistory.delete(sessionId);
    }
    // Optional: Get total number of active sessions (for debugging)
    getActiveSessionsCount() {
        return sessionHistory.size;
    }
}
export default new HistoryService();
