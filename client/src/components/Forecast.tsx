import React from 'react';
import { Typography, Box, Card, CardContent, useTheme, useMediaQuery } from '@mui/material';
import ThermostatIcon from '@mui/icons-material/Thermostat';
import AirIcon from '@mui/icons-material/Air';
import WaterDropIcon from '@mui/icons-material/WaterDrop';
import { WeatherData } from '../types/weather';

interface ForecastProps {
  forecastData: WeatherData[];
}

export const Forecast = ({ forecastData }: ForecastProps) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const isTablet = useMediaQuery(theme.breakpoints.down('md'));

  if (!forecastData.length) return null;

  return (
    <Box>
      <Typography variant="h5" component="h2" gutterBottom sx={{ 
        fontWeight: 600, 
        mb: 3,
        borderBottom: `1px solid ${theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)'}`,
        pb: 1
      }}>
        5-Day Forecast
      </Typography>
      
      <Box sx={{ 
        display: 'flex', 
        flexWrap: 'wrap', 
        gap: 2,
        justifyContent: 'space-between'
      }}>
        {forecastData.map((forecast, index) => (
          <Box 
            key={index} 
            sx={{ 
              flexBasis: isMobile ? '100%' : isTablet ? 'calc(50% - 16px)' : 'calc(20% - 16px)',
              minWidth: isMobile ? '100%' : isTablet ? 'calc(50% - 16px)' : 'calc(20% - 16px)',
              mb: 2
            }}
          >
            <Card elevation={2} sx={{ 
              height: '100%', 
              transition: 'transform 0.2s, box-shadow 0.2s',
              '&:hover': {
                transform: 'translateY(-5px)',
                boxShadow: '0 8px 20px rgba(0,0,0,0.1)'
              }
            }}>
              <CardContent sx={{ p: 2 }}>
                <Box sx={{ 
                  display: 'flex', 
                  alignItems: 'center', 
                  justifyContent: 'space-between',
                  mb: 2
                }}>
                  <Typography variant="h6" component="div" sx={{ fontWeight: 500 }}>
                    {forecast.date}
                  </Typography>
                  <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    <img
                      src={`https://openweathermap.org/img/w/${forecast.icon}.png`}
                      alt={forecast.iconDescription}
                      style={{ width: 40, height: 40 }}
                    />
                  </Box>
                </Box>
                
                <Typography variant="body2" color="text.secondary" sx={{ mb: 2, textAlign: 'center' }}>
                  {forecast.iconDescription}
                </Typography>
                
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                  <Box sx={{ 
                    display: 'flex', 
                    alignItems: 'center',
                    p: 1,
                    bgcolor: theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.03)',
                    borderRadius: 1
                  }}>
                    <ThermostatIcon fontSize="small" sx={{ mr: 1, color: theme.palette.primary.main }} />
                    <Typography variant="body2">
                      {forecast.tempF}°F
                    </Typography>
                  </Box>
                  
                  <Box sx={{ 
                    display: 'flex', 
                    alignItems: 'center',
                    p: 1,
                    bgcolor: theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.03)',
                    borderRadius: 1
                  }}>
                    <AirIcon fontSize="small" sx={{ mr: 1, color: theme.palette.primary.main }} />
                    <Typography variant="body2">
                      {forecast.windSpeed} MPH
                    </Typography>
                  </Box>
                  
                  <Box sx={{ 
                    display: 'flex', 
                    alignItems: 'center',
                    p: 1,
                    bgcolor: theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.03)',
                    borderRadius: 1
                  }}>
                    <WaterDropIcon fontSize="small" sx={{ mr: 1, color: theme.palette.primary.main }} />
                    <Typography variant="body2">
                      {forecast.humidity}%
                    </Typography>
                  </Box>
                </Box>
              </CardContent>
            </Card>
          </Box>
        ))}
      </Box>
    </Box>
  );
};