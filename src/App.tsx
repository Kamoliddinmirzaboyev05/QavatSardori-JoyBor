import React, { Suspense, lazy } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AnimatePresence } from 'framer-motion';
import { AppProvider, useApp } from './context/AppContext';
import Layout from './components/common/Layout';
import ErrorBoundary from './components/common/ErrorBoundary';
import PageTransition from './components/common/PageTransition';
import Login from './pages/Login';

// Login'dan keyingi sahifalar — mobil'da tez ochilish uchun lazy (route bo'yicha bo'lingan bundle)
const Dashboard = lazy(() => import('./pages/Dashboard'));
const DutySchedule = lazy(() => import('./pages/DutySchedule'));
const AttendanceList = lazy(() => import('./pages/AttendanceList'));
const AttendanceDetail = lazy(() => import('./pages/AttendanceDetail'));
const AttendanceNew = lazy(() => import('./pages/AttendanceNew'));
const Collections = lazy(() => import('./pages/Collections'));
const CollectionDetails = lazy(() => import('./pages/CollectionDetails'));
const Communication = lazy(() => import('./pages/Communication'));
const Students = lazy(() => import('./pages/Students'));
const Profile = lazy(() => import('./pages/Profile'));

const RouteFallback: React.FC = () => (
  <div className="flex items-center justify-center min-h-[60vh]">
    <div className="w-8 h-8 border-2 border-brand-600 border-t-transparent rounded-full animate-spin" />
  </div>
);

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
    <AnimatePresence mode="popLayout" initial={false}>
      <Suspense fallback={<RouteFallback />}>
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
            <Route path="/attendance/new" element={
              <PageTransition>
                <AttendanceNew />
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
            <Route path="/students" element={
              <PageTransition>
                <Students />
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
      </Suspense>
    </AnimatePresence>
  );
};

const App: React.FC = () => {
  return (
    <ErrorBoundary>
      <AppProvider>
        <Router>
          <div className="App">
            <AppRoutes />
          </div>
        </Router>
      </AppProvider>
    </ErrorBoundary>
  );
};

export default App;
