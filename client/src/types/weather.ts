export interface WeatherData {
    city: string;
    date: string;
    icon: string;
    iconDescription: string;
    tempF: number;
    windSpeed: number;
    humidity: number;
  }
  
  export interface CityHistory {
    id: string;
    cityName: string;
    createdAt?: string;
    updatedAt?: string;
  }