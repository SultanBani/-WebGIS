import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function RegisterPage() {
  const { register } = useAuth();
  const navigate = useNavigate();

  const [form, setForm] = useState({ nama: '', email: '', password: '', konfirmasi: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPass, setShowPass] = useState(false);

  const handleChange = (e) => setForm(p => ({ ...p, [e.target.name]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    if (form.password.length < 6) {
      setError('Password minimal 6 karakter.'); return;
    }
    if (form.password !== form.konfirmasi) {
      setError('Konfirmasi password tidak cocok.'); return;
    }
    setLoading(true);
    await new Promise(r => setTimeout(r, 400));
    const result = register(form.nama, form.email, form.password);
    setLoading(false);
    if (result.success) {
      navigate('/laporan');
    } else {
      setError(result.message);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-20
      bg-gradient-to-br from-[#8ba8be] via-[#e2c7a7] to-[#f7b464] relative overflow-hidden">

      {/* Background glow */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-1/3 left-1/2 -translate-x-1/2 w-[600px] h-[500px]
          bg-[#f7b464]/20 rounded-full blur-[120px]" />
        <div className="absolute top-0 right-0 w-64 h-64 bg-[#8ba8be]/30 rounded-full blur-[80px]" />
      </div>

      <div className="relative w-full max-w-md">

        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex h-16 w-16 items-center justify-center rounded-2xl
            bg-gradient-to-tr from-[#f7b464] to-[#8ba8be]
            shadow-xl shadow-[#f7b464]/20 mb-4 animate-bounce-subtle">
            <svg className="h-8 w-8 text-white" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M19 7.5v3m0 0v3m0-3h3m-3 0h-3m-2.25-4.125a3.375 3.375 0 1 1-6.75 0 3.375 3.375 0 0 1 6.75 0ZM4 19.235v-.11a6.375 6.375 0 0 1 12.75 0v.109A12.318 12.318 0 0 1 10.374 21c-2.331 0-4.512-.645-6.374-1.766Z" />
            </svg>
          </div>
          <h1 className="text-2xl font-extrabold text-slate-900">Buat Akun Warga</h1>
          <p className="text-sm text-slate-500 mt-1 font-medium">Daftar untuk melaporkan bencana longsor</p>
        </div>

        {/* Card */}
        <div className="rounded-2xl border border-slate-200/60
          bg-white/90 backdrop-blur-xl shadow-2xl shadow-slate-200/80">

          <div className="p-7 space-y-5">
            {error && (
              <div className="flex items-center gap-2 p-3 rounded-xl
                bg-red-50 border border-red-200 text-red-700 text-sm">
                <svg className="w-4 h-4 shrink-0" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M18 10a8 8 0 1 1-16 0 8 8 0 0 1 16 0Zm-8-5a.75.75 0 0 1 .75.75v4.5a.75.75 0 0 1-1.5 0v-4.5A.75.75 0 0 1 10 5Zm0 10a1 1 0 1 0 0-2 1 1 0 0 0 0 2Z" />
                </svg>
                {error}
              </div>
            )}

            {/* Nama */}
            <div>
              <label className="block text-xs font-bold text-slate-600 mb-2">Nama Lengkap</label>
              <input
                type="text" name="nama" required autoComplete="name"
                placeholder="Nama lengkap Anda"
                value={form.nama}
                onChange={handleChange}
                className="w-full rounded-xl border border-slate-200 bg-slate-50
                  px-4 py-3 text-sm text-slate-800 placeholder-slate-400
                  focus:bg-white focus:border-[#f7b464] focus:ring-1 focus:ring-[#f7b464]/30 focus:outline-none transition"
              />
            </div>

            {/* Email */}
            <div>
              <label className="block text-xs font-bold text-slate-600 mb-2">Alamat Email</label>
              <input
                type="email" name="email" required autoComplete="email"
                placeholder="nama@email.com"
                value={form.email}
                onChange={handleChange}
                className="w-full rounded-xl border border-slate-200 bg-slate-50
                  px-4 py-3 text-sm text-slate-800 placeholder-slate-400
                  focus:bg-white focus:border-[#f7b464] focus:ring-1 focus:ring-[#f7b464]/30 focus:outline-none transition"
              />
            </div>

            {/* Password */}
            <div>
              <label className="block text-xs font-bold text-slate-600 mb-2">Password</label>
              <div className="relative">
                <input
                  type={showPass ? 'text' : 'password'} name="password" required
                  placeholder="Min. 6 karakter"
                  value={form.password}
                  onChange={handleChange}
                  className="w-full rounded-xl border border-slate-200 bg-slate-50
                    px-4 py-3 pr-12 text-sm text-slate-800 placeholder-slate-400
                    focus:bg-white focus:border-[#f7b464] focus:ring-1 focus:ring-[#f7b464]/30 focus:outline-none transition"
                />
                <button type="button" onClick={() => setShowPass(!showPass)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 0 1 0-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178Z" />
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" />
                  </svg>
                </button>
              </div>
            </div>

            {/* Konfirmasi Password */}
            <div>
              <label className="block text-xs font-bold text-slate-600 mb-2">Konfirmasi Password</label>
              <input
                type="password" name="konfirmasi" required
                placeholder="Ulangi password"
                value={form.konfirmasi}
                onChange={handleChange}
                className="w-full rounded-xl border border-slate-200 bg-slate-50
                  px-4 py-3 text-sm text-slate-800 placeholder-slate-400
                  focus:bg-white focus:border-[#f7b464] focus:ring-1 focus:ring-[#f7b464]/30 focus:outline-none transition"
              />
            </div>

            {/* Password strength indicator */}
            {form.password && (
              <div className="space-y-1">
                <div className="flex gap-1">
                  {[1,2,3,4].map(i => (
                    <div key={i} className={`h-1 flex-1 rounded-full transition-all duration-300 ${
                      form.password.length >= i * 3
                        ? i <= 1 ? 'bg-red-500' : i <= 2 ? 'bg-orange-500' : i <= 3 ? 'bg-yellow-500' : 'bg-slate-500'
                        : 'bg-slate-200'
                    }`} />
                  ))}
                </div>
                <p className="text-[10px] text-slate-500">
                  Kekuatan: {form.password.length < 4 ? 'Lemah' : form.password.length < 8 ? 'Sedang' : form.password.length < 12 ? 'Kuat' : 'Sangat Kuat'}
                </p>
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              onClick={handleSubmit}
              className={`w-full py-3.5 rounded-xl text-sm font-bold tracking-wide
                bg-gradient-to-r from-[#f7b464] to-[#8ba8be]
                hover:from-[#e5a353] hover:to-[#7a96ab]
                text-white shadow-lg shadow-[#f7b464]/20
                transition-all duration-200 cursor-pointer
                flex items-center justify-center gap-2
                ${loading ? 'opacity-70 cursor-not-allowed' : ''}`}
            >
              {loading && (
                <svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/>
                </svg>
              )}
              {loading ? 'Mendaftarkan...' : 'Buat Akun'}
            </button>
          </div>

          <div className="px-7 pb-6 text-center text-xs text-slate-500">
            Sudah punya akun?{' '}
            <Link to="/login" className="text-[#d97706] hover:text-amber-800 font-bold transition">
              Masuk di sini
            </Link>
          </div>
        </div>

        <p className="mt-6 text-center text-xs text-slate-400 font-medium">
          &copy; 2026 CoreSlide WebGIS · Mitigasi Longsor Jalur Krui–Liwa TNBBS
        </p>
      </div>
    </div>
  );
}
