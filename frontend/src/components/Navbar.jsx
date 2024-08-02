import React, { useContext } from 'react';
import { Link } from 'react-router-dom';
import { UserContext } from '../context/UserContext';
import axios from 'axios';

const Navbar = () => {
    const { user, setUser } = useContext(UserContext);

    const logout = async () => {
        try {
            await axios.get('http://localhost:3000/logout', { withCredentials: true });
            setUser(null);
            window.location.href = 'http://localhost:5173';
        } catch (err) {
            console.error(err.response.data);
        }
    };

    return (
        <nav className="bg-gray-800 p-4">
            <div className="container mx-auto flex justify-between items-center">
                <div className="flex items-center space-x-4 text-white">
                    <span className="text-2xl font-bold">Chess</span>
                    <Link to="/" className="text-xl">Home</Link>
                    <Link to="/profile" className="text-xl">Profile</Link>
                </div>
                <div className="flex items-center space-x-4">
                    {user ? (
                        <>
                            <span className="text-white">
                                {user.name}</span>
                            <button
                                onClick={logout}
                                className="text-white bg-red-500 hover:bg-red-700 px-3 py-2 rounded"
                            >
                                Logout
                            </button>
                        </>
                    ) : (
                        <>
                            <span className="text-white text-bold">Guest</span>
                            <Link to="/login" className="text-white bg-green-500 hover:bg-green-700 px-3 py-2 rounded">Login</Link>
                            <Link to="/register" className="text-white bg-blue-500 hover:bg-blue-700 px-3 py-2 rounded">Register</Link>
                        </>
                    )}
                </div>
            </div>
        </nav>
    );
};

export default Navbar;
