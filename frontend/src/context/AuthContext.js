import React, { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios';

const AuthContext = createContext(null);


const API = process.env.REACT_APP_API_URL || "http://192.168.7.2:5000/api";

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('lifeqr_token');
    const userData = localStorage.getItem('lifeqr_user');
    if (token && userData) {
      setUser(JSON.parse(userData));
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    }
    setLoading(false);
  }, []);

  const login = async (email, password) => {
    const res = await axios.post(`${API}/auth/login`, { email, password });
    const { token, user: userData } = res.data;
    localStorage.setItem('lifeqr_token', token);
    localStorage.setItem('lifeqr_user', JSON.stringify(userData));
    axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    setUser(userData);
    return userData;
  };

  // ✅ FIXED register function
  const register = async (email, password, full_name) => {
    const res = await axios.post(`${API}/auth/register`, {
      email,
      password,
      full_name,
    });

    const { token, user: userData } = res.data;

    // ✅ Token save karo
    localStorage.setItem('lifeqr_token', token);
    localStorage.setItem('lifeqr_user', JSON.stringify(userData));
    axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;

    // ✅ User set karo
    setUser(userData);

    return userData;
  };

  const logout = () => {
    localStorage.removeItem('lifeqr_token');
    localStorage.removeItem('lifeqr_user');
    delete axios.defaults.headers.common['Authorization'];
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, login, register, logout, loading, API }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);