import React, { useState } from 'react';
import { MapContainer, TileLayer, Marker, useMapEvents } from 'react-leaflet';
import L from 'leaflet';
import { useAuth } from '../context/AuthContext';

const createPinIcon = () => L.divIcon({
  html: `<div style="position:relative;display:flex;align-items:center;justify-content:center">
           <div style="position:absolute;width:32px;height:32px;border-radius:50%;background:rgba(16,185,129,0.3);animation:ping 1s cubic-bezier(0,0,0.2,1) infinite"></div>
           <div style="width:22px;height:22px;border-radius:50%;background:#f7b464;border:2px solid white;box-shadow:0 2px 8px rgba(0,0,0,0.5)"></div>
         </div>`,
  className: '', iconSize: [24, 24], iconAnchor: [12, 12],
});

function ClickCapture({ onMapClick }) {
  useMapEvents({ click: (e) => onMapClick(e.latlng) });
  return null;
}

export default function LaporanPage() {
  const { session } = useAuth();
  const [form, setForm] = useState({ latitude: '', longitude: '', tanggal_kejadian: '', deskripsi: '' });
  const [fotoFile, setFotoFile] = useState(null);
  const [fotoPreview, setFotoPreview] = useState(null);
  const [message, setMessage] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleMapClick = (latlng) => {
    setForm(p => ({ ...p, latitude: latlng.lat.toFixed(6), longitude: latlng.lng.toFixed(6) }));
    setMessage(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.latitude || !form.longitude) {
      setMessage({ type: 'error', text: 'Klik peta untuk menentukan lokasi kejadian.' });
      return;
    }
    setLoading(true);
    try {
      const payload = new FormData();
      payload.append('latitude', form.latitude);
      payload.append('longitude', form.longitude);
      payload.append('deskripsi', form.deskripsi);
      payload.append('tanggal_kejadian', form.tanggal_kejadian);
      if (fotoFile) payload.append('foto_bukti', fotoFile);

      const res = await fetch('http://localhost:8000/api/laporan-warga', { method: 'POST', body: payload });
      const data = await res.json();
      if (res.ok) {
        setMessage({ type: 'success', text: 'Laporan berhasil terkirim! Menunggu validasi.' });
        setForm({ latitude: '', longitude: '', tanggal_kejadian: '', deskripsi: '' });
        setFotoFile(null); setFotoPreview(null);
      } else {
        const err = data.errors ? Object.values(data.errors).flat().join(' ') : data.message;
        setMessage({ type: 'error', text: err });
      }
    } catch { setMessage({ type: 'error', text: 'Kesalahan jaringan.' }); }
    finally { setLoading(false); }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#8ba8be] via-[#e2c7a7] to-[#f7b464] pt-16">
      <div className="max-w-6xl mx-auto px-4 py-8">

        {/* Page header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-orange-500 to-red-500
              flex items-center justify-center shadow-lg shadow-orange-500/20">
              <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126ZM12 15.75h.007v.008H12v-.008Z" />
              </svg>
            </div>
            <div>
              <h1 className="text-2xl font-extrabold text-slate-900">Laporkan Bencana Longsor</h1>
              <p className="text-sm text-slate-500">Laporan Anda membantu mitigasi bencana di jalur Krui–Liwa</p>
            </div>
          </div>
          {session && (
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full
              bg-slate-50 border border-emerald-250 border-slate-200 text-xs text-slate-700 text-[#d97706]">
              <span className="w-1.5 h-1.5 rounded-full bg-slate-500" />
              Dilaporkan oleh: <strong>{session.nama}</strong>
            </div>
          )}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

          {/* ── MAP PANEL ── */}
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-slate-500 animate-pulse" />
              <p className="text-xs font-semibold text-slate-500">
                Klik peta untuk menentukan lokasi kejadian longsor
              </p>
            </div>
            <div className="rounded-2xl overflow-hidden border border-slate-200 shadow-xl"
              style={{ height: '480px' }}>
              <MapContainer center={[-5.1050, 104.0700]} zoom={11}
                style={{ width: '100%', height: '100%' }}>
                <TileLayer url="https://mt1.google.com/vt/lyrs=y&x={x}&y={y}&z={z}" attribution="&copy; Google Satellite" />
                <ClickCapture onMapClick={handleMapClick} />
                {form.latitude && form.longitude && (
                  <Marker position={[parseFloat(form.latitude), parseFloat(form.longitude)]}
                    icon={createPinIcon()} />
                )}
              </MapContainer>
            </div>

            {/* Koordinat display */}
            <div className="grid grid-cols-2 gap-3">
              {[['Lintang (Lat)', form.latitude, '-5.xxxxxx'], ['Bujur (Lng)', form.longitude, '104.xxxxxx']].map(([lbl, val, ph]) => (
                <div key={lbl} className="rounded-xl border border-slate-200 bg-white p-3 shadow-sm">
                  <div className="text-[10px] text-slate-400 font-bold uppercase tracking-wider mb-1">{lbl}</div>
                  <div className={`font-mono text-sm font-bold ${val ? 'text-[#d97706]' : 'text-slate-300'}`}>
                    {val || ph}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* ── FORM PANEL ── */}
          <div className="rounded-2xl border border-slate-200 bg-white shadow-xl p-6 space-y-5">

            {message && (
              <div className={`flex items-start gap-2 p-3.5 rounded-xl text-sm border
                ${message.type === 'success'
                  ? 'bg-slate-50 border-slate-200 text-slate-700 text-[#d97706]'
                  : 'bg-red-50 border-red-200 text-red-750 text-red-700'}`}>
                <svg className="w-4 h-4 mt-0.5 shrink-0" fill="currentColor" viewBox="0 0 20 20">
                  {message.type === 'success'
                    ? <path fillRule="evenodd" d="M10 18a8 8 0 1 0 0-16 8 8 0 0 0 0 16Zm3.857-9.809a.75.75 0 0 0-1.214-.882l-3.483 4.79-1.88-1.88a.75.75 0 1 0-1.06 1.061l2.5 2.5a.75.75 0 0 0 1.137-.089l4-5.5Z" />
                    : <path fillRule="evenodd" d="M18 10a8 8 0 1 1-16 0 8 8 0 0 1 16 0Zm-8-5a.75.75 0 0 1 .75.75v4.5a.75.75 0 0 1-1.5 0v-4.5A.75.75 0 0 1 10 5Zm0 10a1 1 0 1 0 0-2 1 1 0 0 0 0 2Z" />}
                </svg>
                {message.text}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-5">
              {/* Tanggal */}
              <div>
                <label className="block text-xs font-bold text-slate-655 text-slate-600 mb-2">
                  Tanggal Kejadian Longsor <span className="text-red-500">*</span>
                </label>
                <input type="date" required
                  max={new Date().toISOString().split('T')[0]}
                  value={form.tanggal_kejadian}
                  onChange={e => setForm(p => ({ ...p, tanggal_kejadian: e.target.value }))}
                  className="w-full rounded-xl border border-slate-200 bg-slate-50
                    px-4 py-3 text-sm text-slate-800 focus:border-[#8ba8be] focus:bg-white focus:outline-none
                    transition"
                />
              </div>

              {/* Deskripsi */}
              <div>
                <label className="block text-xs font-bold text-slate-655 text-slate-600 mb-2">
                  Deskripsi Kejadian <span className="text-red-500">*</span>
                </label>
                <textarea rows={5} required
                  placeholder="Ceritakan kondisi longsor yang Anda lihat: lokasi persis, perkiraan ukuran material, dampak ke jalan, jumlah kendaraan terdampak, dll."
                  value={form.deskripsi}
                  onChange={e => setForm(p => ({ ...p, deskripsi: e.target.value }))}
                  className="w-full rounded-xl border border-slate-200 bg-slate-50
                    px-4 py-3 text-sm text-slate-800 placeholder-slate-400
                    focus:border-[#8ba8be] focus:bg-white focus:outline-none transition resize-none"
                />
              </div>

              {/* Upload foto */}
              <div>
                <label className="block text-xs font-bold text-slate-655 text-slate-600 mb-2">
                  Foto Bukti Kejadian
                  <span className="ml-1.5 text-[10px] font-normal text-slate-400">(JPG/PNG/WebP, maks. 5 MB)</span>
                </label>
                <label htmlFor="foto-laporan"
                  className={`flex flex-col items-center justify-center gap-2 w-full rounded-xl
                    border-2 border-dashed cursor-pointer transition-all py-6 px-3 text-center
                    ${fotoPreview
                      ? 'border-[#8ba8be]/50 bg-slate-50/50'
                      : 'border-slate-200 bg-slate-50 hover:border-slate-350 hover:border-slate-300 hover:bg-slate-100/50'}`}>
                  {fotoPreview
                    ? <img src={fotoPreview} alt="Preview" className="w-full max-h-40 object-cover rounded-lg" />
                    : <>
                        <svg className="w-8 h-8 text-emerald-500" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75V16.5m-13.5-9L12 3m0 0 4.5 4.5M12 3v13.5" />
                        </svg>
                        <span className="text-xs text-slate-500">Klik atau seret gambar ke sini</span>
                      </>
                  }
                </label>
                <input id="foto-laporan" type="file" accept="image/*" className="hidden"
                  onChange={e => {
                    const f = e.target.files[0];
                    if (!f) return;
                    if (f.size > 5 * 1024 * 1024) { setMessage({ type: 'error', text: 'File melebihi 5 MB.' }); return; }
                    setFotoFile(f); setFotoPreview(URL.createObjectURL(f));
                  }} />
                {fotoPreview && (
                  <button type="button" onClick={() => { setFotoFile(null); setFotoPreview(null); }}
                    className="mt-2 w-full py-1.5 rounded-lg border border-red-200
                      text-[11px] text-red-500 hover:bg-red-50 transition cursor-pointer">
                    🗑 Hapus Foto
                  </button>
                )}
              </div>

              <button type="submit" disabled={loading}
                className={`w-full py-3.5 rounded-xl font-bold text-sm text-white
                  bg-gradient-to-r from-orange-600 to-red-600
                  hover:from-orange-500 hover:to-red-500
                  shadow-lg shadow-orange-550/20 shadow-orange-500/20 transition-all cursor-pointer
                  flex items-center justify-center gap-2
                  ${loading ? 'opacity-70 cursor-not-allowed' : ''}`}>
                {loading
                  ? <><svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/></svg> Mengirim...</>
                  : <><svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M6 12 3.269 3.125A59.769 59.769 0 0 1 21.485 12 59.768 59.768 0 0 1 3.27 20.875L5.999 12Zm0 0h7.5" /></svg> Kirim Laporan Bencana</>
                }
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
