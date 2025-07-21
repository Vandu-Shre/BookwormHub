import React from 'react';
import { motion } from 'framer-motion';
import './HeroSection.scss';

const HeroSection = () => {
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.2
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.6,
        ease: "easeOut"
      }
    }
  };

  return (
    <motion.div
      className="hero-section"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      <motion.h1 variants={itemVariants} className="hero-title">
        Discover Your Next Read
      </motion.h1>
      <motion.p variants={itemVariants} className="hero-subtitle">
        Search millions of books from the Google Books API.
      </motion.p>
      <motion.div variants={itemVariants} className="hero-image">
        <span role="img" aria-label="books emoji">📖</span>
      </motion.div>
    </motion.div>
  );
};

export default HeroSection;