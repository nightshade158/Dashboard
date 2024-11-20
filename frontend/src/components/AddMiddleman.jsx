import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { assets } from '../assets/assets';
import { Link, useNavigate } from 'react-router-dom';
import { FaRegEye, FaRegEyeSlash } from "react-icons/fa6";

const AddMiddleman = () => {
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [features, setFeatures] = useState({
    manageFoods: false,
    getDailyOrders: false,
    getWeeklySales: false,
  });
  const [existingMiddlemen, setExistingMiddlemen] = useState([]);
  const [errorMessage, setErrorMessage] = useState('');
  const [isShowPassword, setIsShowPassword] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedMiddleman, setSelectedMiddleman] = useState(null);
  const [selectedFeatures, setSelectedFeatures] = useState([]);
  const availableFeatures = ['manageFoods', 'getDailyOrders', 'getWeeklySales'];
  const navigate = useNavigate();

  useEffect(() => {
    const fetchMiddlemen = async () => {
      try {
        const response = await axios.get('http://localhost:5000/api/users/middlemen');
        console.log('Fetched middlemen:', response.data);
        setExistingMiddlemen(response.data);
      } catch (error) {
        console.error('Error fetching middlemen:', error);
      }
    };
    fetchMiddlemen();
  }, []);

  const handleCheckboxChange = (e) => {
    setFeatures({ ...features, [e.target.name]: e.target.checked });
  };

  const toggleShowPassword = () => {
    setIsShowPassword(!isShowPassword);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMessage('');
    try {
      const response = await axios.post('http://localhost:5000/api/users/addmiddleman', {
        username,
        email,
        password,
        features: Object.keys(features).filter(feature => features[feature]),
      });

      if (response.status === 201) {
        alert('Middleman added successfully');
        setUsername('');
        setEmail('');
        setPassword('');
        setFeatures({
          manageFoods: false,
          getDailyOrders: false,
          getWeeklySales: false,
        });
        navigate('/admin');
        const updatedMiddlemenResponse = await axios.get('http://localhost:5000/api/users/middlemen');
        setExistingMiddlemen(updatedMiddlemenResponse.data);
      } else {
        setErrorMessage('Failed to add middleman, please try again.');
      }
    } catch (error) {
      console.error('Error adding middleman:', error);
      if (error.response && error.response.data) {
        setErrorMessage(error.response.data.message || 'Failed to add middleman');
      } else {
        setErrorMessage('Failed to add middleman');
      }
    }
  };

  const handleEditFeatures = (middleman) => {
    setSelectedMiddleman(middleman);
    setSelectedFeatures(middleman.features || []);
    setModalVisible(true);
  };

  const handleFeatureChange = (feature) => {
    setSelectedFeatures((prev) => {
      if (prev.includes(feature)) {
        return prev.filter(f => f !== feature);
      } else {
        return [...prev, feature];
      }
    });
  };

  const confirmFeatureUpdate = async () => {
    if (selectedMiddleman) {
      try {
        const response = await axios.post('http://localhost:5000/api/users/editmiddlefeatures', {
          username: selectedMiddleman.username,
          features: selectedFeatures,
        });

        if (response.status === 200) {
          alert('Middleman features updated successfully');
          const updatedMiddlemenResponse = await axios.get('http://localhost:5000/api/users/middlemen');
          setExistingMiddlemen(updatedMiddlemenResponse.data);
          setModalVisible(false);
        } else {
          setErrorMessage('Failed to update middleman features, please try again.');
        }
      } catch (error) {
        console.error('Error updating middleman features:', error);
        setErrorMessage('Failed to update middleman features');
      }
    }
  };

  return (
    <div style={{
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
          <span aria-hidden className='absolute inset-0 z-0 scale-x-[2.0] blur before:absolute before:inset-0 before:top-1/2 before:aspect-square before:animate-ping before:bg-gradient-to-r before:from-purple-700 before:via-red-500 before:to-amber-400' />
        </Link>
      </div>

      <form
        onSubmit={handleSubmit}
        className="bg-gray-800 bg-opacity-80 p-8 rounded-lg shadow-lg max-w-md mx-auto"
      >
        <h2 className="text-2xl font-bold text-white mb-6 text-center">Enter Middleman details</h2>

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

        <div className="relative mb-4">
          <input
            type={isShowPassword ? "text" : "password"}
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="border border-blue-500 p-3 w-full rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400 transition duration-200"
            required
          />
          <span
            className="absolute right-3 top-1/2 transform -translate-y-1/2 cursor-pointer"
            onClick={toggleShowPassword}
          >
            {isShowPassword ? (
              <FaRegEye size={22} className="text-gray-600" />
            ) : (
              <FaRegEyeSlash size={22} className="text-gray-600" />
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

      <div className="mt-8 p-6 bg-gray-800 rounded-lg shadow-lg max-w-md mx-auto">
        <h3 className="text-3xl font-bold text-white mb-6 text-center">Existing Middlemen</h3>
        {existingMiddlemen.map((middleman) => (
          <div key={middleman.username} className="bg-gray-700 p-5 rounded-lg mb-6 shadow-md transition-transform transform hover:scale-105">
            <h4 className="text-xl font-semibold text-white capitalize">{middleman.username}</h4>
            <p className="text-gray-300 text-lg">Features: {middleman.features ? middleman.features.join(', ') : 'No features assigned'}</p>
            <button
              onClick={() => handleEditFeatures(middleman)}
              className="bg-yellow-500 hover:bg-yellow-600 text-white font-semibold px-5 py-2 rounded-lg mt-4 transition duration-200"
            >
              Update Features
            </button>
          </div>
        ))}
      </div>

      {modalVisible && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50">
          <div className="bg-white p-6 rounded-lg shadow-lg max-w-md w-full">
            <h3 className="text-xl font-bold mb-4">Edit Features for {selectedMiddleman.username}</h3>
            {availableFeatures.map((feature) => (
              <label key={feature} className="flex items-center mb-2">
                <input
                  type="checkbox"
                  checked={selectedFeatures.includes(feature)}
                  onChange={() => handleFeatureChange(feature)}
                  className="mr-2"
                />
                {feature.charAt(0).toUpperCase() + feature.slice(1).replace(/([A-Z])/g, ' $1')}
              </label>
            ))}
            <div className="flex justify-between mt-4">
              <button
                onClick={() => setModalVisible(false)}
                className="bg-red-500 hover:bg-red-700 text-white font-semibold px-4 py-2 rounded-lg"
              >
                Cancel
              </button>
              <button
                onClick={confirmFeatureUpdate}
                className="bg-blue-600 hover:bg-blue-700 text-white font-semibold px-4 py-2 rounded-lg"
              >
                Confirm
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AddMiddleman;