import { useState, useEffect } from 'react';
import PasswordInput from './PasswordInput';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { assets } from '../assets/assets';

const SignUp = () => {
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState(null);
  const [redirecting, setRedirecting] = useState(false);

  const navigate = useNavigate();

  useEffect(() => {
    if (redirecting) {
      const timer = setTimeout(() => {
        navigate('/');
      }, 1500);
      return () => clearTimeout(timer);
    }
  }, [redirecting, navigate]);

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
      const response = await axios.post(`${import.meta.env.VITE_DOMAIN}/api/users/signup`, {
        username: username,
        email: email,
        password: password,
      });
      if (response.data && response.data.message) {
        setError(response.data.message);
        return;
      }
      // Registration successful, show redirecting screen
      setRedirecting(true);
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
      {redirecting && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          width: '100vw',
          height: '100vh',
          background: 'rgba(255,255,255,0.8)',
          zIndex: 1000,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
        }}>
          <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-blue-500 mb-6"></div>
          <div className="text-2xl font-bold text-blue-700">Redirecting to login... please wait</div>
        </div>
      )}
      <div className="flex items-center justify-center mt-28" style={{
        margin: 0,
        padding: 0,
        height: '100vh',
        backgroundImage: `url(${assets.Background})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
      }}>
        <div className="w-96 border-hidden rounded bg-transparent px-7 py-10" style={{ filter: redirecting ? 'blur(2px)' : 'none' }}>
          <form onSubmit={handleSignUp}>
            <h4 className="text-8xl font-bold mb-7 text-center">SignUp</h4>

            <input
              type="text"
              placeholder="Username"
              className="input-box bg-white"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              disabled={redirecting}
            />

            <input
              type="text"
              placeholder="Email"
              className="input-box bg-white"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              disabled={redirecting}
            />

            <PasswordInput
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              disabled={redirecting}
            />

            {error && <p className="text-red-500 text-xs pb-1">{error}</p>}

            <button type="submit" className="btn-primary" disabled={redirecting}>
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