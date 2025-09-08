import React from 'react';
import { Outlet } from 'react-router-dom';
import BottomNavigation from './BottomNavigation';
import Header from './Header';
import PWAInstallButton from './PWAInstallButton';

const Layout: React.FC = () => {
  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      <Header />
      <main className="pt-16">
        <Outlet />
      </main>
      <BottomNavigation />
      <PWAInstallButton />
    </div>
  );
};

export default Layout;