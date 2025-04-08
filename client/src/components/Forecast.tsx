import React from 'react';
import { Typography, Box, Stack } from '@mui/material';
import { ForecastCard } from './ForecastCard';
import { WeatherData } from '../types/weather';

interface ForecastProps {
  forecastData: WeatherData[];
}

export const Forecast = ({ forecastData }: ForecastProps) => {
  if (!forecastData.length) return null;

  return (
    <Box sx={{ mt: 4 }}>
      <Typography variant="h5" component="h2" gutterBottom>
        5-Day Forecast
      </Typography>
      <Stack 
        direction={{ xs: 'column', sm: 'row' }} 
        spacing={2} 
        sx={{ 
          flexWrap: 'wrap', 
          justifyContent: 'space-between'
        }}
      >
        {forecastData.map((forecast, index) => (
          <Box 
            key={index} 
            sx={{ 
              width: { xs: '100%', sm: '48%', md: '31%', lg: '19%' },
              mb: 2 
            }}
          >
            <ForecastCard forecast={forecast} />
          </Box>
        ))}
      </Stack>
    </Box>
  );
};