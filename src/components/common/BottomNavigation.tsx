import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  Home, 
  Calendar, 
  ClipboardCheck, 
  DollarSign, 
  MessageCircle
} from 'lucide-react';
import { clsx } from 'clsx';

const BottomNavigation: React.FC = () => {
  const location = useLocation();

  const navItems = [
    { path: '/', icon: Home, label: 'Boshqaruv' },
    { path: '/duty-schedule', icon: Calendar, label: 'Navbatchilik' },
    { path: '/attendance', icon: ClipboardCheck, label: 'Davomat' },
    { path: '/collections', icon: DollarSign, label: 'Yig\'imlar' },
    { path: '/communication', icon: MessageCircle, label: 'Aloqa' }
  ];

  return (
    <motion.nav 
      className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 z-40"
      initial={{ y: 100 }}
      animate={{ y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <div className="grid grid-cols-5 py-2">
        {navItems.map(({ path, icon: Icon, label }, index) => {
          const isActive = location.pathname === path;
          
          return (
            <motion.div
              key={path}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1, duration: 0.3 }}
            >
              <Link
                to={path}
                className={clsx(
                  "flex flex-col items-center justify-center p-2 rounded-lg transition-colors",
                  isActive 
                    ? "text-blue-600 bg-blue-50" 
                    : "text-gray-600 hover:text-gray-900 hover:bg-gray-50"
                )}
              >
                <motion.div
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <Icon className="w-4 h-4 mb-1" />
                </motion.div>
                <span className="text-xs font-medium truncate">{label}</span>
              </Link>
            </motion.div>
          );
        })}
      </div>
    </motion.nav>
  );
};

export default BottomNavigation;
