import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AnimatePresence } from 'framer-motion';
import { AppProvider, useApp } from './context/AppContext';
import Layout from './components/common/Layout';
import PageTransition from './components/common/PageTransition';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import DutySchedule from './pages/DutySchedule';
import AttendanceList from './pages/AttendanceList';
import AttendanceDetail from './pages/AttendanceDetail';
import Collections from './pages/Collections';
import CollectionDetails from './pages/CollectionDetails';
import Communication from './pages/Communication';
import Profile from './pages/Profile';

const AppRoutes: React.FC = () => {
  const { state } = useApp();

  if (!state.isAuthenticated) {
    return (
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    );
  }

  return (
    <AnimatePresence mode="wait">
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route index element={
            <PageTransition>
              <Dashboard />
            </PageTransition>
          } />
          <Route path="/duty-schedule" element={
            <PageTransition>
              <DutySchedule />
            </PageTransition>
          } />
          <Route path="/attendance" element={
            <PageTransition>
              <AttendanceList />
            </PageTransition>
          } />
          <Route path="/attendance/:id" element={
            <PageTransition>
              <AttendanceDetail />
            </PageTransition>
          } />
          <Route path="/collections" element={
            <PageTransition>
              <Collections />
            </PageTransition>
          } />
          <Route path="/collections/:id" element={
            <PageTransition>
              <CollectionDetails />
            </PageTransition>
          } />
          <Route path="/communication" element={
            <PageTransition>
              <Communication />
            </PageTransition>
          } />
          <Route path="/profile" element={
            <PageTransition>
              <Profile />
            </PageTransition>
          } />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Route>
      </Routes>
    </AnimatePresence>
  );
};

const App: React.FC = () => {
  return (
    <AppProvider>
      <Router>
        <div className="App">
          <AppRoutes />
        </div>
      </Router>
    </AppProvider>
  );
};

export default App;
