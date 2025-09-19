import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { 
  Home, 
  Calendar, 
  ClipboardCheck, 
  DollarSign, 
  MessageCircle,
  User
} from 'lucide-react';
import { clsx } from 'clsx';

const BottomNavigation: React.FC = () => {
  const location = useLocation();

  const navItems = [
    { path: '/', icon: Home, label: 'Boshqaruv' },
    { path: '/duty-schedule', icon: Calendar, label: 'Navbatchilik' },
    { path: '/attendance', icon: ClipboardCheck, label: 'Davomat' },
    { path: '/collections', icon: DollarSign, label: 'Yig\'imlar' },
    { path: '/communication', icon: MessageCircle, label: 'Aloqa' },
    { path: '/profile', icon: User, label: 'Profil' }
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 z-40">
      <div className="grid grid-cols-6 py-2">
        {navItems.map(({ path, icon: Icon, label }) => {
          const isActive = location.pathname === path;
          
          return (
            <Link
              key={path}
              to={path}
              className={clsx(
                "flex flex-col items-center justify-center p-2 rounded-lg transition-colors",
                isActive 
                  ? "text-blue-600 bg-blue-50" 
                  : "text-gray-600 hover:text-gray-900 hover:bg-gray-50"
              )}
            >
              <Icon className="w-4 h-4 mb-1" />
              <span className="text-xs font-medium truncate">{label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
};

export default BottomNavigation;
