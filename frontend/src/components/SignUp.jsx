import React, { useState } from 'react';
import PasswordInput from './PasswordInput';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { assets } from '../assets/assets';

const SignUp = () => {
  const [username, setUsername] = useState("");
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

    try {
      const response = await axios.post("http://localhost:5000/api/users/signup", {
        username: username,
        email: email,
        password: password,
      });
      if (response.data && response.data.message) {
        setError(response.data.message);
        return;
      }
      if (response.data && response.data.authId) {
        localStorage.setItem("token", response.data.authId);
        navigate('/auth');
      }
    } catch (error) {
      if (error.response && error.response.data && error.response.data.message) {
        setError(error.response.data.message);
      } else {
        setError("An unexpected error occurred. Please try again.");
      }
    }
  };

  return (
    <>
      <div className="flex items-center justify-center mt-28" style={{
        margin: 0,
        padding: 0,
        height: '100vh',
        backgroundImage: `url(${assets.Background})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
      }}>
        <div className="w-96 border-hidden rounded bg-transparent px-7 py-10">
          <form onSubmit={handleSignUp}>
            <h4 className="text-8xl font-bold mb-7 text-center">SignUp</h4>

            <input
              type="text"
              placeholder="Username"
              className="input-box bg-white"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
            />

            <input
              type="text"
              placeholder="Email"
              className="input-box bg-white"
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
            <p className="text-2xl font-bold text-slate-500 text-center mt-4">
              Already have an account? <Link to="/" className="font-medium text-primary underline">
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