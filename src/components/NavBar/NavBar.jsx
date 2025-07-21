// src/components/Navbar/Navbar.jsx
import React from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSun, faMoon } from '@fortawesome/free-solid-svg-icons';
import SearchBar from '../SearchBar/SearchBar'; // Ensure correct path
import './NavBar.scss';

// All search-related props are passed through here to SearchBar
const Navbar = ({ theme, toggleTheme, onSearch, initialQuery, suggestions, onSuggest }) => {
    return (
        <motion.nav
            className="navbar"
            initial={{ y: -100 }}
            animate={{ y: 0 }}
            transition={{ type: "spring", stiffness: 100, damping: 10 }}
        >
            <div>
                <NavLink to="/" className="navbar-brand">Bookworm Hub</NavLink>
            </div>
            <div className="navbar-links">
                <NavLink to="/" className={({ isActive }) => (isActive ? 'active' : '')}>
                    Discover
                </NavLink>
                <NavLink to="/my-lists" className={({ isActive }) => (isActive ? 'active' : '')}>
                    My Lists
                </NavLink>
            </div>
            {/* SearchBar component receives all necessary props */}
            <div className="navbar-search-container">
                <SearchBar
                    onSearch={onSearch}
                    initialQuery={initialQuery}
                    suggestions={suggestions}
                    onSuggest={onSuggest}
                />
            </div>
            <motion.button
                className="theme-toggle"
                onClick={toggleTheme}
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                aria-label={`Toggle to ${theme === 'light' ? 'dark' : 'light'} mode`}
            >
                {theme === 'light' ? (
                    <FontAwesomeIcon icon={faSun} />
                ) : (
                    <FontAwesomeIcon icon={faMoon} />
                )}
            </motion.button>
        </motion.nav>
    );
};

export default Navbar;