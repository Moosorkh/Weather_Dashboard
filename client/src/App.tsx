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
  Paper,
  useMediaQuery
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
  const isMobile = useMediaQuery('(max-width:600px)');

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
      background: {
        default: darkMode ? '#121212' : '#f5f5f5',
        paper: darkMode ? '#1e1e1e' : '#ffffff',
      },
    },
    typography: {
      fontFamily: '"Roboto", "Helvetica", "Arial", sans-serif',
      h5: {
        fontWeight: 600,
      },
      h6: {
        fontWeight: 500,
      },
    },
    shape: {
      borderRadius: 8,
    },
    components: {
      MuiPaper: {
        styleOverrides: {
          root: {
            boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)',
          },
        },
      },
      MuiButton: {
        styleOverrides: {
          root: {
            textTransform: 'none',
            fontWeight: 500,
          },
        },
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
      <Box sx={{ 
        flexGrow: 1, 
        minHeight: '100vh', 
        bgcolor: 'background.default',
        display: 'flex',
        flexDirection: 'column'
      }}>
        <AppBar position="static" elevation={4} sx={{ 
          background: darkMode 
            ? 'linear-gradient(90deg, #3a7bd5 0%, #1bbc9b 100%)' 
            : 'linear-gradient(90deg, #2196f3 0%, #3f51b5 100%)' 
        }}>
          <Toolbar>
            <CloudIcon sx={{ mr: 2, fontSize: 28 }} />
            <Typography variant="h5" component="div" sx={{ flexGrow: 1, fontWeight: 600 }}>
              Weather Dashboard
            </Typography>
            <IconButton onClick={toggleDarkMode} color="inherit" sx={{ 
              bgcolor: 'rgba(255, 255, 255, 0.1)',
              '&:hover': {
                bgcolor: 'rgba(255, 255, 255, 0.2)',
              }
            }}>
              {darkMode ? <Brightness7Icon /> : <Brightness4Icon />}
            </IconButton>
          </Toolbar>
        </AppBar>
        
        <Container maxWidth="xl" sx={{ mt: 4, mb: 4, flexGrow: 1 }}>
          <Box sx={{ display: 'flex', flexDirection: isMobile ? 'column' : 'row', gap: 3 }}>
            <Paper 
              elevation={3} 
              sx={{ 
                p: 3, 
                width: isMobile ? '100%' : '25%', 
                minWidth: isMobile ? 'auto' : '300px',
                height: 'fit-content'
              }}
            >
              <Typography variant="h5" gutterBottom sx={{ mb: 2 }}>
                Search for a City
              </Typography>
              <SearchForm onSearch={fetchWeather} />
              <SearchHistory 
                historyList={searchHistory} 
                onCitySelect={fetchWeather}
                onCityDelete={handleCityDelete}
              />
            </Paper>
            
            <Box sx={{ width: isMobile ? '100%' : '75%', display: 'flex', flexDirection: 'column', gap: 3 }}>
              <CurrentWeather currentWeather={currentWeather} />
              <Forecast forecastData={forecastData} />
            </Box>
          </Box>
        </Container>
      </Box>
    </ThemeProvider>
  );
}

export default App;