import { Route, Routes, Navigate } from 'react-router-dom';

// Public routes (no authentication required)
import { Login, AuthCallback } from './public';

// Protected routes (authentication required)
import {
  Dashboard,
  EmployeesTable,
  EmployeeForm,
  Invoices,
  Leaves,
  LeavesForm,
  Medical,
  MedicalClaimForm,
  Inventory,
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
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/overview"
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
              <EmployeesTable />
            </ProtectedRoute>
          }
        />
        <Route
          path="/employees/add"
          element={
            <ProtectedRoute>
              <EmployeeForm />
            </ProtectedRoute>
          }
        />
        <Route
          path="/employees/edit/:id"
          element={
            <ProtectedRoute>
              <EmployeeForm />
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
              <LeavesForm />
            </ProtectedRoute>
          }
        />
        <Route
          path="/leaves/edit/:id"
          element={
            <ProtectedRoute>
              <LeavesForm />
            </ProtectedRoute>
          }
        />
        <Route
          path="/medical"
          element={
            <ProtectedRoute>
              <Medical />
            </ProtectedRoute>
          }
        />
        <Route
          path="/medical/add"
          element={
            <ProtectedRoute>
              <MedicalClaimForm />
            </ProtectedRoute>
          }
        />
        <Route
          path="/medical/edit/:id"
          element={
            <ProtectedRoute>
              <MedicalClaimForm />
            </ProtectedRoute>
          }
        />
        <Route
          path="/inventory"
          element={
            <ProtectedRoute>
              <Inventory />
            </ProtectedRoute>
          }
        />
      </Routes>
      <Toaster />
    </>
  );
}

export default App;
