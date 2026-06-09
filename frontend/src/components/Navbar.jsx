import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Navbar() {
  const { session, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/');
    setMenuOpen(false);
  };

  const navLinks = [
    { to: '/', label: 'Peta Bencana', icon: (
      <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" d="M9 20.25H5.25A2.25 2.25 0 0 1 3 18V6.75A2.25 2.25 0 0 1 5.25 4.5H9m6 15.75h3.75A2.25 2.25 0 0 0 21 18V6.75A2.25 2.25 0 0 0 18.75 4.5H15M9 4.5v15.75m6-15.75v15.75M9 12h6" />
      </svg>
    )},
    { to: '/admin', label: 'Admin', icon: (
      <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75 11.25 15 15 9.75m-3-7.036A11.959 11.959 0 0 1 3.598 6 11.99 11.99 0 0 0 3 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285Z" />
      </svg>
    ), adminOnly: true },
  ];

  const isActive = (path) => location.pathname === path;

  return (
    <nav className="fixed top-0 left-0 right-0 z-[9999] h-16 flex items-center px-4 md:px-8
      bg-white/80 backdrop-blur-xl border-b border-slate-200/80
      shadow-[0_4px_20px_rgba(0,0,0,0.03)]">

      {/* Logo */}
      <Link to="/" className="flex items-center gap-2.5 shrink-0 group">
        <div className="flex h-9 w-9 items-center justify-center rounded-xl
          bg-gradient-to-tr from-emerald-500 to-teal-400
          shadow-lg shadow-emerald-600/20 group-hover:scale-105 transition-transform">
          <svg viewBox="0 0 24 24" className="h-5 w-5 text-white" fill="none" stroke="currentColor" strokeWidth={2.5}>
            <path d="M3 18c4-1 6-5 9-9s3-6 7-7" strokeLinecap="round" />
            <path d="M2 20h20" strokeLinecap="round" />
            <circle cx="13" cy="14" fill="currentColor" r="1.2" />
            <circle cx="16" cy="12" fill="currentColor" r="1" />
            <circle cx="15" cy="17" fill="currentColor" r="1.5" />
          </svg>
        </div>
        <div className="hidden sm:block">
          <span className="text-base font-extrabold tracking-tight
            bg-gradient-to-r from-emerald-600 to-teal-500 bg-clip-text text-transparent">
            CoreSlide
          </span>
          <div className="text-[9px] font-bold uppercase tracking-widest text-emerald-600 leading-none">
            WebGIS Mitigasi Longsor Jalur Liwa-Krui
          </div>
        </div>
      </Link>

      {/* Desktop Nav Links */}
      <div className="hidden md:flex items-center gap-1 mx-auto">
        {navLinks.map(link => {
          if (link.adminOnly && (!session || session.role !== 'admin')) return null;
          return (
            <Link
              key={link.to}
              to={link.to}
              className={`flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-semibold transition-all duration-150
                ${isActive(link.to)
                  ? 'bg-emerald-50 text-emerald-700 border border-emerald-200/50'
                  : 'text-slate-655 text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                }`}
            >
              {link.icon}
              {link.label}
            </Link>
          );
        })}
      </div>

      {/* Right side — user info / login button */}
      <div className="ml-auto flex items-center gap-3">
        {session ? (
          <div className="flex items-center gap-3">
            {/* User badge */}
            <div className={`hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-full border text-xs font-semibold
              ${session.role === 'admin'
                ? 'bg-teal-50 border-teal-200 text-teal-750 text-teal-700'
                : 'bg-emerald-50 border-emerald-200 text-emerald-750 text-emerald-700'
              }`}>
              <span className={`w-1.5 h-1.5 rounded-full ${session.role === 'admin' ? 'bg-teal-500' : 'bg-emerald-500'}`}></span>
              {session.nama}
              <span className={`ml-0.5 uppercase text-[9px] font-bold tracking-wider opacity-70`}>
                · {session.role}
              </span>
            </div>
            <button
              onClick={handleLogout}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-200
                text-xs text-slate-500 hover:text-red-600 hover:border-red-200 hover:bg-red-50
                transition-all duration-150 cursor-pointer"
            >
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 9V5.25A2.25 2.25 0 0 0 13.5 3h-6a2.25 2.25 0 0 0-2.25 2.25v13.5A2.25 2.25 0 0 0 7.5 21h6a2.25 2.25 0 0 0 2.25-2.25V15M12 9l-3 3m0 0 3 3m-3-3h12.75" />
              </svg>
              Keluar
            </button>
          </div>
        ) : (
          <Link
            to="/login"
            className="flex items-center gap-1.5 px-4 py-2 rounded-lg
              bg-gradient-to-r from-emerald-600 to-teal-600
              hover:from-emerald-500 hover:to-teal-500
              text-white text-sm font-bold shadow-md shadow-emerald-600/10
              transition-all duration-150"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0ZM4.501 20.118a7.5 7.5 0 0 1 14.998 0A17.933 17.933 0 0 1 12 21.75c-2.676 0-5.216-.584-7.499-1.632Z" />
            </svg>
            Masuk
          </Link>
        )}

        {/* Mobile hamburger */}
        <button
          onClick={() => setMenuOpen(!menuOpen)}
          className="md:hidden p-2 rounded-lg text-slate-500 hover:text-slate-800 hover:bg-slate-100 transition"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
            {menuOpen
              ? <path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" />
              : <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5" />
            }
          </svg>
        </button>
      </div>

      {/* Mobile menu dropdown */}
      {menuOpen && (
        <div className="absolute top-16 left-0 right-0 bg-white/95 border-b border-slate-200
          backdrop-blur-xl shadow-2xl p-4 flex flex-col gap-2 md:hidden animate-fade-in">
          {navLinks.map(link => {
            if (link.adminOnly && (!session || session.role !== 'admin')) return null;
            return (
              <Link
                key={link.to}
                to={link.to}
                onClick={() => setMenuOpen(false)}
                className={`flex items-center gap-2 px-4 py-3 rounded-xl text-sm font-semibold transition
                  ${isActive(link.to)
                    ? 'bg-emerald-50 text-emerald-700'
                    : 'text-slate-600 hover:bg-slate-100'
                  }`}
              >
                {link.icon}
                {link.label}
              </Link>
            );
          })}
        </div>
      )}
    </nav>
  );
}
