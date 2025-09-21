import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown, LogOut, User, Settings, Edit } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import PWAInstallButton from './PWAInstallButton';

const Header: React.FC = () => {
  const { state, dispatch } = useApp();
  const navigate = useNavigate();
  const [showUserMenu, setShowUserMenu] = useState(false);

  const handleLogout = () => {
    if (confirm('Tizimdan chiqishni xohlaysizmi?')) {
      dispatch({ type: 'LOGOUT' });
    }
  };

  const handleProfileClick = () => {
    setShowUserMenu(false);
    navigate('/profile');
  };

  return (
    <>
      <motion.header 
        className="fixed top-0 left-0 right-0 bg-white border-b border-gray-200 z-40"
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        transition={{ duration: 0.3 }}
      >
        <div className="flex items-center justify-between p-4">
          <motion.div 
            className="flex items-center space-x-3"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2, duration: 0.3 }}
          >
            <img
              src="/logoicon.svg"
              alt="Qavat Sardori Logo"
              className="w-8 h-8"
            />
            <div>
              <h1 className="text-lg font-semibold text-gray-900">Qavat Sardori</h1>
            </div>
          </motion.div>

          <motion.div 
            className="flex items-center space-x-2"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2, duration: 0.3 }}
          >
            <PWAInstallButton />
            
            <div className="relative">
              <motion.button
                onClick={() => setShowUserMenu(!showUserMenu)}
                className="flex items-center space-x-2 p-2 rounded-lg hover:bg-gray-50 transition-colors"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center">
                  <span className="text-white text-sm font-medium">
                    {state.user?.name?.charAt(0) || 'S'}
                  </span>
                </div>
                <motion.div
                  animate={{ rotate: showUserMenu ? 180 : 0 }}
                  transition={{ duration: 0.2 }}
                >
                  <ChevronDown className="w-4 h-4 text-gray-600" />
                </motion.div>
              </motion.button>

              <AnimatePresence>
                {showUserMenu && (
                  <motion.div 
                    className="absolute right-0 mt-2 w-52 bg-white border border-gray-200 rounded-lg shadow-lg z-50"
                    initial={{ opacity: 0, y: -10, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: -10, scale: 0.95 }}
                    transition={{ duration: 0.2 }}
                  >
                    <div className="p-3 border-b border-gray-200">
                      <p className="font-medium text-gray-900">
                        {state.user?.name || 'Sardor'}
                      </p>
                      <p className="text-sm text-gray-600">Qavat Sardori</p>
                    </div>
                    <motion.button
                      onClick={handleProfileClick}
                      className="w-full flex items-center justify-between px-3 py-2 text-left text-gray-700 hover:bg-blue-50 hover:text-blue-700 transition-colors group"
                      whileHover={{ x: 4 }}
                    >
                      <div className="flex items-center space-x-2">
                        <User className="w-4 h-4" />
                        <span className="text-sm font-medium">Profil sahifasi</span>
                      </div>
                      <motion.div
                        className="opacity-0 group-hover:opacity-100 transition-opacity"
                        initial={{ x: -5 }}
                        whileHover={{ x: 0 }}
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                        </svg>
                      </motion.div>
                    </motion.button>
                    <motion.button
                      onClick={handleLogout}
                      className="w-full flex items-center space-x-2 px-3 py-2 text-left text-red-600 hover:bg-red-50 transition-colors"
                      whileHover={{ x: 4 }}
                    >
                      <LogOut className="w-4 h-4" />
                      <span className="text-sm">Chiqish</span>
                    </motion.button>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </motion.div>
        </div>

        {/* Overlay to close user menu */}
        <AnimatePresence>
          {showUserMenu && (
            <motion.div
              className="fixed inset-0 z-40"
              onClick={() => setShowUserMenu(false)}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            />
          )}
        </AnimatePresence>
      </motion.header>

    </>
  );
};

export default Header;
