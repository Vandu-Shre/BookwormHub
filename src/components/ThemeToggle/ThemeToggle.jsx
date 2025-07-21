// src/components/ThemeToggle.jsx
import React from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { toggleTheme } from '../../redux/themeSlice'; // Import our action
import './ThemeToggle.scss'; // We'll create this file next

const ThemeToggle = () => {
  const dispatch = useDispatch();
  const themeMode = useSelector((state) => state.theme.mode);

  const handleToggle = () => {
    dispatch(toggleTheme()); // Dispatch the toggleTheme action
  };

  return (
    <button
      className="theme-toggle"
      onClick={handleToggle}
      aria-label={`Switch to ${themeMode === 'light' ? 'dark' : 'light'} mode`}
    >
      {themeMode === 'light' ? '🌙' : '☀️'}
    </button>
  );
};

export default ThemeToggle;