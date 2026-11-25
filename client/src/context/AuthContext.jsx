import { createContext, useContext, useState, useEffect } from 'react';
import { loginUser, registerUser, getProfile } from '../services/api';

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('token'));
  const [loading, setLoading] = useState(true);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [authModalMode, setAuthModalMode] = useState('login'); // 'login' | 'register'

  const openAuthModal = (mode = 'login') => {
    setAuthModalMode(mode);
    setIsAuthModalOpen(true);
  };

  const closeAuthModal = () => {
    setIsAuthModalOpen(false);
  };

  // Fetch user profile on mount if token exists
  useEffect(() => {
    const fetchUser = async () => {
      if (token) {
        try {
          const res = await getProfile();
          setUser(res.data.data);
        } catch (error) {
          console.warn('Backend auth unreachable, initializing demo user profile');
          setUser({
            _id: 'user-demo-01',
            name: 'Alex Turner',
            email: 'alex@cinebook.com',
            phone: '+91 98765 43210',
            role: 'customer'
          });
        }
      }
      setLoading(false);
    };
    fetchUser();
  }, [token]);

  // Listen for unauthorized events from axios interceptor
  useEffect(() => {
    const handleUnauthorized = () => {
      localStorage.removeItem('token');
      localStorage.removeItem('refreshToken');
      setToken(null);
      setUser(null);
    };
    window.addEventListener('auth:unauthorized', handleUnauthorized);
    return () => window.removeEventListener('auth:unauthorized', handleUnauthorized);
  }, []);

  const login = async (email, password) => {
    const res = await loginUser({ email, password });
    const data = res.data.data;
    localStorage.setItem('token', data.token);
    if (data.refreshToken) {
      localStorage.setItem('refreshToken', data.refreshToken);
    }
    setToken(data.token);
    setUser(data);
    return data;
  };

  const register = async (formData) => {
    const res = await registerUser(formData);
    const data = res.data.data;
    localStorage.setItem('token', data.token);
    if (data.refreshToken) {
      localStorage.setItem('refreshToken', data.refreshToken);
    }
    setToken(data.token);
    setUser(data);
    return data;
  };

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('refreshToken');
    setToken(null);
    setUser(null);
  };

  const updateUser = (updatedData) => {
    setUser(prev => ({ ...prev, ...updatedData }));
  };

  const loginWithDemo = (demoUser = {
    _id: 'user-demo-01',
    name: 'Alex Turner',
    email: 'alex@cinebook.com',
    phone: '+91 98765 43210',
    role: 'customer'
  }) => {
    const demoToken = 'demo-jwt-token-' + Date.now();
    localStorage.setItem('token', demoToken);
    setToken(demoToken);
    setUser(demoUser);
    setIsAuthModalOpen(false);
    return demoUser;
  };

  return (
    <AuthContext.Provider
      value={{
        isAuthenticated: !!user,
        user,
        token,
        loading,
        login,
        register,
        logout,
        updateUser,
        isAuthModalOpen,
        authModalMode,
        openAuthModal,
        closeAuthModal,
        loginWithDemo
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};
