import { createContext, useState, useContext, useEffect } from 'react';
import api from '../services/api';

export let AuthContext = createContext();

export let AuthProvider = ({ children }) => {
  let [user, setUser] = useState(null);
  let [loading, setLoading] = useState(true);

  useEffect(() => {
    let storedUser = localStorage.getItem('userInfo');
    let storedToken = localStorage.getItem('token');
    
    if (storedUser && storedToken) {
      try {
        setUser(JSON.parse(storedUser));
      } catch (e) {
        console.error("Corrupt local storage", e);
        localStorage.removeItem('userInfo');
        localStorage.removeItem('token');
      }
    }
    setLoading(false);
  }, []);

  let login = async (email, password) => {
    try {
      console.log("🚀 Attempting login for:", email);
      
      let response = await api.post('/auth/login', { email, password });
      
      console.log("✅ Backend Response Received:", response.data);

      let { token, user: userData } = response.data;

      if (!token) {
        console.error("❌ ERROR: No token found in response!");
        throw new Error("Server did not return a valid token");
      }
      
      if (!userData) {
        console.error("❌ ERROR: No user data found in response!");
        throw new Error("Server did not return user details");
      }

      console.log("💾 Saving to LocalStorage...");
      localStorage.setItem('token', token);
      localStorage.setItem('userInfo', JSON.stringify(userData));
      
      console.log("🔄 Updating React State...");
      setUser(userData);
      
      console.log("✨ Login Success! Redirecting soon...");
      return true;

    } catch (error) {
      console.error("🔥 LOGIN FAILED WITH ERROR:", error.message);
      console.error("Full Error Object:", error);
      throw error; 
    }
  };

  let register = async (name, email, password) => {
    try {
      let response = await api.post('/auth/register', { name, email, password });
      
      let { token, user: userData } = response.data;
      
      if (!token && response.data.data) {
         token = response.data.data.token;
         userData = response.data.data.user;
      }

      if (!token || !userData) {
        throw new Error('Registration failed: Invalid response structure');
      }

      localStorage.setItem('token', token);
      localStorage.setItem('userInfo', JSON.stringify(userData));
      setUser(userData);
      return true;
    } catch (error) {
      console.error("Register Error:", error);
      throw error;
    }
  };

  let logout = () => {
    setUser(null);
    localStorage.removeItem('token');
    localStorage.removeItem('userInfo');
    window.location.href = '/login'; 
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout }}>
      {!loading && children}
    </AuthContext.Provider>
  );
};

export let useAuth = () => useContext(AuthContext);