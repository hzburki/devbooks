import { Route, Routes, Navigate } from 'react-router-dom';

// Screens
import Login from './login';
import ForgotPassword from './forgot-password';
import ResetPassword from './reset-password';
import Dashboard from './dashboard';
import Employees from './employees';
import AddEmployee from './add-employee';
import Invoices from './invoices';
import Leaves from './leaves';
import Records from './records';
import Overtime from './overtime';

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
        <Route path="/employees" element={<Employees />} />
        <Route path="/employees/add" element={<AddEmployee />} />
        <Route path="/invoices" element={<Invoices />} />
        <Route path="/leaves" element={<Leaves />} />
        <Route path="/records" element={<Records />} />
        <Route path="/overtime" element={<Overtime />} />
      </Routes>
      <Toaster />
    </>
  );
}

export default App;
