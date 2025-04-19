import { useState } from 'react';
import { BrowserRouter as Router, Route, Routes, Navigate } from 'react-router-dom';
import Login from './sreens/Auth/Login/Login';
import NewName from './sreens/Auth/Register/newName/newName';
import NewPassword from './sreens/Auth/Register/newPassword/newPassword';
import NewEmail from './sreens/Auth/Register/newEmail/newEmail';
import NewEmailConfirm from './sreens/Auth/Register/newEmailConfirm/newEmailConfirm';
import HomePage from './sreens/HomePage/HomePage';

export default function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(
    !!localStorage.getItem('token') || !!sessionStorage.getItem('token')
  );

  return (
    <Router>
      <div className="app-container">
        <Routes>
          <Route path="/" element={isAuthenticated ? <HomePage /> : <Navigate to="/login" />} />
          <Route
            path="/login"
            element={
              isAuthenticated ? <Navigate to="/" /> : <Login setIsAuthenticated={setIsAuthenticated} />
            }
          />
          <Route path="/register">
            <Route index element={<Navigate to="name" />} />
            <Route path="name" element={<NewName />} />
            <Route path="password" element={<NewPassword />} />
            <Route path="email" element={<NewEmail />} />
            <Route path="confirm" element={<NewEmailConfirm />} />
          </Route>
        </Routes>
      </div>
    </Router>
  );
}