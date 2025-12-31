import { Route, Routes, Navigate } from 'react-router-dom';
import Login from './login';
import ForgotPassword from './forgot-password';
import ResetPassword from './reset-password';
import { Toaster } from '../components/ui/toast';

export function App() {
  return (
    <>
      <Routes>
        <Route path="/" element={<Navigate to="/login" replace />} />
        <Route path="/login" element={<Login />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/reset-password" element={<ResetPassword />} />
        <Route
          path="/dashboard"
          element={
            <div className="p-4">
              <h1 className="text-2xl font-bold">Dashboard</h1>
              <p>Welcome to your dashboard!</p>
            </div>
          }
        />
      </Routes>
      <Toaster />
    </>
  );
}

export default App;
