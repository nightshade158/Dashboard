import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import PasswordInput from './PasswordInput';
import { assets } from '../assets/assets';

const Authenticate = ({ onLogin }) => {
  const [user, setUser ] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

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
    setLoading(true);
    try {
      const response = await axios.post(`${import.meta.env.VITE_DOMAIN}/api/users/login`, {
        username: user,
        password: password,
      });

      if (response.data) {
        const token = response.data.token;
        localStorage.setItem("token", token);
        
        const isAdmin = response.data.isadmin;
        const isMiddleman = response.data.ismiddle;
        const role = isAdmin ? 'admin' : isMiddleman ? 'middleman' : 'user';

        if (typeof onLogin === 'function') onLogin(role);

        if (isMiddleman) {
          const featuresResponse = await axios.get(`${import.meta.env.VITE_DOMAIN}/api/users/middlemanfeatures`, { params: { username: user } });
          const features = featuresResponse.data.features;

          setLoading(false);
          navigate("/middleman", { state: { features } });
        } else if (isAdmin) {
          setLoading(false);
          navigate("/admin");
        } else {
          setLoading(false);
          navigate("/user");
        }
        return;
      }
    } catch (error){
      if (error.response && error.response.data && error.response.data.message) {
        setError(error.response.data.message);
      } else {
        setError("An unexpected error occurred. Please try again.");
      }
      setLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center mt-28" style={{
      margin: 0,
      padding: 0,
      height: '100vh',
      backgroundImage: `url(${assets.Background})`,
      backgroundSize: 'cover',
      backgroundPosition: 'center',
      backgroundRepeat: 'repeat',
      backgroundAttachment: 'scroll',
      position: 'relative',
    }}>
      {loading && (
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
          <div className="text-2xl font-bold text-blue-700">Verifying credentials...</div>
        </div>
      )}
      <div className="w-96 border-hidden rounded bg-transparent px-7 py-10" style={{ filter: loading ? 'blur(2px)' : 'none' }}>
        <form onSubmit={handleLogin}>
          <h4 className="text-8xl font-bold mb-7 text-center">Login</h4>

          <input
            type="text"
            placeholder="Username"
            className="input-box bg-white"
            value={user}
            onChange={(e) => setUser (e.target.value)}
            disabled={loading}
          />

          <PasswordInput
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            disabled={loading}
          />

          {error && <p className="text-red-500 text-xs pb-1">{error}</p>}

          <button type="submit" className="btn-primary" disabled={loading}>
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