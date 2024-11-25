import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import PasswordInput from './PasswordInput';
import { assets } from '../assets/assets';

const Authenticate = ({ onLogin }) => {
  const [user, setUser ] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState(null);
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
    try {
      const response = await axios.post("http://3.85.103.160:5000/api/users/login", {
        username: user,
        password: password,
      });

      if (response.data) {
        const token = response.data.token;
        localStorage.setItem("token", token);
        
        const isAdmin = response.data.isadmin;
        const isMiddleman = response.data.ismiddle;
        const role = isAdmin ? 'admin' : isMiddleman ? 'middleman' : 'user';

        onLogin(role);

        if (isMiddleman) {
          const featuresResponse = await axios.get(`http://3.85.103.160:5000/api/users/middlemanfeatures`, { params: { username: user } });
          const features = featuresResponse.data.features;

          navigate("/middleman", { state: { features } });
        } else if (isAdmin) {
          navigate("/admin");
        } else {
          navigate("/user");
        }
      }
    } catch (error){
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
      height: '100vh',
      backgroundImage: `url(${assets.Background})`,
      backgroundSize: 'cover',
      backgroundPosition: 'center',
      backgroundRepeat: 'repeat',
      backgroundAttachment: 'scroll',
    }}>
      <div className="w-96 border-hidden rounded bg-transparent px-7 py-10">
        <form onSubmit={handleLogin}>
          <h4 className="text-8xl font-bold mb-7 text-center">Login</h4>

          <input
            type="text"
            placeholder="Username"
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