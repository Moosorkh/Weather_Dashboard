import axios from 'axios';
import { WeatherData, CityHistory } from '../types/weather';

const API_BASE_URL = '/api/weather';

export const weatherService = {
  async getWeatherForCity(cityName: string): Promise<WeatherData[]> {
    try {
      const response = await axios.post(API_BASE_URL, { cityName });
      console.log("API response:", response.data);
      return response.data;
    } catch (error) {
      console.error('Error fetching weather data:', error);
      throw error;
    }
  },

  async getSearchHistory(): Promise<CityHistory[]> {
    try {
      const response = await axios.get(`${API_BASE_URL}/history`);
      return response.data;
    } catch (error) {
      console.error('Error fetching search history:', error);
      throw error;
    }
  },

  async deleteCity(id: string): Promise<void> {
    try {
      await axios.delete(`${API_BASE_URL}/history/${id}`);
    } catch (error) {
      console.error('Error deleting city from history:', error);
      throw error;
    }
  }
};