import React, { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext(null);

const ADMIN_PASSWORD = 'admin123';
const USERS_KEY = 'coreside_users';
const SESSION_KEY = 'coreside_session';

export function AuthProvider({ children }) {
  const [session, setSession] = useState(() => {
    try {
      const saved = localStorage.getItem(SESSION_KEY);
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });

  // Simpan session ke localStorage setiap kali berubah
  useEffect(() => {
    if (session) {
      localStorage.setItem(SESSION_KEY, JSON.stringify(session));
    } else {
      localStorage.removeItem(SESSION_KEY);
    }
  }, [session]);

  // Ambil daftar warga terdaftar
  const getUsers = () => {
    try {
      return JSON.parse(localStorage.getItem(USERS_KEY) || '[]');
    } catch {
      return [];
    }
  };

  // Register warga baru
  const register = (nama, email, password) => {
    const users = getUsers();
    if (users.find(u => u.email === email)) {
      return { success: false, message: 'Email sudah terdaftar.' };
    }
    const newUser = { id: Date.now(), nama, email, password, role: 'warga' };
    localStorage.setItem(USERS_KEY, JSON.stringify([...users, newUser]));
    // Auto-login setelah register
    const sess = { id: newUser.id, nama, email, role: 'warga' };
    setSession(sess);
    return { success: true };
  };

  // Login (warga atau admin)
  const login = (email, password, asAdmin = false) => {
    if (asAdmin) {
      if (password === ADMIN_PASSWORD) {
        const sess = { id: 'admin', nama: 'Administrator', email: 'admin@coreside.id', role: 'admin' };
        setSession(sess);
        return { success: true };
      }
      return { success: false, message: 'Password admin salah.' };
    }
    // Login warga
    const users = getUsers();
    const user = users.find(u => u.email === email && u.password === password);
    if (user) {
      const sess = { id: user.id, nama: user.nama, email: user.email, role: 'warga' };
      setSession(sess);
      return { success: true };
    }
    return { success: false, message: 'Email atau password salah.' };
  };

  const logout = () => setSession(null);

  return (
    <AuthContext.Provider value={{ session, login, logout, register }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
