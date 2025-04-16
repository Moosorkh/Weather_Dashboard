import axios from 'axios';
import { WeatherData, CityHistory } from '../types/weather.types';

// Get the API base URL from environment
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || '/api';

// Create axios instance with proper configuration
const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json'
  }
});

export const weatherService = {
  async getWeatherForCity(cityName: string): Promise<WeatherData[]> {
    try {
      console.log(`Sending request to: ${API_BASE_URL}/weather`);
      const response = await apiClient.post('/weather', { cityName });
      
      // Handle HTML responses (which indicate routing errors)
      if (typeof response.data === 'string' && response.data.includes('<!DOCTYPE html>')) {
        console.error('Received HTML instead of JSON - API endpoint misconfiguration');
        return [];
      }
      
      // Ensure we always return an array
      if (Array.isArray(response.data)) {
        return response.data;
      } else {
        console.error('Weather API did not return an array:', response.data);
        return [];
      }
    } catch (error) {
      console.error('Error fetching weather data:', error);
      return []; // Return empty array instead of throwing
    }
  },

  async getSearchHistory(): Promise<CityHistory[]> {
    try {
      const response = await apiClient.get('/cities');
      
      // Ensure we're working with an array
      if (!Array.isArray(response.data)) {
        return [];
      }
      
      return response.data.map((city: any) => ({
        id: city.id || '',
        name: city.name || '',
        cityName: city.name || '', // For backward compatibility
        createdAt: city.createdAt || new Date().toISOString(),
        updatedAt: city.updatedAt || new Date().toISOString()
      }));
    } catch (error) {
      console.error('Error fetching search history:', error);
      return []; // Return empty array instead of throwing
    }
  },

  async deleteCity(id: string): Promise<boolean> {
    try {
      await apiClient.delete(`/cities/${id}`);
      return true;
    } catch (error) {
      console.error('Error deleting city from history:', error);
      return false; // Return false instead of throwing
    }
  }
};