import React, { useState, useEffect } from 'react';

export default function AdminPage() {
  const [laporan, setLaporan] = useState(null);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('semua'); // 'semua' | 'menunggu' | 'tervalidasi'
  const [toast, setToast] = useState(null);

  const showToast = (text, type = 'success') => {
    setToast({ text, type });
    setTimeout(() => setToast(null), 3000);
  };

  const load = async () => {
    try {
      const res = await fetch('https://webgis-production-93ef.up.railway.app/api/laporan-warga?all=true');
      const data = await res.json();
      setLaporan(data);
    } catch { showToast('Gagal memuat data.', 'error'); }
    finally { setLoading(false); }
  };

  useEffect(() => { load(); }, []);

  const handleValidate = async (id) => {
    try {
      const res = await fetch(`https://webgis-production-93ef.up.railway.app/api/laporan-warga/${id}/validate`, { method: 'PATCH' });
      if (res.ok) { showToast('Laporan berhasil divalidasi.'); load(); }
    } catch { showToast('Gagal memvalidasi.', 'error'); }
  };

  const handleDelete = async (id) => {
    if (!confirm('Hapus laporan ini?')) return;
    try {
      const res = await fetch(`https://webgis-production-93ef.up.railway.app/api/laporan-warga/${id}`, { method: 'DELETE' });
      if (res.ok) { showToast('Laporan dihapus.'); load(); }
    } catch { showToast('Gagal menghapus.', 'error'); }
  };

  const all = laporan?.features || [];
  const filtered = filter === 'menunggu' ? all.filter(f => !f.properties.status_validasi)
    : filter === 'tervalidasi' ? all.filter(f => f.properties.status_validasi)
    : all;

  const stats = {
    total: all.length,
    menunggu: all.filter(f => !f.properties.status_validasi).length,
    tervalidasi: all.filter(f => f.properties.status_validasi).length,
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#8ba8be] via-[#e2c7a7] to-[#f7b464] pt-16">

      {/* Toast */}
      {toast && (
        <div className={`fixed top-20 right-4 z-50 px-4 py-3 rounded-xl shadow-2xl text-sm font-semibold
          border transition-all animate-fade-in
          ${toast.type === 'success'
            ? 'bg-slate-50 border-slate-200 text-[#d97706]'
            : 'bg-red-50 border-red-200 text-red-700'}`}>
          {toast.text}
        </div>
      )}

      <div className="max-w-6xl mx-auto px-4 py-8">

        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-[#8ba8be] to-[#f7b464]
              flex items-center justify-center shadow-lg shadow-[#8ba8be]/20">
              <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75 11.25 15 15 9.75m-3-7.036A11.959 11.959 0 0 1 3.598 6 11.99 11.99 0 0 0 3 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285Z" />
              </svg>
            </div>
            <div>
              <h1 className="text-2xl font-extrabold text-slate-900">Panel Admin</h1>
              <p className="text-sm text-slate-500">Verifikasi & manajemen laporan bencana masuk</p>
            </div>
          </div>
          <button onClick={load}
            className="flex items-center gap-2 px-4 py-2 rounded-xl border border-slate-200 bg-white
              text-xs font-semibold text-slate-700 hover:bg-slate-50 transition cursor-pointer">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0 3.181 3.183a8.25 8.25 0 0 0 13.803-3.7M4.031 9.865a8.25 8.25 0 0 1 13.803-3.7l3.181 3.182m0-4.991v4.99" />
            </svg>
            Refresh
          </button>
        </div>

        {/* Stats cards */}
        <div className="grid grid-cols-3 gap-4 mb-6">
          {[
            { label: 'Total Laporan', val: stats.total, color: 'from-white to-slate-50 border-slate-200', text: 'text-slate-800', icon: '📋' },
            { label: 'Menunggu Validasi', val: stats.menunggu, color: 'from-amber-50 to-orange-50/55 border-amber-200/60', text: 'text-amber-700', icon: '⏳' },
            { label: 'Tervalidasi', val: stats.tervalidasi, color: 'from-emerald-50 to-teal-50/55 border-slate-200/60', text: 'text-[#d97706]', icon: '✅' },
          ].map(s => (
            <div key={s.label}
              className={`rounded-2xl border bg-gradient-to-br ${s.color} p-5 shadow-sm`}>
              <div className="text-2xl mb-1">{s.icon}</div>
              <div className={`text-3xl font-extrabold ${s.text}`}>{loading ? '–' : s.val}</div>
              <div className="text-xs text-slate-500 font-bold mt-1">{s.label}</div>
            </div>
          ))}
        </div>

        {/* Filter tabs */}
        <div className="flex gap-2 mb-6">
          {[['semua','Semua'],['menunggu','Menunggu'],['tervalidasi','Tervalidasi']].map(([val, lbl]) => (
            <button key={val} onClick={() => setFilter(val)}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition cursor-pointer border
                ${filter === val
                  ? 'bg-[#7a96ab] border-emerald-600 text-white shadow-md shadow-[#8ba8be]/20'
                  : 'bg-white border-slate-200 text-slate-500 hover:text-slate-850 hover:text-slate-800 hover:bg-slate-50'}`}>
              {lbl}
            </button>
          ))}
        </div>

        {/* Table */}
        <div className="rounded-2xl border border-slate-200 bg-white overflow-hidden shadow-xl">
          {loading ? (
            <div className="flex justify-center items-center py-20">
              <div className="h-8 w-8 animate-spin rounded-full border-2 border-[#8ba8be] border-t-transparent" />
            </div>
          ) : filtered.length === 0 ? (
            <div className="text-center py-20 text-slate-400">
              <div className="text-4xl mb-3">📭</div>
              <p className="text-sm">Tidak ada laporan</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-slate-200 bg-slate-50">
                    {['ID','Tanggal Kejadian','Deskripsi','Lokasi','Foto','Status','Aksi'].map(h => (
                      <th key={h} className="px-4 py-3 text-left text-[10px] font-bold uppercase tracking-wider text-slate-500">
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filtered.map(f => {
                    const p = f.properties;
                    const [lng, lat] = f.geometry?.coordinates || [0, 0];
                    return (
                      <tr key={p.id_laporan}
                        className={`transition hover:bg-slate-50/50
                          ${!p.status_validasi ? 'border-l-4 border-amber-500' : ''}`}>
                        <td className="px-4 py-3 font-mono text-xs text-slate-400">#{p.id_laporan}</td>
                        <td className="px-4 py-3 text-xs text-slate-700 whitespace-nowrap font-medium">
                          {p.tanggal_kejadian || '–'}
                        </td>
                        <td className="px-4 py-3">
                          <p className="text-xs text-slate-750 text-slate-700 max-w-[220px] line-clamp-2">{p.deskripsi}</p>
                        </td>
                        <td className="px-4 py-3 font-mono text-[10px] text-slate-400 whitespace-nowrap">
                          {lat.toFixed(4)}, {lng.toFixed(4)}
                        </td>
                        <td className="px-4 py-3">
                          {p.foto_bukti
                            ? <img src={p.foto_bukti} alt="Foto" className="w-16 h-12 rounded-lg object-cover border border-slate-200" />
                            : <span className="text-slate-400 text-xs">–</span>}
                        </td>
                        <td className="px-4 py-3">
                          {p.status_validasi
                            ? <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full border
                                bg-slate-50 border-slate-200 text-[10px] font-bold text-[#d97706]">
                                ✓ Valid
                              </span>
                            : <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full border
                                bg-amber-50 border-amber-100 text-[10px] font-bold text-amber-600">
                                ⏳ Menunggu
                              </span>
                          }
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex gap-2">
                            {!p.status_validasi && (
                              <button onClick={() => handleValidate(p.id_laporan)}
                                className="px-3 py-1.5 rounded-lg bg-[#7a96ab] hover:bg-slate-500
                                  text-[10px] font-bold text-white transition cursor-pointer whitespace-nowrap shadow-sm">
                                ✓ Validasi
                              </button>
                            )}
                            <button onClick={() => handleDelete(p.id_laporan)}
                              className="px-3 py-1.5 rounded-lg bg-red-50 hover:bg-red-100
                                border border-red-200 text-[10px] font-bold text-red-655 text-red-600
                                transition cursor-pointer">
                              Hapus
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
