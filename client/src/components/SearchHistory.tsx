import React from 'react';
import { Typography, Box, List, ListItem, ListItemText, IconButton, Divider, Paper, useTheme } from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import HistoryIcon from '@mui/icons-material/History';
import { CityHistory } from '../types/weather.types';

interface SearchHistoryProps {
  historyList: CityHistory[];
  onCitySelect: (cityName: string) => void;
  onCityDelete: (id: string, cityName: string) => void;
}

export const SearchHistory = ({ 
  historyList, 
  onCitySelect, 
  onCityDelete 
}: SearchHistoryProps) => {
  const theme = useTheme();
  
  // Helper function to safely get the city name
  const getCityName = (city: CityHistory): string => {
    return city.cityName || city.name || "";
  };

  if (!historyList.length) {
    return (
      <Box sx={{ mt: 3 }}>
        <Typography variant="h6" sx={{ 
          display: 'flex', 
          alignItems: 'center',
          mb: 2, 
          fontWeight: 500
        }}>
          <HistoryIcon sx={{ mr: 1 }} /> Search History
        </Typography>
        <Paper elevation={1} sx={{ 
          p: 3, 
          textAlign: 'center',
          bgcolor: theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.03)',
        }}>
          <Typography variant="body2" color="text.secondary">
            No search history yet
          </Typography>
        </Paper>
      </Box>
    );
  }

  return (
    <Box sx={{ mt: 3 }}>
      <Typography variant="h6" sx={{ 
        display: 'flex', 
        alignItems: 'center',
        mb: 2, 
        fontWeight: 500
      }}>
        <HistoryIcon sx={{ mr: 1 }} /> Search History
      </Typography>
      
      <Paper elevation={1} sx={{ 
        borderRadius: 2,
        overflow: 'hidden',
      }}>
        <List disablePadding sx={{ 
          width: '100%', 
          maxHeight: 300, 
          overflow: 'auto',
        }}>
          {historyList.map((city, index) => {
            const cityName = getCityName(city);
            return (
              <React.Fragment key={city.id || index}>
                {index > 0 && <Divider />}
                <ListItem
                  disablePadding
                  secondaryAction={
                    <IconButton 
                      edge="end" 
                      aria-label="delete"
                      onClick={() => onCityDelete(city.id, cityName)}
                      sx={{ 
                        color: theme.palette.error.main,
                        '&:hover': {
                          bgcolor: theme.palette.mode === 'dark' 
                            ? 'rgba(244, 67, 54, 0.1)' 
                            : 'rgba(244, 67, 54, 0.08)',
                        }
                      }}
                    >
                      <DeleteIcon />
                    </IconButton>
                  }
                  sx={{ 
                    px: 2,
                    py: 1, 
                    '&:hover': {
                      bgcolor: theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.04)',
                    }
                  }}
                >
                  <ListItemText 
                    primary={cityName}
                    primaryTypographyProps={{
                      sx: { fontWeight: 500 }
                    }}
                    sx={{ 
                      cursor: 'pointer',
                      '&:hover': {
                        color: theme.palette.primary.main,
                      }
                    }}
                    onClick={() => onCitySelect(cityName)}
                  />
                </ListItem>
              </React.Fragment>
            );
          })}
        </List>
      </Paper>
    </Box>
  );
};