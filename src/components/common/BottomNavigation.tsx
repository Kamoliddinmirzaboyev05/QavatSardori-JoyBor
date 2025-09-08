import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { 
  Home, 
  Users, 
  ClipboardCheck, 
  DollarSign, 
  MessageCircle,
  Megaphone,
  FileText
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { clsx } from 'clsx';

const BottomNavigation: React.FC = () => {
  const location = useLocation();
  const { state } = useApp();

  const wardenNavItems = [
    { path: '/', icon: Home, label: 'Boshqaruv' },
    { path: '/students', icon: Users, label: 'Talabalar' },
    { path: '/attendance', icon: ClipboardCheck, label: 'Davomat' },
    { path: '/collections', icon: DollarSign, label: 'Yig\'imlar' },
    { path: '/requests', icon: MessageCircle, label: 'So\'rovlar' }
  ];

  const studentNavItems = [
    { path: '/', icon: Home, label: 'Bosh sahifa' },
    { path: '/my-attendance', icon: ClipboardCheck, label: 'Davomatim' },
    { path: '/my-collections', icon: DollarSign, label: 'To\'lovlar' },
    { path: '/my-requests', icon: FileText, label: 'So\'rovlarim' },
    { path: '/announcements', icon: Megaphone, label: 'E\'lonlar' }
  ];

  const navItems = state.role === 'qavat_sardori' ? wardenNavItems : studentNavItems;

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 z-40">
      <div className="flex items-center justify-around py-2">
        {navItems.map(({ path, icon: Icon, label }) => {
          const isActive = location.pathname === path;
          
          return (
            <Link
              key={path}
              to={path}
              className={clsx(
                "flex flex-col items-center justify-center p-2 rounded-lg transition-colors min-w-0 flex-1",
                isActive 
                  ? "text-blue-600 bg-blue-50" 
                  : "text-gray-600 hover:text-gray-900 hover:bg-gray-50"
              )}
            >
              <Icon className="w-5 h-5 mb-1" />
              <span className="text-xs font-medium truncate">{label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
};

export default BottomNavigation;