import React, { useState } from 'react';
import axios from 'axios';

const AddMiddleman = () => {
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [features, setFeatures] = useState({
    manageFoods: false,
    getDailyOrders: false,
    getWeeklySales: false,
    addMiddleman: false,
  });
  const [errorMessage, setErrorMessage] = useState('');

  const handleCheckboxChange = (e) => {
    setFeatures({ ...features, [e.target.name]: e.target.checked });
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
          addMiddleman: false,
        });
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
    <div className="max-w-md mx-auto p-4">
      <h2 className="text-xl font-bold mb-4">Add Middleman</h2>
      <form onSubmit={handleSubmit}>
        <input
          type="text"
          placeholder="Username"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          className="border p-2 mb-4 w-full"
          required
        />
        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="border p-2 mb-4 w-full"
          required
        />
        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="border p-2 mb-4 w-full"
          required
        />
        <div className="mb-4">
          <h3 className="font-bold">Select Features:</h3>
          <label>
            <input
              type="checkbox"
              name="manageFoods"
              checked={features.manageFoods}
              onChange={handleCheckboxChange}
            /> Manage Food Items
          </label>
          <label>
            <input
              type="checkbox"
              name="getDailyOrders"
              checked={features.getDailyOrders}
              onChange={handleCheckboxChange}
            /> Get Daily Order Summary
          </label>
          <label>
            <input
              type="checkbox"
              name="getWeeklySales"
              checked={features.getWeeklySales}
              onChange={handleCheckboxChange}
            /> Get Weekly Sales Report
          </label>
          <label>
            <input
              type="checkbox"
              name="addMiddleman"
              checked={features.addMiddleman}
              onChange={handleCheckboxChange}
            /> Add Middleman </label>
        </div>
        <button type="submit" className="bg-blue-500 text-white px-4 py-2 rounded">
          Add Middleman
        </button>
        {errorMessage && <p className="text-red-500 mt-4">{errorMessage}</p>}
      </form>
    </div>
  );
};

export default AddMiddleman;