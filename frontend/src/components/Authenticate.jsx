import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios'; // Import axios for making API calls
import PasswordInput from './PasswordInput';
import { assets } from '../assets/assets';

const Authenticate = ({ onLogin }) => {
  const [user, setUser ] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState(null);
  const navigate = useNavigate(); // Initialize the navigate function

  const handleLogin = async (e) => {
    e.preventDefault();

    if (!user) {
      setError("Please enter a valid username.");
      return;
    }

    if (!password) {
      setError("Please enter the password");
      return;
    }

    setError("");

    // Login API call
    try {
      const response = await axios.post("http://localhost:5000/api/users/login", {
        username: user, // Assuming the backend expects 'username'
        password: password,
      });

      // Handle successful login response
      if (response.data) {
        const token = response.data.token; // Assuming the backend returns a token
        localStorage.setItem("token", token); // Store the token in local storage

        const isAdmin = response.data.isadmin; // Check if user is admin
        const isMiddleman = response.data.ismiddle; // Check if user is middleman

        // Fetch middleman features if the user is a middleman
        if (isMiddleman) {
          const featuresResponse = await axios.get(`http://localhost:5000/api/users/middlemanfeatures`, { params: { username: user } });
          const features = featuresResponse.data.features; // Assuming the features are in response.data.features

          // Optionally, you could pass the features to the MiddlemanDashboard through context or state management
          // Redirect to middleman dashboard with features
          navigate("/middleman", { state: { features } }); // Redirect and pass features in state
        } else if (isAdmin) {
          // Redirect to admin dashboard
          navigate("/admin");
        } else if (!isAdmin && !isMiddleman) {
          // Redirect to user dashboard
          navigate("/user");
        }
      }
    } catch (error) {
      // Handle Login error
      if (error.response && error.response.data && error.response.data.message) {
        setError(error.response.data.message);
      } else {
        setError("An unexpected error occurred. Please try again.");
      }
    }
  };

  return (
      <div className="flex items-center justify-center mt-28" style={{
        margin: 0,
        padding: 0,
        height: '100vh', // Make sure the div takes full height
        backgroundImage: `url(${assets.Background})`, // Set your background image
        backgroundSize: 'cover', // Cover the entire viewport
        backgroundPosition: 'center', // Center the background image
        backgroundRepeat: 'repeat',
        backgroundAttachment: 'scroll',
      }}>
        <div className="w-96 border-hidden rounded bg-transparent px-7 py-10"> {/* Added translucent-bg class */}
          <form onSubmit={handleLogin}>
            <h4 className="text-8xl font-bold mb-7 text-center">Login</h4>

            <input 
              type="text" 
              placeholder="Username" // Changed from Email to Username
              className="input-box bg-white" 
              value={user}
              onChange={(e) => setUser (e.target.value)}
            />

            <PasswordInput 
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />

            {error && <p className="text-red-500 text-xs pb-1">{error}</p>}

            <button type="submit" className="btn-primary">
              Login
            </button>
            <p className="text-2xl font-bold text-slate-500 text-center mt-4">
              Not registered yet? <Link to="/signUp" className="font-medium text-primary underline">
                Create an Account
              </Link>
            </p>
          </form>
        </div>
      </div>
  );
};

export default Authenticate;