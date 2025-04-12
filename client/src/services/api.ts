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