import React from 'react';
import { Card, CardContent, Typography, Box, useTheme } from '@mui/material';
import ThermostatIcon from '@mui/icons-material/Thermostat';
import AirIcon from '@mui/icons-material/Air';
import WaterDropIcon from '@mui/icons-material/WaterDrop';
import { WeatherData } from '../types/weather.types';

interface CurrentWeatherProps {
  currentWeather?: WeatherData | undefined;
}

export const CurrentWeather = ({ currentWeather }: CurrentWeatherProps) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  
  if (!currentWeather) {
    return (
      <Card elevation={3} sx={{ 
        p: 3, 
        textAlign: 'center', 
        height: '100%',
        minHeight: 200,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        bgcolor: theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.02)',
      }}>
        <CardContent>
          <Typography variant="h5" component="div" gutterBottom>
            Search for a city to see weather details
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Enter a city name above to get current weather conditions.
          </Typography>
        </CardContent>
      </Card>
    );
  }

  const { city, date, icon, iconDescription, tempF, windSpeed, humidity } = currentWeather;

  return (
    <Card elevation={3} sx={{ 
      overflow: 'visible', 
      position: 'relative',
    }}>
      <CardContent sx={{ p: 3 }}>
        <Box sx={{ display: 'flex', flexDirection: isMobile ? 'column' : 'row' }}>
          <Box sx={{ flex: 1 }}>
            <Box>
              <Typography variant="h4" component="div" sx={{ fontWeight: 600, mb: 0.5 }}>
                {city}
              </Typography>
              <Typography variant="subtitle1" color="text.secondary" sx={{ mb: 2 }}>
                {date}
              </Typography>
            </Box>
            
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2, mt: 2 }}>
              <Box sx={{ 
                display: 'flex', 
                alignItems: 'center',
                p: 1.5,
                bgcolor: theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.03)',
                borderRadius: 2,
                width: isMobile ? '100%' : 'calc(33.33% - 16px)'
              }}>
                <ThermostatIcon color="primary" sx={{ fontSize: 28, mr: 1 }} />
                <Box>
                  <Typography variant="body2" color="text.secondary">
                    Temperature
                  </Typography>
                  <Typography variant="h6">
                    {tempF}°F
                  </Typography>
                </Box>
              </Box>
              
              <Box sx={{ 
                display: 'flex', 
                alignItems: 'center',
                p: 1.5,
                bgcolor: theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.03)',
                borderRadius: 2,
                width: isMobile ? '100%' : 'calc(33.33% - 16px)'
              }}>
                <AirIcon color="primary" sx={{ fontSize: 28, mr: 1 }} />
                <Box>
                  <Typography variant="body2" color="text.secondary">
                    Wind
                  </Typography>
                  <Typography variant="h6">
                    {windSpeed} MPH
                  </Typography>
                </Box>
              </Box>
              
              <Box sx={{ 
                display: 'flex', 
                alignItems: 'center',
                p: 1.5,
                bgcolor: theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.03)',
                borderRadius: 2,
                width: isMobile ? '100%' : 'calc(33.33% - 16px)'
              }}>
                <WaterDropIcon color="primary" sx={{ fontSize: 28, mr: 1 }} />
                <Box>
                  <Typography variant="body2" color="text.secondary">
                    Humidity
                  </Typography>
                  <Typography variant="h6">
                    {humidity}%
                  </Typography>
                </Box>
              </Box>
            </Box>
          </Box>
          
          <Box sx={{ 
            display: 'flex', 
            flexDirection: 'column', 
            alignItems: 'center', 
            justifyContent: 'center',
            p: 2,
            minWidth: isMobile ? '100%' : '200px'
          }}>
            <Box sx={{ 
              bgcolor: theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.03)',
              borderRadius: '50%',
              p: 2,
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              width: 150,
              height: 150,
              justifyContent: 'center'
            }}>
              <img
                src={`https://openweathermap.org/img/w/${icon}.png`}
                alt={iconDescription}
                style={{ width: 80, height: 80 }}
              />
              <Typography variant="body1" textAlign="center">
                {iconDescription}
              </Typography>
            </Box>
          </Box>
        </Box>
      </CardContent>
    </Card>
  );
};

// Don't forget to import useMediaQuery
import { useMediaQuery } from '@mui/material';