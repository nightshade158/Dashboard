import React from 'react';
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import AdminDashboard from './components/AdminDashboard';
import UserDashboard from './components/UserDashboard';
import Authenticate from './components/Authenticate';
import SignUp from './components/SignUp';

const App = () => {
  return (
    <Router>
        <Routes>
          <Route path="/admin" element={<AdminDashboard />} />
          <Route path="/" element={<UserDashboard />} />
          <Route path="/auth" element={<Authenticate />} />
          <Route path="/signup" element={<SignUp />} />
        </Routes>
    </Router>
  );
};

export default App;