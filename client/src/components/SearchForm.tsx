import React, { useState, FormEvent } from 'react';
import { TextField, Button, Box } from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';

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
    <form onSubmit={handleSubmit}>
      <Box sx={{ display: 'flex', alignItems: 'flex-end', gap: 1, mb: 2 }}>
        <TextField
          fullWidth
          label="Enter city name"
          variant="outlined"
          value={searchInput}
          onChange={(e) => setSearchInput(e.target.value)}
          error={!!error}
          helperText={error}
          sx={{ 
            '& .MuiOutlinedInput-root': {
              borderRadius: 2,
            }
          }}
        />
        <Button 
          type="submit"
          variant="contained"
          color="primary"
          size="large"
          startIcon={<SearchIcon />}
          sx={{ 
            height: 55, 
            borderRadius: 2,
            px: 3,
            fontWeight: 'bold',
            boxShadow: '0 4px 10px rgba(58, 123, 213, 0.3)',
            '&:hover': {
              boxShadow: '0 6px 15px rgba(58, 123, 213, 0.4)',
            }
          }}
        >
          Search
        </Button>
      </Box>
    </form>
  );
};