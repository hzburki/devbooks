import { Route, Routes, Navigate } from 'react-router-dom';

// Public routes (no authentication required)
import {
  Login,
  AuthCallback,
  ForgotPassword,
  ResetPassword,
} from './public';

// Protected routes (authentication required)
import {
  Dashboard,
  Employees,
  AddEmployee,
  Invoices,
  Leaves,
  AddLeave,
} from './protected';

// Components
import { Toaster } from '@devbooks/components';
import { ProtectedRoute } from '../lib/protected-route';

export function App() {
  return (
    <>
      <Routes>
        <Route path="/" element={<Navigate to="/login" replace />} />
        <Route path="/login" element={<Login />} />
        <Route path="/auth/callback" element={<AuthCallback />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/reset-password" element={<ResetPassword />} />
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/employees"
          element={
            <ProtectedRoute>
              <Employees />
            </ProtectedRoute>
          }
        />
        <Route
          path="/employees/add"
          element={
            <ProtectedRoute>
              <AddEmployee />
            </ProtectedRoute>
          }
        />
        <Route
          path="/invoices"
          element={
            <ProtectedRoute>
              <Invoices />
            </ProtectedRoute>
          }
        />
        <Route
          path="/leaves"
          element={
            <ProtectedRoute>
              <Leaves />
            </ProtectedRoute>
          }
        />
        <Route
          path="/leaves/add"
          element={
            <ProtectedRoute>
              <AddLeave />
            </ProtectedRoute>
          }
        />
      </Routes>
      <Toaster />
    </>
  );
}

export default App;
