import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AppProvider, useApp } from './context/AppContext';
import Layout from './components/common/Layout';
import Dashboard from './pages/Dashboard';
import Students from './pages/Students';
import Attendance from './pages/Attendance';
import Collections from './pages/Collections';
import Requests from './pages/Requests';
import Announcements from './pages/Announcements';
import MyAttendance from './pages/student/MyAttendance';
import MyCollections from './pages/student/MyCollections';
import MyRequests from './pages/student/MyRequests';

const AppRoutes: React.FC = () => {
  const { state } = useApp();

  if (state.role === 'talaba') {
    return (
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route index element={<Dashboard />} />
          <Route path="/my-attendance" element={<MyAttendance />} />
          <Route path="/my-collections" element={<MyCollections />} />
          <Route path="/my-requests" element={<MyRequests />} />
          <Route path="/announcements" element={<Announcements />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Route>
      </Routes>
    );
  }

  return (
    <Routes>
      <Route path="/" element={<Layout />}>
        <Route index element={<Dashboard />} />
        <Route path="/students" element={<Students />} />
        <Route path="/attendance" element={<Attendance />} />
        <Route path="/collections" element={<Collections />} />
        <Route path="/requests" element={<Requests />} />
        <Route path="/announcements" element={<Announcements />} />
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