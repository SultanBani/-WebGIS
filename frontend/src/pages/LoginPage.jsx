import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function LoginPage() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const from = location.state?.from || '/';

  // Tab: 'warga' | 'admin'
  const [tab, setTab] = useState('warga');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [adminPass, setAdminPass] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPass, setShowPass] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    await new Promise(r => setTimeout(r, 400)); // simulasi loading

    const result = tab === 'admin'
      ? login('', adminPass, true)
      : login(email, password, false);

    setLoading(false);
    if (result.success) {
      navigate(tab === 'admin' ? '/admin' : (from === '/login' ? '/laporan' : from));
    } else {
      setError(result.message);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-20
      bg-gradient-to-br from-[#8ba8be] via-[#e2c7a7] to-[#f7b464] relative overflow-hidden">

      {/* Background glow */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[600px] h-[600px]
          bg-[#8ba8be]/20 rounded-full blur-[120px]" />
        <div className="absolute bottom-0 right-0 w-72 h-72
          bg-[#f7b464]/20 rounded-full blur-[80px]" />
      </div>

      <div className="relative w-full max-w-md">

        {/* Logo header */}
        <div className="text-center mb-8">
          <div className="inline-flex h-16 w-16 items-center justify-center rounded-2xl
            bg-gradient-to-tr from-[#8ba8be] to-[#f7b464]
            shadow-xl shadow-[#8ba8be]/20 mb-4 animate-bounce-subtle">
            <svg viewBox="0 0 24 24" className="h-8 w-8 text-white" fill="none" stroke="currentColor" strokeWidth={2.5}>
              <path d="M3 18c4-1 6-5 9-9s3-6 7-7" strokeLinecap="round" />
              <path d="M2 20h20" strokeLinecap="round" />
              <circle cx="13" cy="14" fill="currentColor" r="1.2" />
              <circle cx="16" cy="12" fill="currentColor" r="1" />
              <circle cx="15" cy="17" fill="currentColor" r="1.5" />
            </svg>
          </div>
          <h1 className="text-2xl font-extrabold text-slate-900">Masuk ke CoreSlide</h1>
          <p className="text-sm text-slate-500 mt-1 font-medium">WebGIS Mitigasi Longsor Jalur Krui–Liwa</p>
        </div>

        {/* Card */}
        <div className="rounded-2xl border border-slate-200/60
          bg-white/90 backdrop-blur-xl shadow-2xl shadow-slate-200/80 overflow-hidden">

          {/* Tab switcher */}
          <div className="grid grid-cols-2 border-b border-slate-100">
            <button
              onClick={() => { setTab('warga'); setError(''); }}
              className={`py-4 text-sm font-bold tracking-wide transition-all
                ${tab === 'warga'
                  ? 'bg-slate-50/50 text-[#d97706] border-b-2 border-[#8ba8be]'
                  : 'text-slate-400 hover:text-slate-600'
                }`}
            >
              <span className="flex items-center justify-center gap-2">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0ZM4.501 20.118a7.5 7.5 0 0 1 14.998 0A17.933 17.933 0 0 1 12 21.75c-2.676 0-5.216-.584-7.499-1.632Z" />
                </svg>
                Login Warga
              </span>
            </button>
            <button
              onClick={() => { setTab('admin'); setError(''); }}
              className={`py-4 text-sm font-bold tracking-wide transition-all
                ${tab === 'admin'
                  ? 'bg-slate-50/50 text-[#d97706] border-b-2 border-[#8ba8be]'
                  : 'text-slate-400 hover:text-slate-600'
                }`}
            >
              <span className="flex items-center justify-center gap-2">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75 11.25 15 15 9.75m-3-7.036A11.959 11.959 0 0 1 3.598 6 11.99 11.99 0 0 0 3 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285Z" />
                </svg>
                Login Admin
              </span>
            </button>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="p-7 space-y-5">
            {error && (
              <div className="flex items-center gap-2 p-3 rounded-xl
                bg-red-50 border border-red-200 text-red-700 text-sm">
                <svg className="w-4 h-4 shrink-0" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M18 10a8 8 0 1 1-16 0 8 8 0 0 1 16 0Zm-8-5a.75.75 0 0 1 .75.75v4.5a.75.75 0 0 1-1.5 0v-4.5A.75.75 0 0 1 10 5Zm0 10a1 1 0 1 0 0-2 1 1 0 0 0 0 2Z" />
                </svg>
                {error}
              </div>
            )}

            {tab === 'warga' ? (
              <>
                <div>
                  <label className="block text-xs font-bold text-slate-600 mb-2">Alamat Email</label>
                  <input
                    type="email" required autoComplete="email"
                    placeholder="nama@email.com"
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    className="w-full rounded-xl border border-slate-200 bg-slate-50
                      px-4 py-3 text-sm text-slate-800 placeholder-slate-405 placeholder-slate-400
                      focus:bg-white focus:border-[#8ba8be] focus:ring-1 focus:ring-[#8ba8be]/30 focus:outline-none transition"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-600 mb-2">Password</label>
                  <div className="relative">
                    <input
                      type={showPass ? 'text' : 'password'} required autoComplete="current-password"
                      placeholder="Masukkan password"
                      value={password}
                      onChange={e => setPassword(e.target.value)}
                      className="w-full rounded-xl border border-slate-200 bg-slate-50
                        px-4 py-3 pr-12 text-sm text-slate-800 placeholder-slate-405 placeholder-slate-400
                        focus:bg-white focus:border-[#8ba8be] focus:ring-1 focus:ring-[#8ba8be]/30 focus:outline-none transition"
                    />
                    <button type="button" onClick={() => setShowPass(!showPass)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-450 text-slate-400 hover:text-slate-600 transition">
                      {showPass
                        ? <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M3.98 8.223A10.477 10.477 0 0 0 1.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.451 10.451 0 0 1 12 4.5c4.756 0 8.773 3.162 10.065 7.498a10.522 10.522 0 0 1-4.293 5.774M6.228 6.228 3 3m3.228 3.228 3.65 3.65m7.894 7.894L21 21m-3.228-3.228-3.65-3.65m0 0a3 3 0 1 0-4.243-4.243m4.242 4.242L9.88 9.88" /></svg>
                        : <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 0 1 0-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178Z" /><path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" /></svg>
                      }
                    </button>
                  </div>
                </div>
              </>
            ) : (
              <div>
                <label className="block text-xs font-bold text-slate-600 mb-2">Password Admin</label>
                <div className="relative">
                  <input
                    type={showPass ? 'text' : 'password'} required
                    placeholder="Masukkan password administrator"
                    value={adminPass}
                    onChange={e => setAdminPass(e.target.value)}
                    className="w-full rounded-xl border border-slate-200 bg-slate-50
                      px-4 py-3 pr-12 text-sm text-slate-800 placeholder-slate-405 placeholder-slate-400
                      focus:bg-white focus:border-[#8ba8be] focus:ring-1 focus:ring-[#8ba8be]/30 focus:outline-none transition"
                  />
                  <button type="button" onClick={() => setShowPass(!showPass)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-450 text-slate-400 hover:text-slate-600 transition">
                    {showPass
                      ? <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M3.98 8.223A10.477 10.477 0 0 0 1.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.451 10.451 0 0 1 12 4.5c4.756 0 8.773 3.162 10.065 7.498a10.522 10.522 0 0 1-4.293 5.774M6.228 6.228 3 3m3.228 3.228 3.65 3.65m7.894 7.894L21 21m-3.228-3.228-3.65-3.65m0 0a3 3 0 1 0-4.243-4.243m4.242 4.242L9.88 9.88" /></svg>
                      : <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 0 1 0-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178Z" /><path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" /></svg>
                    }
                  </button>
                </div>
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className={`w-full py-3.5 rounded-xl text-sm font-bold tracking-wide shadow-lg
                transition-all duration-200 cursor-pointer flex items-center justify-center gap-2
                bg-gradient-to-r from-[#8ba8be] to-[#f7b464] hover:from-[#7a96ab] hover:to-[#e5a353] shadow-[#8ba8be]/20 text-white
                ${loading ? 'opacity-70 cursor-not-allowed' : ''}`}
            >
              {loading && (
                <svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/>
                </svg>
              )}
              {loading ? 'Memverifikasi...' : (tab === 'admin' ? 'Masuk sebagai Admin' : 'Masuk')}
            </button>
          </form>

          {/* Register link (warga only) */}
          {tab === 'warga' && (
            <div className="px-7 pb-6 text-center text-xs text-slate-500">
              Belum punya akun?{' '}
              <Link to="/register" className="text-[#d97706] hover:text-[#d97706] font-bold transition">
                Daftar sekarang
              </Link>
            </div>
          )}
        </div>

        <p className="mt-6 text-center text-xs text-slate-400 font-medium">
          &copy; 2026 CoreSlide WebGIS · Mitigasi Longsor Jalur Krui–Liwa TNBBS
        </p>
      </div>
    </div>
  );
}
