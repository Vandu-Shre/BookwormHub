// src/App.jsx
import React, { useState, useEffect, useCallback } from 'react';
import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';

import Navbar from './components/NavBar/NavBar';
import BookCard from './components/BookCard/BookCard';
import TrendingBooksSection from './components/TrendingBooksSection/TrendingBooksSection'; // Assuming this component exists
import UserBooksPage from './pages/UserBooksPage'; // Assuming this page exists

import './App.scss';
import './index.scss';

// Utility function for debouncing - remains outside the component to be defined once
const debounce = (func, delay) => {
    let timeout;
    return (...args) => {
        const context = this;
        clearTimeout(timeout);
        timeout = setTimeout(() => func.apply(context, args), delay);
    };
};

const App = () => {
    const [theme, setTheme] = useState('dark');
    const [books, setBooks] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [query, setQuery] = useState(''); // Current main search query
    const [suggestions, setSuggestions] = useState([]); // Autocomplete suggestions

    // Theme toggling logic
    const toggleTheme = () => {
        setTheme((prevTheme) => (prevTheme === 'light' ? 'dark' : 'light'));
    };

    useEffect(() => {
        document.body.className = theme + '-mode';
    }, [theme]);

    // Function to fetch main search results
    const fetchBooks = async (searchQuery) => {
        console.log('fetchBooks called with query:', searchQuery);
        if (!searchQuery.trim()) {
            setBooks([]);
            console.log('Search query is empty, setting books to empty array.');
            return;
        }

        setLoading(true);
        setError(null);
        try {
            const response = await fetch(`https://www.googleapis.com/books/v1/volumes?q=${searchQuery}&maxResults=20`);
            console.log('API Response Status (fetchBooks):', response.status);

            if (!response.ok) {
                // Throw error if HTTP status is not 2xx
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            const data = await response.json();
            console.log('API Response Data (fetchBooks):', data);

            if (data.items) {
                setBooks(data.items);
                console.log('Books state updated with:', data.items.length, 'items.');
            } else {
                setBooks([]);
                console.log('API response had no items, setting books to empty array.');
            }
        } catch (e) {
            setError('Failed to fetch books. Please try again.');
            console.error('Error fetching books:', e);
            setBooks([]);
        } finally {
            setLoading(false);
            console.log('Loading set to false.');
        }
    };

    // Debounced version of fetchBooks for main searches (to prevent 429 errors on rapid clicks)
    const debouncedFetchBooks = useCallback(
        debounce((searchQuery) => fetchBooks(searchQuery), 500), // 500ms debounce for main search
        [] // Empty dependency array ensures debouncedFetchBooks is stable
    );

    // Function to fetch autocomplete suggestions
    const fetchSuggestions = useCallback(debounce(async (searchQuery) => {
        if (!searchQuery.trim()) {
            if (suggestions.length > 0) { // Only clear if not already empty
                setSuggestions([]);
            }
            return;
        }
        try {
            const response = await fetch(`https://www.googleapis.com/books/v1/volumes?q=${searchQuery}&maxResults=5`);
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            const data = await response.json();
            let newSuggestions = [];
            if (data.items) {
                // Filter and slice to ensure uniqueness and limit, prioritize exact matches
                newSuggestions = Array.from(new Set(data.items.map(item => item.volumeInfo.title)))
                                        .filter(title => title && title.toLowerCase().includes(searchQuery.toLowerCase()))
                                        .slice(0, 5); // Limit to 5 suggestions
            }

            // IMPORTANT: Only update state if the suggestions have actually changed
            // This prevents unnecessary re-renders when the API returns the same suggestions
            if (JSON.stringify(newSuggestions) !== JSON.stringify(suggestions)) {
                setSuggestions(newSuggestions);
            }

        } catch (e) {
            console.error('Error fetching suggestions:', e);
            if (suggestions.length > 0) { // Only clear on error if not already empty
                setSuggestions([]);
            }
        }
    }, 300), [suggestions]); // CRUCIAL: Add 'suggestions' to dependency array for correct closure

    // Handler for full search (triggered by SearchBar button or Enter)
    const handleSearch = (searchQuery) => {
        console.log('handleSearch called, new query:', searchQuery);
        setQuery(searchQuery); // Set the main query state
        setSuggestions([]); // Clear suggestions when a full search is performed
        debouncedFetchBooks(searchQuery); // Call the debounced version for main search
    };

    // Handler for autocomplete suggestions (triggered as user types)
    const handleSuggest = (searchQuery) => {
        fetchSuggestions(searchQuery); // Call the debounced version for suggestions
    };

    // Component for route-specific content with animations
    const DynamicRoutes = () => {
        const location = useLocation();

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

        const typewriterText = "Your personal library. Discover, track, enjoy.";

        return (
            <AnimatePresence mode="wait">
                <Routes location={location} key={location.pathname}>
                    <Route
                        path="/"
                        element={
                            <motion.div
                                className="app-content"
                                initial="initial"
                                animate="in"
                                exit="out"
                                variants={pageVariants}
                                transition={pageTransition}
                            >
                                {loading && <div className="book-list-status">Loading books...</div>}
                                {error && <div className="book-list-status error">{error}</div>}
                                {/* Display status if no books found for a specific query */}
                                {!loading && !error && books.length === 0 && query && (
                                    <div className="book-list-status">No books found for "{query}". Try another search!</div>
                                )}
                                {/* Display introductory message and trending books if no query is active */}
                                {!loading && !error && books.length === 0 && !query && (
                                    <>
                                        <div className="book-list-status">
                                            <span className="typewriter-effect">{typewriterText}</span>
                                        </div>
                                        <TrendingBooksSection />
                                    </>
                                )}
                                {/* Render books if available */}
                                {!loading && !error && books.length > 0 && (
                                    <div className="book-list">
                                        {books.map((book) => (
                                            <BookCard key={book.id} book={book} />
                                        ))}
                                    </div>
                                )}
                            </motion.div>
                        }
                    />
                    <Route
                        path="/my-lists"
                        element={
                            <motion.div
                                initial="initial"
                                animate="in"
                                exit="out"
                                variants={pageVariants}
                                transition={pageTransition}
                            >
                                <UserBooksPage />
                            </motion.div>
                        }
                    />
                </Routes>
            </AnimatePresence>
        );
    };

    return (
        <Router>
            <div className="app-container">
                <Navbar
                    theme={theme}
                    toggleTheme={toggleTheme}
                    onSearch={handleSearch}
                    initialQuery={query}
                    suggestions={suggestions}
                    onSuggest={handleSuggest}
                />
                <div className="main-content-wrapper">
                    <DynamicRoutes />
                </div>
            </div>
        </Router>
    );
};

export default App;