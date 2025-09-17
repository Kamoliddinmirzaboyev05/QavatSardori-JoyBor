import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AppProvider, useApp } from './context/AppContext';
import Layout from './components/common/Layout';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import DutySchedule from './pages/DutySchedule';
import AttendanceList from './pages/AttendanceList';
import AttendanceDetail from './pages/AttendanceDetail';
import Collections from './pages/Collections';
import CollectionDetails from './pages/CollectionDetails';
import Communication from './pages/Communication';

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
    <Routes>
      <Route path="/" element={<Layout />}>
        <Route index element={<Dashboard />} />
        <Route path="/duty-schedule" element={<DutySchedule />} />
        <Route path="/attendance" element={<AttendanceList />} />
        <Route path="/attendance/:id" element={<AttendanceDetail />} />
        <Route path="/collections" element={<Collections />} />
        <Route path="/collections/:id" element={<CollectionDetails />} />
        <Route path="/communication" element={<Communication />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Route>
    </Routes>
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