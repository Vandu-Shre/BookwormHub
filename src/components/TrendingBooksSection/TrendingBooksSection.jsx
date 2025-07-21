// src/components/TrendingBooksSection/TrendingBooksSection.jsx
import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import BookCard from '../BookCard/BookCard'; // Re-use BookCard component
import './TrendingBooksSection.scss';

const TrendingBooksSection = () => {
    const [trendingBooks, setTrendingBooks] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchTrending = async () => {
            setLoading(true);
            setError(null);
            try {
                // Fetch a set of well-known popular books to simulate "trending"
                // Using specific queries or IDs is more reliable for consistent results
                const queries = [
                    'harry potter',
                    'lord of the rings',
                    'the hobbit',
                    'a song of ice and fire',
                    'dune book',
                    'the alchemist',
                    'to kill a mockingbird',
                    '1984 book',
                    'pride and prejudice',
                    'the great gatsby'
                ];
                const selectedQuery = queries[Math.floor(Math.random() * queries.length)]; // Pick a random one

                // Or, if you want very specific books, you'd fetch by ID:
                // e.g., 'https://www.googleapis.com/books/v1/volumes/zyTCAlFPjgYC' (for The Hobbit)

                const response = await fetch(`https://www.googleapis.com/books/v1/volumes?q=${selectedQuery}&maxResults=10`);
                if (!response.ok) {
                    throw new Error(`HTTP error! status: ${response.status}`);
                }
                const data = await response.json();
                if (data.items) {
                    // Filter out books without thumbnails to ensure good display
                    const filteredBooks = data.items.filter(book => book.volumeInfo.imageLinks?.thumbnail);
                    setTrendingBooks(filteredBooks.slice(0, 6)); // Show top 6 relevant books
                } else {
                    setTrendingBooks([]);
                }
            } catch (e) {
                setError('Failed to load trending books. Please try again.');
                console.error('Error fetching trending books:', e);
            } finally {
                setLoading(false);
            }
        };

        fetchTrending();
    }, []); // Empty dependency array means this runs once on mount

    const sectionVariants = {
        hidden: { opacity: 0, y: 50 },
        visible: { opacity: 1, y: 0, transition: { duration: 0.8 } }
    };

    return (
        <motion.div
            className="trending-books-section"
            variants={sectionVariants}
            initial="hidden"
            animate="visible"
        >
            <h2 className="section-title">Trending Books</h2>
            {loading && <div className="trending-status">Loading trending books...</div>}
            {error && <div className="trending-status error">{error}</div>}
            {!loading && !error && trendingBooks.length === 0 && (
                <div className="trending-status">No trending books to display.</div>
            )}
            {!loading && !error && trendingBooks.length > 0 && (
                <div className="trending-books-grid">
                    {trendingBooks.map((book) => (
                        <BookCard key={book.id} book={book} />
                    ))}
                </div>
            )}
        </motion.div>
    );
};

export default TrendingBooksSection;