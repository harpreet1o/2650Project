import React, { useContext } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { UserContext } from '../context/UserContext';
import axios from 'axios';
import { FaUser } from 'react-icons/fa';
import { SiLichess } from "react-icons/si";

const Navbar = () => {
  const { user, setUser } = useContext(UserContext);
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      await axios.post('http://localhost:3000/logout', { withCredentials: true });
      setUser(null);
      navigate('/login');
    } catch (err) {
      console.error('Error during logout:', err);
    }
  };

  return (
    <nav className="p-4 bg-teal-800 text-white shadow-lg">
      <div className="container mx-auto flex justify-between items-center">
        {/* Left Section - Logo and Links */}
        <div className="flex items-center space-x-6">
          <h1 className="text-2xl font-bold">
            <div className='flex items-center space-x-2'>
            <SiLichess size={32} className="text-white" />
            <Link to="/" className="hover:text-gray-200">Chess App</Link>
            </div>
          </h1>
          <Link
            to="/"
            className="px-4 py-2 rounded-md hover:bg-teal-700 transition"
          >
            Home
          </Link>
          <Link
            to="/profile"
            className="px-4 py-2 rounded-md hover:bg-teal-700 transition"
          >
            Profile
          </Link>
        </div>
        
        {/* Right Section - User Info */}
        <div className="flex items-center space-x-4">
          {user ? (
            <>
              <FaUser size={24} className="text-white" />
              <span className="text-white font-medium">{user}</span>
              <button
                onClick={handleLogout}
                className="bg-teal-700 px-4 py-2 rounded-md hover:bg-teal-600 transition"
              >
                Logout
              </button>
            </>
          ) : (
            <div className="flex items-center space-x-4">
              <Link
                to="/login"
                className="bg-teal-700 px-4 py-2 rounded-md hover:bg-teal-900 transition"
              >
                Login
              </Link>
              <Link
                to="/register"
                className="bg-teal-600 px-4 py-2 rounded-md hover:bg-teal-900 transition"
              >
                Register
              </Link>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
