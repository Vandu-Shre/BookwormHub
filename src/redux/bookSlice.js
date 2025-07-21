import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';

// Ensure your API key is correctly loaded from .env.local
const GOOGLE_BOOKS_API_KEY = import.meta.env.VITE_GOOGLE_BOOKS_API_KEY || '';
const BASE_URL = 'https://www.googleapis.com/books/v1/volumes';

// Async Thunk to fetch books from Google Books API
export const fetchBooks = createAsyncThunk(
  'books/fetchBooks',
  async (query, { rejectWithValue }) => {
    try {
      if (!query.trim()) {
        // Return a specific empty state if query is empty, to distinguish from no results found
        return { items: [], totalItems: 0 };
      }

      // Encode the query to handle spaces and special characters
      const encodedQuery = encodeURIComponent(query);

      // Construct the API URL with language restriction
      const response = await fetch(
        `${BASE_URL}?q=${encodedQuery}&maxResults=20&langRestrict=en&key=${GOOGLE_BOOKS_API_KEY}`
      );

      if (!response.ok) {
        // Attempt to parse error message from response body if available
        const errorData = await response.json();
        throw new Error(errorData.error?.message || 'Failed to fetch books. Status: ' + response.status);
      }

      const data = await response.json();
      // Google Books API returns 'items' and 'totalItems'
      return data;
    } catch (error) {
      console.error('Error fetching books:', error);
      return rejectWithValue(error.message);
    }
  }
);

const bookSlice = createSlice({
  name: 'books',
  initialState: {
    items: [],
    searchQuery: '', // Keep track of the current search query
    status: 'idle', // 'idle' | 'loading' | 'succeeded' | 'failed'
    error: null,
  },
  reducers: {
    setSearchQuery: (state, action) => {
      state.searchQuery = action.payload;
      // When query changes, reset status to idle if not currently loading
      if (state.status !== 'loading') {
        state.status = 'idle';
      }
      state.items = []; // Clear previous results when new search query is set
    },
    clearBooks: (state) => {
      state.items = [];
      state.searchQuery = '';
      state.status = 'idle';
      state.error = null;
    }
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchBooks.pending, (state) => {
        state.status = 'loading';
        state.error = null;
      })
      .addCase(fetchBooks.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.items = action.payload.items || []; // Ensure it's an array
      })
      .addCase(fetchBooks.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload || 'An unknown error occurred.';
        state.items = []; // Clear items on error
      });
  },
});

export const { setSearchQuery, clearBooks } = bookSlice.actions;

export default bookSlice.reducer;