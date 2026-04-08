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
      className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 z-50 h-16 shadow-lg"
      initial={{ y: 100 }}
      animate={{ y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <div className="grid grid-cols-5 h-full max-w-md mx-auto">
        {navItems.map(({ path, icon: Icon, label }, index) => {
          const isActive = location.pathname === path;
          
          return (
            <Link
              key={path}
              to={path}
              className={clsx(
                "flex flex-col items-center justify-center transition-all duration-200",
                isActive 
                  ? "text-blue-700 bg-gray-50 border-t-2 border-blue-700" 
                  : "text-gray-500 hover:text-gray-900"
              )}
            >
              <Icon className={clsx("w-5 h-5", isActive ? "mb-0.5" : "mb-1")} />
              <span className="text-[10px] font-semibold tracking-tight leading-none uppercase">{label}</span>
            </Link>
          );
        })}
      </div>
    </motion.nav>
  );
};

export default BottomNavigation;
