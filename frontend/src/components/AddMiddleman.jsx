import React, { useState } from 'react';
import axios from 'axios';
import { assets } from '../assets/assets';
import { Link, useNavigate } from 'react-router-dom';
import { FaRegEye, FaRegEyeSlash } from "react-icons/fa6"; // Import the eye icons

const AddMiddleman = () => {
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [features, setFeatures] = useState({
    manageFoods: false,
    getDailyOrders: false,
    getWeeklySales: false,
  });
  const [errorMessage, setErrorMessage] = useState('');
  const [isShowPassword, setIsShowPassword] = useState(false); // State for password visibility
  const navigate = useNavigate();

  const handleCheckboxChange = (e) => {
    setFeatures({ ...features, [e.target.name]: e.target.checked });
  };

  const toggleShowPassword = () => {
    setIsShowPassword(!isShowPassword); // Toggle password visibility
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMessage(''); // Reset error message
    try {
      const response = await axios.post('http://localhost:5000/api/users/addmiddleman', {
        username,
        email,
        password,
        features: Object.keys(features).filter(feature => features[feature]), // Ensure features is an array
      });

      // Check if the response status is 201 (created)
      if (response.status === 201) {
        alert('Middleman added successfully');
        // Reset the form fields
        setUsername('');
        setEmail('');
        setPassword('');
        setFeatures({
          manageFoods: false,
          getDailyOrders: false,
          getWeeklySales: false,
        });
        navigate('/admin');
      } else {
        setErrorMessage('Failed to add middleman, please try again.');
      }
    } catch (error) {
      console.error('Error adding middleman:', error);
      // Check for specific error messages from the response
      if (error.response && error.response.data) {
        setErrorMessage(error.response.data.message || 'Failed to add middleman');
      } else {
        setErrorMessage('Failed to add middleman');
      }
    }
  };

  return (
    <div style={{
      margin: 0,
      padding: 0,
      height: '100vh',
      backgroundImage: `url(${assets.admin})`,
      backgroundSize: 'cover',
      backgroundPosition: 'center',
      backgroundRepeat: 'no-repeat',
      backgroundAttachment: 'scroll',
    }}>
      <h2 className="text-3xl font-bold mb-6 text-white text-center">Add Middleman</h2>
      <div className="absolute top-1 right-96 flex flex-col">
                <Link className='relative overflow-hidden rounded-lg px-20 py-6' to="/admin">
                    <span className='absolute inset-px flex items-center justify-center rounded-lg bg-black bg-gradient-to-t from-neutral-800 text-neutral-50'>Go to Admin</span>
                    <span aria-hidden className='absolute inset-0 z-0 scale-x-[2.0] blur before:absolute before:inset-0 before:top-1/2 before:aspect-square before:animate-ping before:bg-gradient-to-r before:from-purple-700 before:via-red-500 before:to-amber-400'/>
                </Link>
            </div>
      <form 
        onSubmit={handleSubmit} 
        className="bg-gray-800 bg-opacity-80 p-8 rounded-lg shadow-lg max-w-md mx-auto" // Centered with max width
      >
        <h2 className="text-2xl font-bold text-white mb-6 text-center">Enter Middleman details</h2> {/* Added a title for better structure */}
        
        <input
          type="text"
          placeholder="Username"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          className="border border-blue-500 p-3 mb-4 w-full rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400 transition duration-200"
          required
        />
        
        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="border border-blue-500 p-3 mb-4 w-full rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400 transition duration-200"
          required
        />
        
        <div className="relative mb-4"> {/* Added a wrapper for the password input */}
          <input
            type={isShowPassword ? "text" : "password"} // Toggle input type based on state
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="border border-blue-500 p-3 w-full rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400 transition duration-200"
            required
          />
          <span
            className="absolute right-3 top-1/2 transform -translate-y-1/2 cursor-pointer" // Position the icon
            onClick={toggleShowPassword} // Toggle password visibility on click
          >
            {isShowPassword ? (
              <FaRegEye size={22} className="text-gray-600" /> // Show eye icon
            ) : (
              <FaRegEyeSlash size={22} className="text-gray-600" /> // Show eye slash icon
            )}
          </span>
        </div>
        
        <div className="mb-4">
          <h3 className="font-bold text-white mb-2">Select Features:</h3>
          <label className="flex items-center text-white mb-2">
            <input
              type="checkbox"
              name="manageFoods"
              checked={features.manageFoods}
              onChange={handleCheckboxChange}
              className="mr-2"
            /> 
            Manage Food Items
          </label>
          <label className="flex items-center text-white mb-2">
            <input
              type="checkbox"
              name="getDailyOrders"
              checked={features.getDailyOrders}
              onChange={handleCheckboxChange}
              className="mr-2"
            /> 
            Get Daily Order Summary
          </label>
          <label className="flex items-center text-white mb-2">
            <input
              type="checkbox"
              name="getWeeklySales"
              checked={features.getWeeklySales}
              onChange={handleCheckboxChange}
              className="mr-2"
            /> 
            Get Weekly Sales Report
          </label>
        </div>
        
        <button 
          type="submit" 
          className="bg-blue-600 hover:bg-blue-700 text-white font-semibold px-6 py-3 rounded-lg shadow-md transition duration-200 transform hover:scale-105 w-full"
        >
          Add Middleman
        </button>
        
        {errorMessage && <p className="text-red-500 mt-4 text-center">{errorMessage}</p>}
      </form>
    </div>
  );
};

export default AddMiddleman;