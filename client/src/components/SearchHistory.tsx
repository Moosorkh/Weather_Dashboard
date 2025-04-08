import React from 'react';
import { Paper, Typography, List, ListItem, ListItemText, IconButton, Divider, Box } from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import HistoryIcon from '@mui/icons-material/History';
import { CityHistory } from '../types/weather';

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
  if (!historyList.length) {
    return (
      <Paper elevation={3} sx={{ p: 2 }}>
        <Typography variant="subtitle1" textAlign="center" color="text.secondary">
          No search history
        </Typography>
      </Paper>
    );
  }

  return (
    <Paper elevation={3} sx={{ p: 0 }}>
      <Box sx={{ p: 2, bgcolor: 'primary.main', color: 'white' }}>
        <Typography variant="h6">
          <HistoryIcon sx={{ mr: 1, verticalAlign: 'middle' }} />
          Search History
        </Typography>
      </Box>
      <List sx={{ width: '100%', maxHeight: 300, overflow: 'auto' }}>
        {historyList.map((city, index) => (
          <Box key={city.id}>
            {index > 0 && <Divider />}
            <ListItem
              secondaryAction={
                <IconButton 
                  edge="end" 
                  aria-label="delete"
                  onClick={() => onCityDelete(city.id, city.cityName)}
                >
                  <DeleteIcon color="error" />
                </IconButton>
              }
            >
              <ListItemText 
                primary={city.cityName}
                sx={{ cursor: 'pointer' }}
                onClick={() => onCitySelect(city.cityName)}
              />
            </ListItem>
          </Box>
        ))}
      </List>
    </Paper>
  );
};