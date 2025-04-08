import { Typography, Box, Paper } from '@mui/material';
import ThermostatIcon from '@mui/icons-material/Thermostat';
import AirIcon from '@mui/icons-material/Air';
import WaterDropIcon from '@mui/icons-material/WaterDrop';
import { WeatherData } from '../types/weather';
import React from 'react';

interface CurrentWeatherProps {
  currentWeather?: WeatherData | undefined;
}

export const CurrentWeather = ({ currentWeather }: CurrentWeatherProps) => {
  if (!currentWeather) {
    return (
      <Paper elevation={3} sx={{ p: 3, textAlign: 'center', mb: 3 }}>
        <Typography variant="h5" component="div" gutterBottom>
          Search for a city!
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Enter a city name above to get current weather conditions.
        </Typography>
      </Paper>
    );
  }

  const { city, date, icon, iconDescription, tempF, windSpeed, humidity } = currentWeather;

  return (
    <Paper elevation={3} sx={{ p: 3, mb: 3 }}>
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
        <Box sx={{ flex: 1 }}>
          <Typography variant="h4" component="div">
            {city}
          </Typography>
          <Typography variant="subtitle1" color="text.secondary">
            {date}
          </Typography>
        </Box>
        <Box>
          <img
            src={`https://openweathermap.org/img/w/${icon}.png`}
            alt={iconDescription}
            style={{ width: 70, height: 70 }}
          />
          <Typography variant="body2" textAlign="center">
            {iconDescription}
          </Typography>
        </Box>
      </Box>
      
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
        <Box sx={{ display: 'flex', alignItems: 'center' }}>
          <ThermostatIcon color="primary" sx={{ mr: 1 }} />
          <Typography variant="body1">
            Temperature: {tempF}°F
          </Typography>
        </Box>
        
        <Box sx={{ display: 'flex', alignItems: 'center' }}>
          <AirIcon color="primary" sx={{ mr: 1 }} />
          <Typography variant="body1">
            Wind: {windSpeed} MPH
          </Typography>
        </Box>
        
        <Box sx={{ display: 'flex', alignItems: 'center' }}>
          <WaterDropIcon color="primary" sx={{ mr: 1 }} />
          <Typography variant="body1">
            Humidity: {humidity}%
          </Typography>
        </Box>
      </Box>
    </Paper>
  );
};