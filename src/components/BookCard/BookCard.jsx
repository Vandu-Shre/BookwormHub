// src/components/BookCard/BookCard.jsx
import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faBookmark, faEye, faBookOpen, faShareNodes } from '@fortawesome/free-solid-svg-icons';
import './BookCard.scss';

const BookCard = ({ book }) => {
    const [isSaved, setIsSaved] = useState(false);
    const [readingStatus, setReadingStatus] = useState('want-to-read');

    // Determine the correct thumbnail URL based on the book object structure
    // This handles both API response (volumeInfo.imageLinks?.thumbnail) and saved book (volumeInfo.thumbnail)
    const thumbnailUrl = book.volumeInfo?.imageLinks?.thumbnail // For API response structure
                         || book.volumeInfo?.thumbnail            // For saved book structure
                         || 'https://via.placeholder.com/128x190.png?text=No+Cover'; // Default placeholder

    useEffect(() => {
        const savedBooks = JSON.parse(localStorage.getItem('savedBooks')) || [];
        const savedBook = savedBooks.find(b => b.id === book.id);
        if (savedBook) {
            setIsSaved(true);
            setReadingStatus(savedBook.status || 'want-to-read');
        } else {
            setIsSaved(false);
            setReadingStatus('want-to-read');
        }
    }, [book.id]);

    const handleSaveToggle = () => {
        let savedBooks = JSON.parse(localStorage.getItem('savedBooks')) || [];

        if (isSaved) {
            savedBooks = savedBooks.filter(b => b.id !== book.id);
            setIsSaved(false);
            setReadingStatus('want-to-read');
        } else {
            const newBook = {
                id: book.id,
                title: book.volumeInfo.title,
                authors: book.volumeInfo.authors || ['N/A'],
                // Ensure thumbnail is always saved as the direct URL, not nested
                thumbnail: book.volumeInfo.imageLinks?.thumbnail || 'https://via.placeholder.com/128x190.png?text=No+Cover',
                previewLink: book.volumeInfo.previewLink,
                dateAdded: new Date().toISOString(),
                status: readingStatus
            };
            savedBooks.push(newBook);
            setIsSaved(true);
        }
        localStorage.setItem('savedBooks', JSON.stringify(savedBooks));
    };

    const handleStatusChange = (newStatus) => {
        setReadingStatus(newStatus);
        if (isSaved) {
            let savedBooks = JSON.parse(localStorage.getItem('savedBooks')) || [];
            const updatedBooks = savedBooks.map(b =>
                b.id === book.id ? { ...b, status: newStatus } : b
            );
            localStorage.setItem('savedBooks', JSON.stringify(updatedBooks));
        }
    };

    const handleShare = () => {
        if (navigator.share) {
            navigator.share({
                title: book.volumeInfo.title,
                text: `Check out this book: ${book.volumeInfo.title} by ${book.volumeInfo.authors ? book.volumeInfo.authors.join(', ') : 'N/A'}`,
                url: book.volumeInfo.previewLink || window.location.href,
            }).then(() => console.log('Successful share'))
              .catch((error) => console.log('Error sharing', error));
        } else {
            alert(`You can share this link: ${book.volumeInfo.previewLink || window.location.href}`);
        }
    };

    const cardVariants = {
        hidden: { opacity: 0, y: 50 },
        visible: { opacity: 1, y: 0, transition: { duration: 0.5 } }
    };

    return (
        <motion.div
            className="book-card"
            variants={cardVariants}
            initial="hidden"
            animate="visible"
            layout
        >
            <a
                href={book.volumeInfo.previewLink || '#'}
                target="_blank"
                rel="noopener noreferrer"
                className={`book-cover-link ${!book.volumeInfo.previewLink ? 'no-preview' : ''}`}
                title={book.volumeInfo.previewLink ? "View Preview" : "No preview available"}
            >
                <img
                    src={thumbnailUrl} // Use the resolved thumbnail URL
                    alt={`Cover of ${book.volumeInfo.title}`}
                    className="book-cover"
                />
            </a>
            <div className="book-details">
                <h3 className="book-title">{book.volumeInfo.title}</h3>
                <p className="book-author">
                    {book.volumeInfo.authors ? book.volumeInfo.authors.join(', ') : 'N/A'}
                </p>
                <div className="book-actions">
                    <motion.button
                        className={`action-button ${isSaved ? 'added' : ''}`}
                        onClick={handleSaveToggle}
                        whileHover={{ scale: 1.15 }}
                        whileTap={{ scale: 0.95 }}
                        title={isSaved ? "Remove from My Lists" : "Add to My Lists"}
                    >
                        <FontAwesomeIcon icon={faBookmark} />
                    </motion.button>

                    {isSaved && (
                        <>
                            <motion.button
                                className={`action-button ${readingStatus === 'want-to-read' ? 'active-status' : ''}`}
                                onClick={() => handleStatusChange('want-to-read')}
                                whileHover={{ scale: 1.15 }}
                                whileTap={{ scale: 0.95 }}
                                title="Want to Read"
                            >
                                <FontAwesomeIcon icon={faEye} />
                            </motion.button>
                            <motion.button
                                className={`action-button ${readingStatus === 'currently-reading' ? 'active-status' : ''}`}
                                onClick={() => handleStatusChange('currently-reading')}
                                whileHover={{ scale: 1.15 }}
                                whileTap={{ scale: 0.95 }}
                                title="Currently Reading"
                            >
                                <FontAwesomeIcon icon={faBookOpen} />
                            </motion.button>
                            <motion.button
                                className={`action-button ${readingStatus === 'read' ? 'active-status' : ''}`}
                                onClick={() => handleStatusChange('read')}
                                whileHover={{ scale: 1.15 }}
                                whileTap={{ scale: 0.95 }}
                                title="Read"
                            >
                                <FontAwesomeIcon icon={faBookmark} rotation={270} />
                            </motion.button>
                        </>
                    )}

                    <motion.button
                        className="action-button"
                        onClick={handleShare}
                        whileHover={{ scale: 1.15 }}
                        whileTap={{ scale: 0.95 }}
                        title="Share Book"
                    >
                        <FontAwesomeIcon icon={faShareNodes} />
                    </motion.button>
                </div>
            </div>
        </motion.div>
    );
};

export default BookCard;