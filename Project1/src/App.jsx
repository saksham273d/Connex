import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useContext } from 'react';
import { AuthContext, AuthProvider, useAuth } from './context/AuthContext';
import Login from './pages/Login';
import useIdleTimer from './hooks/useIdleTimer';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import { Toaster } from 'react-hot-toast';
import toast from 'react-hot-toast';
import ForgotPassword from './pages/ForgotPassword';

let ProtectedRoute = ({ children }) => {
  let { user, loading } = useContext(AuthContext);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!user) return <Navigate to="/login" replace />;
  return children;
};

let AuthenticatedWrapper = ({ children }) => {
  let { logout } = useAuth();

  let handleIdleLogout = () => {
    toast.error('Session expired due to inactivity.');
    logout(); 
  };

  useIdleTimer({ 
    timeout: 300000, 
    onTimeout: handleIdleLogout 
  });

  return <>{children}</>;
};

function App() {
  return (
    <Router>
      <Toaster 
        position="top-right"
        toastOptions={{
          duration: 3000,
          style: {
            background: '#363636',
            color: '#fff',
          },
          success: { iconTheme: { primary: '#10b981', secondary: '#fff' }},
          error: { iconTheme: { primary: '#ef4444', secondary: '#fff' }},
        }}
      />
      <Routes>
        <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          
          {/* Wrap Protected Routes with AuthenticatedWrapper */}
          <Route 
            path="/dashboard" 
            element={
              <ProtectedRoute>
                <AuthenticatedWrapper>
                  <Dashboard />
                </AuthenticatedWrapper>
              </ProtectedRoute>
            } 
          />
          <Route path="/" element={<Navigate to="/login" replace />} />
      </Routes>
    </Router>
  );
}

export default App;