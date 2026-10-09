import React, { createContext, useContext, useState, useEffect } from 'react';
import api from '../services/api.js';

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('quiz_token') || null);
  const [loading, setLoading] = useState(true);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [authModalMode, setAuthModalMode] = useState('login'); // 'login' | 'register'
  
  // Dynamic Semester State
  const [semesters, setSemesters] = useState([]);
  const [currentSemester, setCurrentSemester] = useState(null);

  const fetchSemestersList = async (userRecord) => {
    try {
      const res = await api.getSemesters();
      if (res.success && res.semesters?.length > 0) {
        setSemesters(res.semesters);
        
        // If Student: ALWAYS lock to their assigned semester from database
        if (userRecord && userRecord.role === 'student' && userRecord.semester_id) {
          const userSem = res.semesters.find(s => s.id === userRecord.semester_id);
          if (userSem) {
            setCurrentSemester(userSem);
            return;
          }
        }
        
        // If Admin or Guest: pick saved semester or first
        const savedSemId = localStorage.getItem('selected_semester_id');
        if (savedSemId) {
          const found = res.semesters.find(s => String(s.id) === String(savedSemId));
          if (found) {
            setCurrentSemester(found);
            return;
          }
        }

        setCurrentSemester(res.semesters[0]);
      }
    } catch (err) {
      console.warn('[AuthContext] Error fetching semesters:', err.message);
    }
  };

  useEffect(() => {
    async function loadUser() {
      const storedToken = localStorage.getItem('quiz_token');
      let loadedUser = null;
      if (storedToken) {
        try {
          const res = await api.getMe();
          if (res.success && res.user) {
            setUser(res.user);
            setToken(storedToken);
            loadedUser = res.user;
          } else {
            logout();
          }
        } catch (err) {
          console.warn('[AuthContext] Session expired or backend unreachable:', err.message);
        }
      }
      await fetchSemestersList(loadedUser);
      setLoading(false);
    }

    loadUser();
  }, []);

  const selectSemester = async (sem) => {
    const semObj = typeof sem === 'object' ? sem : semesters.find(s => s.name === sem || String(s.id) === String(sem));
    if (semObj) {
      // Only admins can switch active semester
      if (user?.role === 'admin' || !user) {
        setCurrentSemester(semObj);
        localStorage.setItem('selected_semester_id', semObj.id);
      }
    }
  };

  const login = async (email, password) => {
    const res = await api.login(email, password);
    if (res.success && res.token) {
      localStorage.setItem('quiz_token', res.token);
      setToken(res.token);
      setUser(res.user);
      setIsAuthModalOpen(false);
      await fetchSemestersList(res.user);
      return res.user;
    }
    throw new Error(res.message || 'Login failed');
  };

  const register = async (name, email, password, semester_id, college) => {
    const res = await api.register(name, email, password, semester_id, college);
    if (res.success && res.token) {
      localStorage.setItem('quiz_token', res.token);
      setToken(res.token);
      setUser(res.user);
      setIsAuthModalOpen(false);
      await fetchSemestersList(res.user);
      return res.user;
    }
    throw new Error(res.message || 'Registration failed');
  };

  const logout = () => {
    localStorage.removeItem('quiz_token');
    setToken(null);
    setUser(null);
  };

  const updateProfile = async (profileData) => {
    const res = await api.updateProfile(profileData);
    if (res.success && res.user) {
      setUser(res.user);
      return res.user;
    }
    throw new Error(res.message || 'Failed to update profile');
  };

  const openAuthModal = (mode = 'login') => {
    setAuthModalMode(mode);
    setIsAuthModalOpen(true);
  };

  const closeAuthModal = () => {
    setIsAuthModalOpen(false);
  };

  const value = {
    user,
    token,
    loading,
    isAuthenticated: !!user,
    isAdmin: user?.role === 'admin',
    semesters,
    currentSemester,
    selectSemester,
    refreshSemesters: () => fetchSemestersList(user),
    login,
    register,
    logout,
    updateProfile,
    isAuthModalOpen,
    authModalMode,
    openAuthModal,
    closeAuthModal
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

export default AuthContext;
