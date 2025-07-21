import { configureStore } from '@reduxjs/toolkit';
import bookReducer from './bookSlice';
import themeReducer from './themeSlice';
import userBooksReducer from './userBooksSlice';

export const store = configureStore({
  reducer: {
    books: bookReducer,
    theme: themeReducer,
    userBooks: userBooksReducer,
  },
});

// Listener for state changes to save userBooks to localStorage
store.subscribe(() => {
  const { userBooks } = store.getState();
  try {
    localStorage.setItem('readBooks', JSON.stringify(userBooks.readBooks));
    localStorage.setItem('wantToReadBooks', JSON.stringify(userBooks.wantToReadBooks));
  } catch (error) {
    console.error("Error saving to localStorage:", error);
    // Handle cases where localStorage might be full or unavailable
  }
});