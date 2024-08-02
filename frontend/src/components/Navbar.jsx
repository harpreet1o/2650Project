import React, { useContext } from 'react';
import { Link } from 'react-router-dom';
import { UserContext } from '../context/UserContext';
import axios from 'axios';

const Navbar = () => {
  const { user, setUser } = useContext(UserContext);

  const handleLogout = async () => {
    try {
      await axios.post('http://localhost:3000/logout', {}, { withCredentials: true });
      setUser(null);
    } catch (err) {
      console.error('Error during logout:', err);
    }
  };

  return (
    <nav className="p-4 bg-blue-500 text-white">
      <div className="container mx-auto flex justify-between items-center">
        <h1 className="text-xl font-bold">
          <Link to="/">Chess App</Link>
        </h1>
        <div>
          {user ? (
            <>
              <span className="mr-4">Hi, {user}</span>
              <button onClick={handleLogout} className="bg-red-500 px-3 py-1 rounded">
                Logout
              </button>
            </>
          ) : (
            <>
              <Link to="/login" className="bg-red-500 px-3 py-1 rounded mr-4">Login</Link>
              <Link to="/register" className="bg-green-500 px-3 py-1 rounded">Register</Link>
            </>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
