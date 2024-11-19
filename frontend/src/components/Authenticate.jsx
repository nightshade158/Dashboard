import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios'; // Import axios for making API calls
import PasswordInput from './PasswordInput';

const Authenticate = () => {
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

        // Check if the user is an admin or not
        if (response.data.isadmin) {
          navigate("/admin"); // Redirect to admin dashboard
        } else {
          navigate("/user"); // Redirect to user dashboard
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
    <>
     {/* Two button shining */}
{/*       <div className="absolute top-4 right-4 flex flex-col gap-4">
        <Link className='absolute top-20 right-4 overflow-hidden rounded-lg px-20 py-6' to="/">
          <span className='absolute inset-px flex items-center justify-center rounded-lg bg-black bg-gradient-to-t from-neutral-800 text-neutral-50'>Home</span>
          <span aria-hidden className='absolute inset-0 z-0 scale-x-[2.0] blur before:absolute before:inset-0 before:top-1/2 before:aspect-square before:animate-ping before:bg-gradient-to-r before:from-purple-700 before:via-red-500 before:to-amber-400'/>
        </Link>
        <Link className='absolute top-4 right-4 overflow-hidden rounded-lg px-20 py-6' to="/admin">
          <span className='absolute inset-px flex items-center justify-center rounded-lg bg-black bg-gradient-to-t from-neutral-800 text-neutral-50'>Admin</span>
          <span aria-hidden className='absolute inset-0 z-0 scale-x-[2.0] blur before:absolute before:inset-0 before:top-1/2 before:aspect-square before:animate-ping before:bg-gradient-to-r before:from-purple-700 before:via-red-500 before:to-amber-400'/>
        </Link>
      </div> */}
      <div className="flex items-center justify-center mt-28">
        <div className="w-96 border rounded bg-white px-7 py-10">
          <form onSubmit={handleLogin}>
            <h4 className="text-2xl mb-7">Login</h4>

            <input 
              type="text" 
              placeholder="Username" // Changed from Email to Username
              className="input-box" 
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
            <p className="text-sm text-center mt-4">
              Not registered yet? <Link to="/signUp" className="font-medium text-primary underline">
                Create an Account
              </Link>
            </p>
          </form>
        </div>
      </div>
    </>
  );
};

export default Authenticate;