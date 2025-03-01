import { useState, useEffect } from 'react';
import { BrowserRouter as Router, Route, Routes, Navigate } from 'react-router-dom';
import Navigation from './components/Navigation';
import Map from './sreens/Map/Map';
import News from './sreens/News/News';
import Calendar from './sreens/Calendar/Calendar';
import Profile from './sreens/Profile/Profile';
import Login from './sreens/Auth/Login';
import Register from './sreens/Auth/Register';
import FAQ from './sreens/FAQ/FAQ';

export default function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(
    !!localStorage.getItem('token') || !!sessionStorage.getItem('token')
  );

  return (
    <Router>
      <div className="app-container">
        <Routes>
          <Route path="/login" element={
            isAuthenticated ? <Navigate to="/" /> : 
              <Login setIsAuthenticated={setIsAuthenticated} />
          } />
          <Route path="/register" element={
            isAuthenticated ? <Navigate to="/" /> : <Register />
          } />
          
          {/* Основные маршруты с навигацией */}
          <Route path="/*" element={
            isAuthenticated ? (
              <>
                <main className="content">
                  <Routes>
                    <Route path="/" element={<Map />} />
                    <Route path="/news" element={<News />} />
                    <Route path="/calendar" element={<Calendar />} />
                    <Route 
                      path="/profile" 
                      element={<Profile setIsAuthenticated={setIsAuthenticated} />} 
                    />
                    <Route path="*" element={<Navigate to="/" />} />
                  </Routes>
                </main>
                <Navigation />
              </>
            ) : (
              <Navigate to="/login" />
            )
          } />

          <Route 
            path="/faq" 
            element={
              isAuthenticated ? (
                <main className="content">
                  <FAQ />
                </main>
              ) : (
                <Navigate to="/login" />
              )
            } 
          />
        </Routes>
      </div>
    </Router>
  );
}