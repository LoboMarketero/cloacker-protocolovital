import React, { useEffect } from 'react';
import { Routes, Route, useLocation, Navigate } from 'react-router-dom';
import { useConfig } from './context/ConfigContext';
import LoadingPage from './pages/LoadingPage';
import SafePage from './pages/SafePage';
import AdminPage from './pages/AdminPage';
import AdminLogin from './pages/AdminLogin';
import ProtectedRoute from './components/ProtectedRoute';
import { captureUTMParams } from './utils/utm';

function App() {
  const location = useLocation();
  const { setUtmParams } = useConfig();
  
  // Capture UTM parameters on app load and route changes
  useEffect(() => {
    const params = captureUTMParams();
    setUtmParams(params);
  }, [location.search, setUtmParams]);

  return (
    <Routes>
      <Route path="/loading" element={<LoadingPage />} />
      <Route path="/" element={<SafePage />} />
      <Route path="/admin-login" element={<AdminLogin />} />
      <Route 
        path="/admin" 
        element={
          <ProtectedRoute>
            <AdminPage />
          </ProtectedRoute>
        } 
      />
      {/* Redirect any unknown routes to safe page */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default App;