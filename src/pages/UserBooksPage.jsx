// src/pages/UserBooksPage.jsx
import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { motion } from 'framer-motion';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faTrashAlt } from '@fortawesome/free-solid-svg-icons';
import BookCard from '../components/BookCard/BookCard'
import './UserBooksPage.scss';

const UserBooksPage = () => {
    const [savedBooks, setSavedBooks] = useState([]);
    const [activeList, setActiveList] = useState('all-books'); // 'all-books', 'read', 'want-to-read', 'currently-reading'
    const [sortCriterion, setSortCriterion] = useState('date-added-desc'); // e.g., 'title-asc', 'author-desc', 'date-added-desc'

    // Function to load and normalize saved books
    const loadSavedBooks = useCallback(() => {
        const storedBooks = JSON.parse(localStorage.getItem('savedBooks')) || [];
        // Normalize existing books: add dateAdded and status if missing
        const normalizedBooks = storedBooks.map(book => ({
            ...book,
            dateAdded: book.dateAdded || new Date().toISOString(), // Add date if missing (e.g., for old saved books)
            status: book.status || 'want-to-read', // Add default status if missing
        }));
        setSavedBooks(normalizedBooks);
        localStorage.setItem('savedBooks', JSON.stringify(normalizedBooks)); // Update localStorage with normalized data
    }, []);

    useEffect(() => {
        loadSavedBooks();
        // Listen for changes in localStorage (e.g., from BookCard component)
        const handleStorageChange = (e) => {
            if (e.key === 'savedBooks') {
                loadSavedBooks();
            }
        };
        window.addEventListener('storage', handleStorageChange);
        return () => window.removeEventListener('storage', handleStorageChange);
    }, [loadSavedBooks]);

    const handleDelete = (bookId) => {
        let updatedBooks = savedBooks.filter(book => book.id !== bookId);
        setSavedBooks(updatedBooks);
        localStorage.setItem('savedBooks', JSON.stringify(updatedBooks));
    };

    // Memoized sorted and filtered books
    const filteredAndSortedBooks = useMemo(() => {
        let booksToDisplay = savedBooks;

        // 1. Filter based on activeList
        if (activeList !== 'all-books') {
            booksToDisplay = booksToDisplay.filter(book => book.status === activeList);
        }

        // 2. Sort based on sortCriterion
        return [...booksToDisplay].sort((a, b) => {
            const getSortValue = (book, criterion) => {
                switch (criterion) {
                    case 'title-asc': return a.title.localeCompare(b.title);
                    case 'title-desc': return b.title.localeCompare(a.title);
                    case 'author-asc': {
                        const authorA = a.authors ? a.authors[0] || '' : '';
                        const authorB = b.authors ? b.authors[0] || '' : '';
                        return authorA.localeCompare(authorB);
                    }
                    case 'author-desc': {
                        const authorA = a.authors ? a.authors[0] || '' : '';
                        const authorB = b.authors ? b.authors[0] || '' : '';
                        return authorB.localeCompare(authorA);
                    }
                    case 'date-added-asc': return new Date(a.dateAdded) - new Date(b.dateAdded);
                    case 'date-added-desc': return new Date(b.dateAdded) - new Date(a.dateAdded);
                    default: return 0;
                }
            };
            return getSortValue(a, sortCriterion);
        });
    }, [savedBooks, activeList, sortCriterion]);

    const pageVariants = {
        initial: { opacity: 0, y: 20 },
        in: { opacity: 1, y: 0 },
        out: { opacity: 0, y: -20 }
    };

    const pageTransition = {
        type: "tween",
        ease: "anticipate",
        duration: 0.5
    };

    return (
        <motion.div
            className="user-books-page"
            initial="initial"
            animate="in"
            exit="out"
            variants={pageVariants}
            transition={pageTransition}
        >
            <div className="controls-container">
                <div className="list-toggle-buttons">
                    <button
                        className={`toggle-button ${activeList === 'all-books' ? 'active' : ''}`}
                        onClick={() => setActiveList('all-books')}
                    >
                        All Books ({savedBooks.length})
                    </button>
                    <button
                        className={`toggle-button ${activeList === 'want-to-read' ? 'active' : ''}`}
                        onClick={() => setActiveList('want-to-read')}
                    >
                        Want to Read ({savedBooks.filter(book => book.status === 'want-to-read').length})
                    </button>
                    <button
                        className={`toggle-button ${activeList === 'currently-reading' ? 'active' : ''}`}
                        onClick={() => setActiveList('currently-reading')}
                    >
                        Currently Reading ({savedBooks.filter(book => book.status === 'currently-reading').length})
                    </button>
                    <button
                        className={`toggle-button ${activeList === 'read' ? 'active' : ''}`}
                        onClick={() => setActiveList('read')}
                    >
                        Read ({savedBooks.filter(book => book.status === 'read').length})
                    </button>
                </div>

                <div className="sort-controls">
                    <label htmlFor="sort-by">Sort by:</label>
                    <select
                        id="sort-by"
                        value={sortCriterion}
                        onChange={(e) => setSortCriterion(e.target.value)}
                        className="sort-select"
                    >
                        <option value="date-added-desc">Date Added (Newest)</option>
                        <option value="date-added-asc">Date Added (Oldest)</option>
                        <option value="title-asc">Title (A-Z)</option>
                        <option value="title-desc">Title (Z-A)</option>
                        <option value="author-asc">Author (A-Z)</option>
                        <option value="author-desc">Author (Z-A)</option>
                    </select>
                </div>
            </div>


            {savedBooks.length === 0 ? (
                <p className="empty-list-message">You haven't saved any books yet. Add some from the homepage!</p>
            ) : filteredAndSortedBooks.length === 0 ? (
                <p className="empty-list-message">No books found for the current filter criteria.</p>
            ) : (
                <div className="books-grid">
                    {filteredAndSortedBooks.map((book) => (
                        <div className="user-book-card-wrapper" key={book.id}>
                            {/* Pass the correct book object structure to BookCard */}
                            <BookCard book={{ id: book.id, volumeInfo: book }} />
                            <motion.button
                                className="delete-button"
                                onClick={() => handleDelete(book.id)}
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                            >
                                <FontAwesomeIcon icon={faTrashAlt} /> Delete
                            </motion.button>
                        </div>
                    ))}
                </div>
            )}
        </motion.div>
    );
};

export default UserBooksPage;