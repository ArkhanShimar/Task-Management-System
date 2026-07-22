import { Navigate, Route, Routes } from 'react-router-dom';
import { Toaster } from 'sonner';
import { AuthProvider, useAuth } from './context/AuthContext';
import { ThemeProvider } from './context/ThemeContext';
import { Dashboard } from './components/Dashboard';
import { LandingPage } from './components/LandingPage';
import { LoginPage } from './components/LoginPage';

function ProtectedDashboard() {
  const { token } = useAuth();
  return token ? <Dashboard /> : <Navigate to="/login" replace />;
}
function Pages() {
  const { token } = useAuth();
  return <Routes>
    <Route path="/" element={<LandingPage />} />
    <Route path="/login" element={token ? <Navigate to="/dashboard" replace /> : <LoginPage />} />
    <Route path="/dashboard" element={<ProtectedDashboard />} />
    <Route path="*" element={<Navigate to="/" replace />} />
  </Routes>;
}
export default function App() {
  return <ThemeProvider><AuthProvider><Pages /><Toaster position="top-right" richColors theme="system" /></AuthProvider></ThemeProvider>;
}
