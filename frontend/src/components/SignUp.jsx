import React, { useState } from 'react';
import PasswordInput from './PasswordInput';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';

const SignUp = () => {
  const [username, setUsername] = useState(""); // Added username state
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState(null);

  const navigate = useNavigate();

  const validateEmail = (email) => {
    const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return regex.test(email);
  };

  const handleSignUp = async (e) => {
    e.preventDefault();

    if (!username) {
      setError("Please enter your username");
      return;
    }

    if (!email) {
      setError("Please enter your email");
      return;
    }

    if (!validateEmail(email)) {
      setError("Please enter a valid email address.");
      return;
    }

    if (!password) {
      setError("Please enter the password");
      return;
    }

    setError('');

    // Signup API call
    try {
      const response = await axios.post("http://localhost:5000/api/users/signup", {
        username: username, // Send username
        email: email,
        password: password,
      });
      // Handle successful registration response
      if (response.data && response.data.message) {
        setError(response.data.message);
        return;
      }
      if (response.data && response.data.authId) {
        localStorage.setItem("token", response.data.authId); // Store authId
        navigate('/auth');
      }
    } catch (error) {
      // Handle Signup error
      if (error.response && error.response.data && error.response.data.message) {
        setError(error.response.data.message);
      } else {
        setError("An unexpected error occurred. Please try again.");
      }
    }
  };

  return (
    <>
      <div className="flex items-center justify-center mt-28">
        <div className="w-96 border rounded bg-white px-7 py-10">
          <form onSubmit={handleSignUp}>
            <h4 className="text-2xl mb-7">SignUp</h4>

            <input 
              type="text" 
              placeholder="Username" 
              className="input-box" 
              value={username}
              onChange={(e) => setUsername(e.target.value)}
            />

            <input 
              type="text" 
              placeholder="Email" 
              className="input-box" 
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />

            <PasswordInput 
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />

            {error && <p className="text-red-500 text-xs pb-1">{error}</p>}

            <button type="submit" className="btn-primary">
              Create Account
            </button>
            <p className="text-sm text-center mt-4">
              Already have an account? <Link to="/auth" className="font-medium text-primary underline">
                Login
              </Link>
            </p>
          </form>
        </div>
      </div>
    </>
  );
};

export default SignUp;