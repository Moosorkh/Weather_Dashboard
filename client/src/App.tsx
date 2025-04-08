import React, { useState, useEffect } from 'react';
import { 
  Container, 
  CssBaseline, 
  AppBar, 
  Toolbar, 
  Typography, 
  Box, 
  ThemeProvider, 
  createTheme, 
  IconButton,
  Stack
} from '@mui/material';
import CloudIcon from '@mui/icons-material/Cloud';
import Brightness4Icon from '@mui/icons-material/Brightness4';
import Brightness7Icon from '@mui/icons-material/Brightness7';
import { SearchForm } from './components/SearchForm';
import { CurrentWeather } from './components/CurrentWeather';
import { Forecast } from './components/Forecast';
import { SearchHistory } from './components/SearchHistory';
import { weatherService } from './services/api';
import { WeatherData, CityHistory } from './types/weather';

function App() {
  const [darkMode, setDarkMode] = useState(localStorage.getItem('darkMode') === 'true');
  const [currentWeather, setCurrentWeather] = useState<WeatherData | undefined>();
  const [forecastData, setForecastData] = useState<WeatherData[]>([]);
  const [searchHistory, setSearchHistory] = useState<CityHistory[]>([]);

  // Create theme based on dark mode
  const theme = createTheme({
    palette: {
      mode: darkMode ? 'dark' : 'light',
      primary: {
        main: '#3a7bd5',
      },
      secondary: {
        main: '#1bbc9b',
      },
    },
  });

  const toggleDarkMode = () => {
    const newMode = !darkMode;
    setDarkMode(newMode);
    localStorage.setItem('darkMode', String(newMode));
  };

  const fetchWeather = async (cityName: string) => {
    try {
      const data = await weatherService.getWeatherForCity(cityName);
      if (data && data.length > 0) {
        setCurrentWeather(data[0]);
        setForecastData(data.slice(1));
        getSearchHistory();
      }
    } catch (error) {
      console.error('Error fetching the weather data:', error);
      alert('City not found. Please try again.');
      setForecastData([]);
    }
  };

  const getSearchHistory = async () => {
    try {
      const history = await weatherService.getSearchHistory();
      setSearchHistory(history);
    } catch (error) {
      console.error('Error fetching search history:', error);
    }
  };

  const handleCityDelete = async (id: string, cityName: string) => {
    try {
      await weatherService.deleteCity(id);
      
      // Clear current weather display if it matches the deleted city
      if (currentWeather?.city === cityName) {
        setCurrentWeather(undefined);
        setForecastData([]);
      }
      
      getSearchHistory();
    } catch (error) {
      console.error('Error deleting city:', error);
    }
  };

  useEffect(() => {
    // Load search history when component mounts
    getSearchHistory();
  }, []);

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Box sx={{ flexGrow: 1, minHeight: '100vh', bgcolor: 'background.default' }}>
        <AppBar position="static">
          <Toolbar>
            <CloudIcon sx={{ mr: 2 }} />
            <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
              Weather Dashboard
            </Typography>
            <IconButton onClick={toggleDarkMode} color="inherit">
              {darkMode ? <Brightness7Icon /> : <Brightness4Icon />}
            </IconButton>
          </Toolbar>
        </AppBar>
        
        <Container maxWidth="xl" sx={{ mt: 4, mb: 4 }}>
          <Stack 
            direction={{ xs: 'column', md: 'row' }} 
            spacing={3} 
            sx={{ width: '100%' }}
          >
            <Box sx={{ width: { xs: '100%', md: '30%', lg: '25%' } }}>
              <Typography variant="h5" gutterBottom>
                Search for a City
              </Typography>
              <SearchForm onSearch={fetchWeather} />
              <SearchHistory 
                historyList={searchHistory} 
                onCitySelect={fetchWeather}
                onCityDelete={handleCityDelete}
              />
            </Box>
            
            <Box sx={{ width: { xs: '100%', md: '70%', lg: '75%' } }}>
              <CurrentWeather currentWeather={currentWeather} />
              <Forecast forecastData={forecastData} />
            </Box>
          </Stack>
        </Container>
      </Box>
    </ThemeProvider>
  );
}

export default App;