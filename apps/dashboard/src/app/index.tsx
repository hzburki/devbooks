import { Route, Routes, Navigate } from 'react-router-dom';

// Screens
import Login from './login';
import ForgotPassword from './forgot-password';
import ResetPassword from './reset-password';
import Dashboard from './dashboard';

// Components
import { Toaster } from '@devbooks/components';

export function App() {
  return (
    <>
      <Routes>
        <Route path="/" element={<Navigate to="/login" replace />} />
        <Route path="/login" element={<Login />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/reset-password" element={<ResetPassword />} />
        <Route path="/dashboard" element={<Dashboard />} />
      </Routes>
      <Toaster />
    </>
  );
}

export default App;
