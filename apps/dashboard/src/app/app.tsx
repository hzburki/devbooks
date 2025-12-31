import { Route, Routes, Link } from 'react-router-dom';
import { Button } from '@devbooks/ui';

export function App() {
  return (
    <div className="p-4 text-gray-800">
      <div className="text-3xl font-bold underline">Hello World</div>
      <Button />
      <Routes>
        <Route
          path="/"
          element={
            <div>
              This is the generated root route.{' '}
              <Link to="/page-2">Click here for page 2.</Link>
            </div>
          }
        />
        <Route
          path="/page-2"
          element={
            <div>
              <Link to="/">Click here to go back to root page.</Link>
            </div>
          }
        />
      </Routes>
      {/* END: routes */}
    </div>
  );
}

export default App;
