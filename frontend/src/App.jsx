import React from 'react';
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import AdminDashboard from './components/AdminDashboard';
import UserDashboard from './components/UserDashboard';

const App = () => {
  return (
    <Router>
      <div className="min-h-screen bg-gray-100 p-4 relative">
      <div className="absolute top-4 right-4 flex flex-col gap-4">
  <Link className='bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded' to="/">Home</Link>
  <Link className='bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded' to="/admin">Admin</Link>
        </div>
        <Routes>
          <Route path="/admin" element={<AdminDashboard />} />
          <Route path="/" element={<UserDashboard />} />
        </Routes>
      </div>
    </Router>
  );
};

export default App;