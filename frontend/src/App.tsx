import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import Login from './pages/Login';
import Register from './pages/Register';
import Profile from './pages/Profile';
import Labo from './pages/Labo';
import AdminDashboard from './pages/AdminDashboard';
import Settings from './pages/Settings';
import Navbar from './components/Navbar';
import ThemeToggle from './components/ThemeToggle';
import './App.css';

import ProtectedRoute from './components/ProtectedRoute';

function AppContent() {
  const getAuth = () => {
    return {
      isAuthenticated: !!localStorage.getItem('access'),
      isStaff: localStorage.getItem('is_staff') === 'true'
    };
  };

  const location = useLocation();
  const isAuthPage = location.pathname === '/login' || location.pathname === '/register';

  return (
    <>
      <ThemeToggle />
      {!isAuthPage && <Navbar />}
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        
        {/* Protected Routes */}
        <Route path="/profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
        <Route path="/labo" element={<ProtectedRoute><Labo /></ProtectedRoute>} />
        <Route path="/admin" element={<ProtectedRoute adminOnly={true}><AdminDashboard /></ProtectedRoute>} />
        <Route path="/settings" element={<ProtectedRoute><Settings /></ProtectedRoute>} />
        
        <Route 
          path="/" 
          element={
            getAuth().isAuthenticated ? (
              <Navigate to={getAuth().isStaff ? "/admin" : "/labo"} replace />
            ) : (
              <Navigate to="/login" replace />
            )
          } 
        />
      </Routes>
    </>
  );
}

function App() {
  return (
    <Router>
      <AppContent />
    </Router>
  );
}

export default App;
