import React from 'react';
import { Card, CardContent, Typography, Box } from '@mui/material';
import ThermostatIcon from '@mui/icons-material/Thermostat';
import AirIcon from '@mui/icons-material/Air';
import WaterDropIcon from '@mui/icons-material/WaterDrop';
import { WeatherData } from '../types/weather';

interface ForecastCardProps {
  forecast: WeatherData;
}

export const ForecastCard = ({ forecast }: ForecastCardProps) => {
  const { date, icon, iconDescription, tempF, windSpeed, humidity } = forecast;

  return (
    <Card sx={{ minWidth: 200, height: '100%', display: 'flex', flexDirection: 'column' }}>
      <CardContent>
        <Typography variant="h6" component="div" gutterBottom>
          {date}
        </Typography>
        
        <Box sx={{ textAlign: 'center', my: 1 }}>
          <img
            src={`https://openweathermap.org/img/w/${icon}.png`}
            alt={iconDescription}
            style={{ width: 50, height: 50 }}
          />
          <Typography variant="body2" color="text.secondary">
            {iconDescription}
          </Typography>
        </Box>
        
        <Box sx={{ mt: 2 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
            <ThermostatIcon fontSize="small" sx={{ mr: 1 }} />
            <Typography variant="body2">
              {tempF}°F
            </Typography>
          </Box>
          
          <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
            <AirIcon fontSize="small" sx={{ mr: 1 }} />
            <Typography variant="body2">
              {windSpeed} MPH
            </Typography>
          </Box>
          
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <WaterDropIcon fontSize="small" sx={{ mr: 1 }} />
            <Typography variant="body2">
              {humidity}%
            </Typography>
          </Box>
        </Box>
      </CardContent>
    </Card>
  );
};