import React from 'react';
import { useSelector } from 'react-redux';
import BookCard from '../BookCard/BookCard';
// Styles are now in App.scss for .book-list
// import './BookList.scss'; // REMOVE THIS IMPORT if you moved styles to App.scss

const BookList = () => {
  const { items: books, status, error, searchQuery } = useSelector((state) => state.books);

  if (status === 'loading') {
    return <div className="book-list-status">Loading books...</div>;
  }

  if (error) {
    return <div className="book-list-status error">Error: {error}</div>;
  }

  // Show "No books found" only if a search was performed and yielded no results
  if (status === 'succeeded' && books.length === 0 && searchQuery) {
    return <div className="book-list-status">No books found for "{searchQuery}". Try a different search!</div>;
  }

  // Only render the grid if there are books to display
  if (books.length > 0) {
    return (
      <div className="book-list">
        {books.map((book) => (
          <BookCard key={book.id} book={book} />
        ))}
      </div>
    );
  }

  // Default state when no search has been performed or results cleared
  return null; // HeroSection handles the initial empty state
};

export default BookList;