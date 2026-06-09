import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { ProtectedRoute } from './components/ProtectedRoute';
import Navbar from './components/Navbar';
import HomePage from './pages/HomePage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import LaporanPage from './pages/LaporanPage';
import AdminPage from './pages/AdminPage';

function Layout({ children }) {
  return (
    <>
      <Navbar />
      {children}
    </>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          {/* Public routes */}
          <Route path="/" element={<Layout><HomePage /></Layout>} />
          <Route path="/login" element={<Layout><LoginPage /></Layout>} />
          <Route path="/register" element={<Layout><RegisterPage /></Layout>} />

          {/* Protected: warga only */}
          <Route path="/laporan" element={
            <Layout>
              <ProtectedRoute requiredRole="warga">
                <LaporanPage />
              </ProtectedRoute>
            </Layout>
          } />

          {/* Protected: admin only */}
          <Route path="/admin" element={
            <Layout>
              <ProtectedRoute requiredRole="admin">
                <AdminPage />
              </ProtectedRoute>
            </Layout>
          } />

          {/* Fallback */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}
