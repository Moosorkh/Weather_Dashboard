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
    name?: string;       // Include this field for backward compatibility
    cityName?: string;   // Include this field for backward compatibility
    createdAt?: string;
    updatedAt?: string;
  }