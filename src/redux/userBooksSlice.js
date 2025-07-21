import { createSlice } from '@reduxjs/toolkit';

// Helper function to safely get data from localStorage
const getInitialLists = () => {
  try {
    const storedReadBooks = localStorage.getItem('readBooks');
    const storedWantToReadBooks = localStorage.getItem('wantToReadBooks');
    return {
      readBooks: storedReadBooks ? JSON.parse(storedReadBooks) : [],
      wantToReadBooks: storedWantToReadBooks ? JSON.parse(storedWantToReadBooks) : [],
    };
  } catch (error) {
    console.error("Error loading lists from localStorage:", error);
    return { readBooks: [], wantToReadBooks: [] };
  }
};

const userBooksSlice = createSlice({
  name: 'userBooks',
  initialState: getInitialLists(), // Load initial state from localStorage
  reducers: {
    addBookToList: (state, action) => {
      const { book, listType } = action.payload; // book object, 'read' or 'wantToRead'

      const bookToSave = {
        id: book.id, // Google Books ID
        title: book.volumeInfo.title || 'Unknown Title',
        authors: book.volumeInfo.authors || ['Unknown Author'],
        thumbnail: book.volumeInfo.imageLinks?.thumbnail || '', // Store the URL directly
        previewLink: book.volumeInfo.previewLink || '',
      };

      // Logic for exclusive toggling:
      if (listType === 'read') {
        // If already in read list, remove it (toggle off)
        if (state.readBooks.some(b => b.id === book.id)) {
          state.readBooks = state.readBooks.filter(b => b.id !== book.id);
        } else {
          // Add to read list
          state.readBooks.push(bookToSave);
          // Remove from wantToRead list if present
          state.wantToReadBooks = state.wantToReadBooks.filter(b => b.id !== book.id);
        }
      } else if (listType === 'wantToRead') {
        // If already in wantToRead list, remove it (toggle off)
        if (state.wantToReadBooks.some(b => b.id === book.id)) {
          state.wantToReadBooks = state.wantToReadBooks.filter(b => b.id !== book.id);
        } else {
          // Add to wantToRead list
          state.wantToReadBooks.push(bookToSave);
          // Remove from read list if present
          state.readBooks = state.readBooks.filter(b => b.id !== book.id);
        }
      }
    },
    removeBookFromList: (state, action) => {
      const { bookId, listType } = action.payload;
      if (listType === 'read') {
        state.readBooks = state.readBooks.filter(book => book.id !== bookId);
      } else if (listType === 'wantToRead') {
        state.wantToReadBooks = state.wantToReadBooks.filter(book => book.id !== bookId);
      }
    },
  },
});

export const { addBookToList, removeBookFromList } = userBooksSlice.actions;
export default userBooksSlice.reducer;