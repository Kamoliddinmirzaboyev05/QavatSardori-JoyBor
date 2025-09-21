import React from 'react';
import { Outlet } from 'react-router-dom';
import { motion } from 'framer-motion';
import BottomNavigation from './BottomNavigation';
import Header from './Header';

const Layout: React.FC = () => {
  return (
    <motion.div 
      className="min-h-screen bg-gray-50 pb-20"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3 }}
    >
      <Header />
      <motion.main 
        className="pt-16"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1, duration: 0.3 }}
      >
        <Outlet />
      </motion.main>
      <BottomNavigation />
    </motion.div>
  );
};

export default Layout;
