import { IconButton, Tooltip } from '@mui/material';
import Brightness4Icon from '@mui/icons-material/Brightness4';
import Brightness7Icon from '@mui/icons-material/Brightness7';
import React from 'react';

interface DarkModeToggleProps {
  isDarkMode: boolean;
  toggleDarkMode: () => void;
}

export const DarkModeToggle = ({ isDarkMode, toggleDarkMode }: DarkModeToggleProps) => {
  return (
    <Tooltip title={isDarkMode ? "Switch to Light Mode" : "Switch to Dark Mode"}>
      <IconButton 
        onClick={toggleDarkMode} 
        color="inherit"
      >
        {isDarkMode ? <Brightness7Icon /> : <Brightness4Icon />}
      </IconButton>
    </Tooltip>
  );
};