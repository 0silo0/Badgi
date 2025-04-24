import { useState } from 'react';
import { BrowserRouter as Router, Route, Routes, Navigate, Outlet } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import Login from './sreens/Auth/Login/Login';
import NewName from './sreens/Auth/Register/newName/newName';
import NewPassword from './sreens/Auth/Register/newPassword/newPassword';
import NewEmail from './sreens/Auth/Register/newEmail/newEmail';
import NewEmailConfirm from './sreens/Auth/Register/newEmailConfirm/newEmailConfirm';
import HomePage from './sreens/HomePage/HomePage';
import Sidebar from './components/Sidebar/Sidebar';
import Header from './components/Header/Header';
import Profile from './sreens/Profile/Profile';
import Settings from './sreens/Settings/Settings';
import Notifications from './sreens/Notifications/Notifications';
import Documents from './sreens/Documents/Documents';
import Calendar from './sreens/Calendar/Calendar';
import Messages from './sreens/Messages/Messages';
import Projects from './sreens/Projects/Projects';

const ProtectedLayout = () => {
  const { isAuthenticated } = useAuth();
  
  if (!isAuthenticated) return <Navigate to="/login" replace />;

  return (
    <div className="app-container">
      <Header />
      <Sidebar />
      <div className="main-content">
        <Outlet />
      </div>
    </div>
  );
};

const AppRoutes = () => {
  const { isAuthenticated } = useAuth();

  return (
      <Routes>
      <Route path="/login" element={isAuthenticated ? <Navigate to="/" /> : <Login />}/>
        <Route element={<ProtectedLayout />}>
          <Route path="/" element={<HomePage />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/settings" element={<Settings />} />
          <Route path="/notifications" element={<Notifications />} />
          <Route path="/documents" element={<Documents />} />
          <Route path="/calendar" element={<Calendar />} />
          <Route path="/messages" element={<Messages />} />
          <Route path="/projects" element={<Projects />} />
        </Route>

        <Route path="/register">
          <Route index element={<Navigate to="name" />} />
          <Route path="name" element={<NewName />} />
          <Route path="password" element={<NewPassword />} />
          <Route path="email" element={<NewEmail />} />
          <Route path="confirm" element={<NewEmailConfirm />} />
        </Route>
      </Routes>
  );
};

export default function App() {
  return (
    <Router>
      <AuthProvider>
        <AppRoutes />
      </AuthProvider>
    </Router>
  );
}