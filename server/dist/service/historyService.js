import { v4 as uuidv4 } from "uuid";
import pool from "../db/db.js";
class City {
    constructor(id, name) {
        this.id = id;
        this.name = name;
    }
}
// Fallback in-memory storage when database is not available
const inMemoryHistory = new Map();
class HistoryService {
    // Get cities for a specific session from database
    async getCities(sessionId) {
        if (!sessionId) {
            return [];
        }
        // Use in-memory storage if no database
        if (!pool) {
            return inMemoryHistory.get(sessionId) || [];
        }
        try {
            const result = await pool.query(`SELECT id, city_name, created_at 
         FROM search_history 
         WHERE session_id = $1 
         ORDER BY created_at DESC`, [sessionId]);
            return result.rows.map((row) => new City(row.id, row.city_name));
        }
        catch (error) {
            console.error("Error fetching cities from database:", error);
            return [];
        }
    }
    // Add city to a specific session's history in database
    async addCity(sessionId, cityName) {
        if (!sessionId) {
            throw new Error("Session ID is required");
        }
        if (!cityName) {
            throw new Error("City name is required");
        }
        const cityId = uuidv4();
        // Use in-memory storage if no database
        if (!pool) {
            const cities = inMemoryHistory.get(sessionId) || [];
            if (cities.find((c) => c.name.toLowerCase() === cityName.toLowerCase())) {
                console.log(`City "${cityName}" already exists in session ${sessionId}`);
                return null;
            }
            const newCity = new City(cityId, cityName);
            cities.push(newCity);
            inMemoryHistory.set(sessionId, cities);
            return newCity;
        }
        try {
            // Insert city, ignore if duplicate (session_id + city_name are unique)
            const result = await pool.query(`INSERT INTO search_history (id, session_id, city_name) 
         VALUES ($1, $2, $3) 
         ON CONFLICT (session_id, city_name) DO NOTHING
         RETURNING id, city_name`, [cityId, sessionId, cityName]);
            // If no rows returned, city already exists
            if (result.rows.length === 0) {
                console.log(`City "${cityName}" already exists in session ${sessionId}`);
                return null;
            }
            return new City(result.rows[0].id, result.rows[0].city_name);
        }
        catch (error) {
            console.error("Error adding city to database:", error);
            throw error;
        }
    }
    // Remove city from a specific session's history in database
    async removeCity(sessionId, id) {
        if (!sessionId) {
            throw new Error("Session ID is required");
        }
        // Use in-memory storage if no database
        if (!pool) {
            const cities = inMemoryHistory.get(sessionId) || [];
            inMemoryHistory.set(sessionId, cities.filter((c) => c.id !== id));
            return;
        }
        try {
            await pool.query(`DELETE FROM search_history 
         WHERE session_id = $1 AND id = $2`, [sessionId, id]);
        }
        catch (error) {
            console.error("Error removing city from database:", error);
            throw error;
        }
    }
    // Clear all history for a session
    async clearSession(sessionId) {
        // Use in-memory storage if no database
        if (!pool) {
            inMemoryHistory.delete(sessionId);
            return;
        }
        try {
            await pool.query(`DELETE FROM search_history WHERE session_id = $1`, [
                sessionId,
            ]);
        }
        catch (error) {
            console.error("Error clearing session from database:", error);
            throw error;
        }
    }
    // Get total number of active sessions (for debugging)
    async getActiveSessionsCount() {
        // Use in-memory storage if no database
        if (!pool) {
            return inMemoryHistory.size;
        }
        try {
            const result = await pool.query(`SELECT COUNT(DISTINCT session_id) as count FROM search_history`);
            return parseInt(result.rows[0].count);
        }
        catch (error) {
            console.error("Error getting active sessions count:", error);
            return 0;
        }
    }
}
export default new HistoryService();
