import { useState, FormEvent } from 'react';
import { TextField, Button, Box, Paper } from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import React from 'react';

interface SearchFormProps {
  onSearch: (city: string) => void;
}

export const SearchForm = ({ onSearch }: SearchFormProps) => {
  const [searchInput, setSearchInput] = useState('');
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    
    // Validate input
    const search = searchInput.trim();
    if (!search) {
      setError('Please enter a city name');
      return;
    }

    const regex = /^[a-zA-Z\s]*$/;
    if (!regex.test(search)) {
      setError('Please enter a valid city name (letters only)');
      return;
    }

    setError(null);
    onSearch(search);
    setSearchInput('');
  };

  return (
    <Paper elevation={3} sx={{ p: 3, mb: 3 }}>
      <form onSubmit={handleSubmit}>
        <Box sx={{ display: 'flex', alignItems: 'flex-end' }}>
          <TextField
            fullWidth
            label="Enter city name"
            variant="outlined"
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            error={!!error}
            helperText={error}
            sx={{ mr: 1 }}
          />
          <Button 
            type="submit"
            variant="contained"
            color="primary"
            startIcon={<SearchIcon />}
          >
            Search
          </Button>
        </Box>
      </form>
    </Paper>
  );
};