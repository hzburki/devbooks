import { Route, Routes } from 'react-router-dom';
import Auth from './auth';
import { Toaster } from '../components/ui/toast';

export function App() {
  return (
    <>
      <Routes>
        <Route path="/" element={<Auth />} />
        <Route path="/login" element={<Auth />} />
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
