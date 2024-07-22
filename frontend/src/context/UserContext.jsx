import React, { createContext, useState, useEffect } from 'react';
import axios from 'axios';
import socket from '../socket';

const UserContext = createContext();

const UserProvider = ({ children }) => {
  const [user, setUser] = useState(null);

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const res = await axios.get('http://localhost:3000/current_user', { withCredentials: true });
        const user = res.data
        setUser(user);
        if (user)
          socket.emit("username", user.name);
      } catch (err) {
        console.error(err);
      }
    };

    fetchUser();
  }, []);

  return (
    <UserContext.Provider value={{ user, setUser }}>
      {children}
    </UserContext.Provider>
  );
};

export { UserContext, UserProvider };
