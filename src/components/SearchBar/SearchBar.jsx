// src/components/SearchBar/SearchBar.jsx
import React, { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSearch, faTimes } from '@fortawesome/free-solid-svg-icons';
import './SearchBar.scss'; // Ensure this SCSS file is present and correct

// SearchBar component receives search and suggestion-related props from its parent
const SearchBar = ({ onSearch, initialQuery = '', suggestions = [], onSuggest }) => {
    const [searchTerm, setSearchTerm] = useState(initialQuery);
    const [showSuggestions, setShowSuggestions] = useState(false); // Controls dropdown visibility
    const searchBarRef = useRef(null); // Ref for detecting clicks outside to close dropdown

    // Sync internal searchTerm with initialQuery prop if it changes (e.g., from parent clearing search)
    useEffect(() => {
        setSearchTerm(initialQuery);
    }, [initialQuery]);

    // Effect to trigger autocomplete suggestions as the user types (debounced via onSuggest prop)
    useEffect(() => {
        // Only fetch suggestions if there's a non-empty search term (e.g., more than 1 character)
        if (searchTerm.trim().length > 1) {
            onSuggest(searchTerm.trim()); // Call the debounced suggestion handler from App.jsx
            setShowSuggestions(true); // Show suggestions dropdown
        } else {
            onSuggest(''); // Clear suggestions in App.jsx if term is too short or empty
            setShowSuggestions(false); // Hide suggestions dropdown
        }
    }, [searchTerm, onSuggest]); // Re-run when searchTerm or the stable onSuggest function changes

    // Effect to hide suggestions when clicking outside the search bar/dropdown
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (searchBarRef.current && !searchBarRef.current.contains(event.target)) {
                setShowSuggestions(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, []);

    // Handles input field changes
    const handleInputChange = (event) => {
        setSearchTerm(event.target.value);
    };

    // Handles click on the search button
    const handleSearchClick = () => {
        if (searchTerm.trim()) {
            onSearch(searchTerm.trim()); // Trigger full search from App.jsx
            setShowSuggestions(false); // Hide suggestions after full search
        } else {
            onSearch(''); // Clear results if search term is empty
            setShowSuggestions(false);
        }
    };

    // Handles Enter key press in the input field
    const handleKeyPress = (event) => {
        if (event.key === 'Enter') {
            event.preventDefault(); // Prevent default form submission behavior (e.g., page reload)
            if (searchTerm.trim()) {
                onSearch(searchTerm.trim()); // Trigger full search from App.jsx
                setShowSuggestions(false);
            } else {
                onSearch('');
                setShowSuggestions(false);
            }
        }
    };

    // Handles click on the clear button (X icon)
    const handleClearClick = () => {
        setSearchTerm(''); // Clear the input field
        onSearch(''); // Call onSearch with an empty string to clear current search results
        setShowSuggestions(false); // Hide suggestions when cleared
    };

    // Handles clicking on an autocomplete suggestion
    const handleSuggestionClick = (suggestion) => {
        setSearchTerm(suggestion); // Set input to the clicked suggestion
        onSearch(suggestion); // Perform a full search for the selected suggestion
        setShowSuggestions(false); // Hide suggestions dropdown
    };

    return (
        // Outer container for positioning the dropdown relative to the search bar
        <motion.div
            className="search-bar-container"
            ref={searchBarRef} // Attach ref here for click outside detection
        >
            {/* The main search bar input and buttons */}
            <motion.div
                className="search-bar"
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
            >
                <input
                    type="text"
                    className="search-input"
                    placeholder="Search by title, author, or keyword..."
                    value={searchTerm}
                    onChange={handleInputChange}
                    onKeyPress={handleKeyPress}
                    // Show suggestions on focus if there's a term and suggestions are available
                    onFocus={() => searchTerm.trim().length > 1 && suggestions.length > 0 && setShowSuggestions(true)}
                />
                {/* Clear button (X icon) - visible only when there's text in the input */}
                {searchTerm && (
                    <motion.button
                        className="clear-button"
                        onClick={handleClearClick}
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                        aria-label="Clear search"
                    >
                        <FontAwesomeIcon icon={faTimes} />
                    </motion.button>
                )}
                {/* Search button (magnifying glass icon) */}
                <motion.button
                    className="search-button"
                    onClick={handleSearchClick}
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    aria-label="Perform search"
                >
                    <FontAwesomeIcon icon={faSearch} />
                </motion.button>
            </motion.div>

            {/* Autocomplete Dropdown - conditionally rendered */}
            {showSuggestions && suggestions.length > 0 && (
                <motion.ul
                    className="autocomplete-dropdown"
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    transition={{ duration: 0.2 }}
                >
                    {suggestions.map((suggestion, index) => (
                        <li
                            key={index} // Using index as key is acceptable here as suggestions are dynamic and re-fetched
                            className="suggestion-item"
                            onClick={() => handleSuggestionClick(suggestion)}
                        >
                            {suggestion}
                        </li>
                    ))}
                </motion.ul>
            )}
        </motion.div>
    );
};

export default SearchBar;