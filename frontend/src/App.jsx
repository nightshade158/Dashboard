import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import AdminDashboard from './components/AdminDashboard';
import UserDashboard from './components/UserDashboard';
import Authenticate from './components/Authenticate';
import SignUp from './components/SignUp';
import AddMiddleman from './components/AddMiddleman'; // Import AddMiddleman component
import MiddlemanDashboard from './components/MiddlemanDashboard';

const App = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false); // Simulated authentication state
  const [userRole, setUserRole] = useState(null); // Simulated user role

  const handleLogin = (role) => {
    setIsAuthenticated(true);
    setUserRole(role);
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    setUserRole(null);
  };

  return (
    <Router>
      <Routes>
        <Route path="/" element={<Authenticate /* onLogin={handleLogin} */ />} />
        <Route path="/signup" element={<SignUp />} />
        <Route path="/admin" element={<AdminDashboard/>}/>
        <Route path="/user" element={<UserDashboard/>}/>
        <Route path="/middleman" element={<MiddlemanDashboard/>}/>
        <Route path="/addmiddleman" element={<AddMiddleman/>}/>
{/*         <Route 
          path="/admin" 
          element={isAuthenticated && userRole === 'admin' ? <AdminDashboard onLogout={handleLogout} /> : <Navigate to="/" />} 
        />
        <Route 
          path="/user" 
          element={isAuthenticated && userRole === 'user' ? <UserDashboard onLogout={handleLogout} /> : <Navigate to="/" />} 
        />
        <Route 
          path="/addmiddleman" 
          element={isAuthenticated && userRole === 'admin' ? <AddMiddleman /> : <Navigate to="/" />} 
        /> */}
      </Routes>
    </Router>
  );
};

export default App;