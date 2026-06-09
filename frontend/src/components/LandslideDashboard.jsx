import React, { useState, useEffect, useMemo } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Polygon, useMap, useMapEvents } from 'react-leaflet';
import L from 'leaflet';
import tnbbsBoundaryData from '../data/tnbbs_boundary.json';

// Komponen helper untuk mengontrol pergerakan kamera peta (flyTo) secara halus
function MapController({ activePoint }) {
  const map = useMap();
  useEffect(() => {
    if (activePoint && activePoint.geometry && activePoint.geometry.coordinates) {
      const [lng, lat] = activePoint.geometry.coordinates;
      map.flyTo([lat, lng], 15, {
        animate: true,
        duration: 1.5,
      });
    }
  }, [activePoint, map]);

  return null;
}

// Komponen helper untuk menangkap klik pada peta untuk input koordinat laporan warga
function MapClickHandler({ onMapClick, activeTab }) {
  useMapEvents({
    click(e) {
      if (activeTab === 'laporkan') {
        onMapClick(e.latlng);
      }
    },
  });
  return null;
}

// 1. Ikon Kustom: Segitiga Merah untuk Titik Historis Longsor (Tabel 3.5)
const createTriangleIcon = (isActive) => {
  const size = isActive ? 28 : 20;
  return L.divIcon({
    html: `<div class="flex items-center justify-center">
             <svg width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" class="drop-shadow-[0_2px_5px_rgba(0,0,0,0.5)]">
               <polygon points="12,3 22,21 2,21" fill="#ef4444" stroke="#ffffff" stroke-width="2" stroke-linejoin="round"/>
             </svg>
           </div>`,
    className: 'custom-triangle-icon',
    iconSize: [size, size],
    iconAnchor: [size / 2, size],
  });
};

// 2. Ikon Kustom: Palang Medis (Biru) untuk Posko & Fasilitas Darurat (Tabel 3.5)
const createMedicalIcon = () => {
  return L.divIcon({
    html: `<div class="flex items-center justify-center w-6 h-6 rounded-full bg-blue-600 border-2 border-white shadow-lg">
             <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#ffffff" stroke-width="3" stroke-linecap="round" stroke-linejoin="round">
               <line x1="12" y1="5" x2="12" y2="19"></line>
               <line x1="5" y1="12" x2="19" y2="12"></line>
             </svg>
           </div>`,
    className: 'custom-medical-icon',
    iconSize: [24, 24],
    iconAnchor: [12, 12],
  });
};

// 3. Ikon Kustom: Tanda Peringatan (Kuning/Oranye) untuk Laporan Warga
const createWarningIcon = (isActive) => {
  const size = isActive ? 28 : 22;
  return L.divIcon({
    html: `<div class="flex items-center justify-center w-6 h-6 rounded-full bg-amber-500 border-2 border-white shadow-lg ${isActive ? 'scale-125' : ''}">
             <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#ffffff" stroke-width="3" stroke-linecap="round" stroke-linejoin="round">
               <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"></path>
               <line x1="12" y1="9" x2="12" y2="13"></line>
               <line x1="12" y1="17" x2="12.01" y2="17"></line>
             </svg>
           </div>`,
    className: 'custom-warning-icon',
    iconSize: [24, 24],
    iconAnchor: [12, 12],
  });
};

// 4. Ikon Kustom: Penanda Koordinat Terpilih pada Formulir Pelaporan (Bouncing Green)
const createSelectedIcon = () => {
  return L.divIcon({
    html: `<div class="relative flex items-center justify-center">
             <div class="absolute animate-ping w-8 h-8 rounded-full bg-emerald-400/50"></div>
             <div class="w-6 h-6 rounded-full bg-emerald-500 border-2 border-white shadow-lg flex items-center justify-center">
               <span class="w-2.5 h-2.5 rounded-full bg-white"></span>
             </div>
           </div>`,
    className: 'custom-selected-icon',
    iconSize: [24, 24],
    iconAnchor: [12, 12],
  });
};

// Data Batas Kawasan TNBBS dari file GeoJSON representatif
// GeoJSON menyimpan koordinat sebagai [Lng, Lat], Leaflet membutuhkan [Lat, Lng]
// Konversi dilakukan di sini agar konsisten dan tidak crash
// Mendukung tipe geometri Polygon maupun MultiPolygon (guard error lengkap)
const tnbbsPolygon = (() => {
  try {
    const geom = tnbbsBoundaryData?.geometry;
    if (!geom || !geom.type || !Array.isArray(geom.coordinates)) {
      console.warn('[TNBBS] Struktur GeoJSON tidak valid atau kosong.');
      return [];
    }
    if (geom.type === 'Polygon') {
      // Ambil ring pertama (exterior ring), balik urutan [Lng, Lat] → [Lat, Lng]
      const ring = geom.coordinates[0];
      if (!Array.isArray(ring) || ring.length < 3) return [];
      return ring.map(([lng, lat]) => [lat, lng]);
    }
    if (geom.type === 'MultiPolygon') {
      // Untuk MultiPolygon, ambil ring eksterior dari poligon pertama
      const ring = geom.coordinates?.[0]?.[0];
      if (!Array.isArray(ring) || ring.length < 3) return [];
      return ring.map(([lng, lat]) => [lat, lng]);
    }
    console.warn('[TNBBS] Tipe geometri tidak dikenali:', geom.type);
    return [];
  } catch (e) {
    console.error('[TNBBS] Gagal memuat data batas kawasan:', e);
    return [];
  }
})();

// Data Statis: Posko & Fasilitas Darurat BPBD & Kesehatan (Tabel 3.5)
// Referensi koordinat:
// [1] BPBD Liwa: lampungbaratkab.go.id — kantor di area Way Mengaku, Liwa
//     Koordinat kota Liwa: -5.1492, 104.1931 (Wikipedia — Liwa, Lampung Barat)
// [2] Posko KM 15: BPBD Lampung Barat, posko taktis saat tanggap darurat 2025-2026
//     (medialampung.co.id, inilampung.com) — estimasi mendekati KM 15 ruas TNBBS
// [3] Puskesmas Krui: koordinat AKTUAL dari data Pemkab Pesisir Barat
//     -5.156271, 103.948299 (Tanah Lapang, Kel. Pasar Krui, Kec. Pesisir Tengah)
//     Sumber: pesisirbaratkab.go.id & scribd.com/data-koordinat-faskes-pesisir-barat
const poskoList = [
  {
    id: 'posko-1',
    nama: 'Kantor BPBD Kabupaten Lampung Barat',
    tipe: 'Posko BPBD',
    deskripsi: 'Markas pusat operasional Pusdalops PB, evakuasi, dan logistik darurat. Berlokasi di area perkantoran Pemkab Lampung Barat, Liwa.',
    // Ref [1]: Estimasi berdasarkan koordinat ibu kota Liwa (-5.1492, 104.1931)
    koordinat: [-5.1065, 104.1850]
  },
  {
    id: 'posko-2',
    nama: 'Posko Taktis BPBD Jalur TNBBS (KM 15)',
    tipe: 'Posko Siaga Lapangan',
    deskripsi: 'Posko taktis lapangan untuk koordinasi pembersihan material longsor dan penyelamatan. Aktif saat tanggap darurat 2025–2026.',
    // Ref [2]: Estimasi posisi KM 15 ruas Jalan Lintas Liwa-Krui dalam kawasan TNBBS
    koordinat: [-5.0800, 104.0300]
  },
  {
    id: 'posko-3',
    nama: 'UPT Puskesmas Krui (Pos Evakuasi Medis)',
    tipe: 'Fasilitas Medis',
    deskripsi: 'Puskesmas perawatan rawat inap di Pasar Krui, sebagai fasilitas medis rujukan korban longsor jalur Liwa–Krui. Kec. Pesisir Tengah, Kab. Pesisir Barat.',
    // Ref [3]: Koordinat AKTUAL dari data Pemkab Pesisir Barat
    // Sumber: pesisirbaratkab.go.id — Tanah Lapang, Kel. Pasar Krui
    koordinat: [-5.1563, 103.9483]
  }
];

export default function LandslideDashboard() {
  // Tab Menu Sidebar: 'spasial' | 'laporkan' | 'admin'
  const [activeTab, setActiveTab] = useState('spasial');

  // State Data Spasial API Backend
  const [historisData, setHistorisData] = useState(null);
  const [zonasiData, setZonasiData] = useState(null);
  const [laporanWarga, setLaporanWarga] = useState(null);

  // State Loading & Error
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // State Fokus Peta
  const [activePoint, setActivePoint] = useState(null);

  // State Tipe Base Map
  const [mapStyle, setMapStyle] = useState('satellite');

  // State Kontrol Layer (Overlays)
  const [layerControl, setLayerControl] = useState({
    tnbbs: true,
    zonasi: true,
    historis: true,
    posko: true,
    laporan: true
  });

  // State Formulir Laporan Warga
  const [formReport, setFormReport] = useState({
    latitude: '',
    longitude: '',
    tanggal_kejadian: '',
    deskripsi: '',
  });
  const [fotoFile, setFotoFile] = useState(null);       // File object
  const [fotoPreview, setFotoPreview] = useState(null); // URL preview lokal
  const [formMessage, setFormMessage] = useState(null);

  // State Admin Panel
  const [adminAuth, setAdminAuth] = useState(false);
  const [adminPassword, setAdminPassword] = useState('');
  const [adminError, setAdminError] = useState('');
  const [allLaporanAdmin, setAllLaporanAdmin] = useState(null);

  // Pencarian titik historis di sidebar
  const [searchQuery, setSearchQuery] = useState('');

  // Center peta di tengah koridor Jalan Lintas Liwa–Krui
  const mapCenter = [-5.1050, 104.0700];
  const defaultZoom = 11;

  // Fetch seluruh data spasial dari API Laravel
  const loadAllData = async () => {
    try {
      setLoading(true);

      // Fetch Titik Historis (Tabel 3.2)
      const resHistoris = await fetch('http://127.0.0.1:8000/api/titik-longsor');
      if (!resHistoris.ok) throw new Error('Gagal mengambil data titik historis.');
      const dataHistoris = await resHistoris.json();
      setHistorisData(dataHistoris);

      // Fetch Zonasi Rawan (Tabel 3.3)
      const resZonasi = await fetch('http://127.0.0.1:8000/api/zonasi-rawan');
      if (!resZonasi.ok) throw new Error('Gagal mengambil data zonasi rawan.');
      const dataZonasi = await resZonasi.json();
      setZonasiData(dataZonasi);

      // Fetch Laporan Warga Publik (Tabel 3.4)
      const resLaporan = await fetch('http://127.0.0.1:8000/api/laporan-warga');
      if (!resLaporan.ok) throw new Error('Gagal mengambil data laporan warga.');
      const dataLaporan = await resLaporan.json();
      setLaporanWarga(dataLaporan);

      setError(null);
    } catch (err) {
      console.error(err);
      setError('Koneksi ke API backend Laravel gagal. Pastikan database dan server Laravel sudah menyala di localhost:8000.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAllData();
  }, []);

  // Fetch semua laporan warga untuk admin (?all=true)
  const loadAdminReports = async () => {
    try {
      const response = await fetch('http://127.0.0.1:8000/api/laporan-warga?all=true');
      if (response.ok) {
        const data = await response.json();
        setAllLaporanAdmin(data);
      }
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    if (adminAuth) {
      loadAdminReports();
    }
  }, [adminAuth]);

  // Handler klik peta untuk menentukan lokasi laporan warga
  const handleMapClick = (latlng) => {
    setFormReport(prev => ({
      ...prev,
      latitude: latlng.lat.toFixed(6),
      longitude: latlng.lng.toFixed(6)
    }));
    setFormMessage(null);
  };

  // Kirim Laporan Warga (POST ke API — multipart/form-data untuk file upload)
  const handleSubmitReport = async (e) => {
    e.preventDefault();
    if (!formReport.latitude || !formReport.longitude || !formReport.deskripsi || !formReport.tanggal_kejadian) {
      setFormMessage({ type: 'error', text: 'Semua kolom harus diisi, termasuk tanggal kejadian. Klik peta untuk koordinat.' });
      return;
    }

    try {
      // Gunakan FormData agar bisa kirim file bersama data teks
      const payload = new FormData();
      payload.append('latitude', formReport.latitude);
      payload.append('longitude', formReport.longitude);
      payload.append('deskripsi', formReport.deskripsi);
      payload.append('tanggal_kejadian', formReport.tanggal_kejadian);
      if (fotoFile) {
        payload.append('foto_bukti', fotoFile);
      }

      const response = await fetch('http://127.0.0.1:8000/api/laporan-warga', {
        method: 'POST',
        // Jangan set Content-Type — browser otomatis isi boundary multipart
        body: payload
      });
      const data = await response.json();

      if (response.ok) {
        setFormMessage({ type: 'success', text: 'Laporan berhasil terkirim! Status: Menunggu Validasi BPBD.' });
        setFormReport({ latitude: '', longitude: '', tanggal_kejadian: '', deskripsi: '' });
        setFotoFile(null);
        setFotoPreview(null);
        loadAllData();
      } else {
        const errMsg = data.errors
          ? Object.values(data.errors).flat().join(' ')
          : (data.message || 'Gagal mengirim laporan.');
        setFormMessage({ type: 'error', text: errMsg });
      }
    } catch (err) {
      setFormMessage({ type: 'error', text: 'Kesalahan jaringan saat mengirim laporan.' });
    }
  };

  // Validasi Laporan (PATCH)
  const handleValidateReport = async (id) => {
    try {
      const response = await fetch(`http://127.0.0.1:8000/api/laporan-warga/${id}/validate`, {
        method: 'PATCH'
      });
      if (response.ok) {
        loadAdminReports();
        loadAllData(); // Refresh peta utama
      }
    } catch (err) {
      console.error(err);
    }
  };

  // Hapus Laporan (DELETE)
  const handleDeleteReport = async (id) => {
    if (!confirm('Apakah Anda yakin ingin menghapus laporan ini?')) return;
    try {
      const response = await fetch(`http://127.0.0.1:8000/api/laporan-warga/${id}`, {
        method: 'DELETE'
      });
      if (response.ok) {
        loadAdminReports();
        loadAllData(); // Refresh peta utama
      }
    } catch (err) {
      console.error(err);
    }
  };

  // Penanganan Login Admin
  const handleAdminLogin = (e) => {
    e.preventDefault();
    if (adminPassword === 'admin123') {
      setAdminAuth(true);
      setAdminError('');
    } else {
      setAdminError('Password Admin BPBD salah.');
    }
  };

  // Hitung Statistik Bencana — reaktif via useMemo agar selalu sinkron dengan historisData
  // Mapping ganda: mendukung nilai dari DB titik_longsor ('Berat'/'Sedang'/'Ringan')
  // maupun nilai dari zonasi_rawan ('Tinggi'→Berat, 'Sedang'→Sedang, 'Rendah'→Ringan)
  const stats = useMemo(() => {
    if (!historisData || !Array.isArray(historisData.features)) {
      return { total: 0, berat: 0, sedang: 0, ringan: 0, laporan: 0 };
    }
    const features = historisData.features;
    const berat = features.filter(f => {
      const tk = f.properties?.tingkat_kerusakan;
      return tk === 'Berat' || tk === 'Tinggi'; // mapping zonasi → historis
    }).length;
    const sedang = features.filter(f => f.properties?.tingkat_kerusakan === 'Sedang').length;
    const ringan = features.filter(f => {
      const tk = f.properties?.tingkat_kerusakan;
      return tk === 'Ringan' || tk === 'Rendah'; // mapping zonasi → historis
    }).length;
    const laporan = laporanWarga?.features?.length ?? 0;
    return { total: features.length, berat, sedang, ringan, laporan };
  }, [historisData, laporanWarga]);

  // Konversi GeoJSON Polygon/MultiPolygon ke Leaflet Koordinat Array
  // Menangani kedua tipe geometri untuk mencegah crash saat data DB kompleks
  const convertPolygon = (geometry) => {
    try {
      // Guard: pastikan objek geometry valid sebelum diproses
      if (!geometry || typeof geometry !== 'object') return [];
      if (!geometry.type || !Array.isArray(geometry.coordinates)) return [];
      if (geometry.coordinates.length === 0) return [];

      // Helper: konversi satu ring [Lng, Lat][] → [Lat, Lng][] dengan validasi tiap titik
      const convertRing = (ring) => {
        if (!Array.isArray(ring) || ring.length < 3) return [];
        return ring
          .filter(coord => Array.isArray(coord) && coord.length >= 2 &&
            isFinite(coord[0]) && isFinite(coord[1]))
          .map(coord => [coord[1], coord[0]]); // [Lng,Lat] → [Lat,Lng]
      };

      if (geometry.type === 'Polygon') {
        // Standar: array of rings (exterior + optional holes)
        // Leaflet Polygon positions: [[lat,lng], ...] atau [[ring1], [ring2]] untuk holes
        const rings = geometry.coordinates.map(convertRing).filter(r => r.length >= 3);
        if (rings.length === 0) return [];
        // Kembalikan ring pertama (eksterior) sebagai flat array agar kompatibel
        return rings[0];
      }

      if (geometry.type === 'MultiPolygon') {
        // MultiPolygon: array of Polygon
        // Strategi: tampilkan tiap poligon sebagai sub-array (Leaflet mendukung ini)
        // Hasilnya: [[ring_poly1_pts...], [ring_poly2_pts...], ...]
        const allRings = geometry.coordinates
          .map(polygon => {
            // Setiap polygon = array of rings; ambil exterior ring (index 0)
            const exteriorRing = polygon?.[0];
            return convertRing(exteriorRing);
          })
          .filter(ring => ring.length >= 3);

        if (allRings.length === 0) return [];
        // Untuk MultiPolygon, kembalikan ring pertama agar tidak crash
        // (Leaflet <Polygon> tidak natively render multi-polygon terpisah)
        return allRings[0];
      }

      console.warn('[convertPolygon] Tipe geometri tidak dikenali:', geometry.type);
      return [];
    } catch (e) {
      console.error('[convertPolygon] Gagal mengkonversi geometri:', geometry?.type, e);
      return [];
    }
  };

  // Pewarnaan Poligon Berdasarkan Kategori Rawan (Choropleth Visuals)
  const getZonasiColor = (kelas) => {
    switch (kelas) {
      case 'Tinggi': return { color: '#dc2626', fillColor: '#ef4444' }; // Red
      case 'Sedang': return { color: '#ea580c', fillColor: '#f97316' }; // Orange
      case 'Rendah': return { color: '#ca8a04', fillColor: '#eab308' }; // Yellow
      case 'Aman': return { color: '#16a34a', fillColor: '#22c55e' }; // Green
      default: return { color: '#4b5563', fillColor: '#9ca3af' };
    }
  };

  // Filter titik historis sesuai input pencarian
  const filteredHistoris = historisData?.features.filter(f =>
    f.properties.lokasi_detail.toLowerCase().includes(searchQuery.toLowerCase())
  ) || [];

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-slate-50 font-sans text-slate-800">

      {/* SIDEBAR DASHBOARD UTAMA */}
      <aside className="z-10 flex w-100 shrink-0 flex-col rounded-r-2xl border border-white/20 bg-white/80 backdrop-blur-md shadow-xl text-slate-800">

        {/* Header SIG */}
        <div className="p-5 border-b border-emerald-900/30">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-tr from-emerald-500 to-teal-600 shadow-md shadow-emerald-950/40">
              <svg viewBox="0 0 24 24" className="h-6 w-6 text-white" fill="none" stroke="currentColor" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round">
                <path d="M3 18c4-1 6-5 9-9s3-6 7-7" />
                <path d="M2 20h20" />
                <circle cx="13" cy="14" fill="currentColor" r="1.2" />
                <circle cx="16" cy="12" fill="currentColor" r="1" />
                <circle cx="15" cy="17" fill="currentColor" r="1.5" />
              </svg>
            </div>
            <div>
              <h1 className="text-xl font-bold tracking-tight bg-gradient-to-r from-teal-700 to-emerald-600 bg-clip-text text-transparent font-bold">
                CORESIDE WebGIS
              </h1>
              <p className="text-[10px] font-bold uppercase tracking-wider text-teal-700">Mitigasi Jalur Krui-Liwa</p>
            </div>
          </div>
          <p className="mt-3 text-xs text-slate-600 leading-relaxed">
            Sistem Informasi Geografis pemetaan zonasi weighted sum overlay kerawanan longsor & pelaporan masyarakat TNBBS, Lampung.
          </p>
        </div>

        {/* Tab Switcher */}
        <div className="grid grid-cols-3 border-b border-slate-200 text-xs font-semibold bg-slate-100/50">
          <button
            onClick={() => setActiveTab('spasial')}
            className={`py-3 text-center border-b-2 cursor-pointer transition ${activeTab === 'spasial'
                ? 'border-teal-600 text-teal-800 bg-teal-50/80'
                : 'border-transparent text-slate-500 hover:text-teal-700'
              }`}
          >
            Peta & Historis
          </button>
          <button
            onClick={() => {
              setActiveTab('laporkan');
              setFormMessage(null);
            }}
            className={`py-3 text-center border-b-2 cursor-pointer transition ${activeTab === 'laporkan'
                ? 'border-teal-600 text-teal-800 bg-teal-50/80'
                : 'border-transparent text-slate-500 hover:text-teal-700'
              }`}
          >
            Laporkan Longsor
          </button>
          <button
            onClick={() => setActiveTab('admin')}
            className={`py-3 text-center border-b-2 cursor-pointer transition ${activeTab === 'admin'
                ? 'border-teal-600 text-teal-800 bg-teal-50/80'
                : 'border-transparent text-slate-500 hover:text-teal-700'
              }`}
          >
            Admin BPBD
          </button>
        </div>

        {/* AREA KONTEN TAB */}
        <div className="flex-1 overflow-y-auto p-4 custom-scrollbar">

          {/* TAB 1: DATA SPASIAL & STATISTIK */}
          {activeTab === 'spasial' && (
            <div className="space-y-4">

              {/* Ringkasan Statistik */}
              <div className="rounded-xl border border-slate-200 bg-white shadow-sm p-3.5">
                <h3 className="text-xs font-bold uppercase tracking-wider text-teal-700 mb-2">Tingkat Kerusakan Bencana</h3>
                <div className="grid grid-cols-3 gap-2">
                  <div className="rounded-lg bg-gradient-to-br from-red-500 to-rose-600 p-2 text-center text-white shadow-lg shadow-red-500/20">
                    <div className="text-xl font-bold text-white">{loading ? '-' : stats.berat}</div>
                    <div className="text-[9px] text-white uppercase font-semibold">Berat</div>
                  </div>
                  <div className="rounded-lg bg-gradient-to-br from-orange-400 to-amber-600 p-2 text-center text-white shadow-lg shadow-orange-500/20">
                    <div className="text-xl font-bold text-white">{loading ? '-' : stats.sedang}</div>
                    <div className="text-[9px] text-white uppercase font-semibold">Sedang</div>
                  </div>
                  <div className="rounded-lg bg-gradient-to-br from-yellow-300 to-amber-400 p-2 text-center text-slate-800 shadow-lg">
                    <div className="text-xl font-bold text-slate-800">{loading ? '-' : stats.ringan}</div>
                    <div className="text-[9px] text-slate-800 uppercase font-semibold">Ringan</div>
                  </div>
                </div>
                <div className="mt-2.5 flex justify-between items-center text-xs text-white bg-gradient-to-br from-slate-700 to-slate-900 p-2.5 rounded-lg shadow-lg">
                  <span>Total Titik Historis Terpetakan:</span>
                  <span className="font-bold text-white text-sm">{loading ? '...' : stats.total}</span>
                </div>
              </div>

              {/* Layer Toggles (Kontrol Layer Mandiri) */}
              <div className="rounded-xl border border-slate-200 bg-white shadow-sm p-3.5">
                <h3 className="text-xs font-bold uppercase tracking-wider text-teal-700 mb-3">Kontrol Layer Peta</h3>
                <div className="space-y-2 text-xs">
                  <label className="flex items-center justify-between cursor-pointer p-1.5 rounded hover:bg-slate-50 transition">
                    <span className="flex items-center gap-2">
                      <span className="h-3 w-3 rounded-full border border-emerald-400 bg-emerald-100"></span>
                      Batas Kawasan TNBBS (Polygon)
                    </span>
                    <input
                      type="checkbox"
                      checked={layerControl.tnbbs}
                      onChange={() => setLayerControl(prev => ({ ...prev, tnbbs: !prev.tnbbs }))}
                      className="accent-emerald-600 h-4 w-4"
                    />
                  </label>
                  <label className="flex items-center justify-between cursor-pointer p-1.5 rounded hover:bg-slate-50 transition">
                    <span className="flex items-center gap-2">
                      <span className="h-3 w-3 rounded bg-gradient-to-r from-red-500 to-green-500"></span>
                      Zonasi Rawan Overlay (Choropleth)
                    </span>
                    <input
                      type="checkbox"
                      checked={layerControl.zonasi}
                      onChange={() => setLayerControl(prev => ({ ...prev, zonasi: !prev.zonasi }))}
                      className="accent-emerald-600 h-4 w-4"
                    />
                  </label>
                  <label className="flex items-center justify-between cursor-pointer p-1.5 rounded hover:bg-slate-50 transition">
                    <span className="flex items-center gap-2">
                      <span className="inline-block border-b-2 border-r-2 border-transparent w-0 h-0 border-l-[6px] border-l-transparent border-r-[6px] border-r-transparent border-b-[10px] border-b-red-500"></span>
                      Titik Historis Bencana (Segitiga)
                    </span>
                    <input
                      type="checkbox"
                      checked={layerControl.historis}
                      onChange={() => setLayerControl(prev => ({ ...prev, historis: !prev.historis }))}
                      className="accent-emerald-600 h-4 w-4"
                    />
                  </label>
                  <label className="flex items-center justify-between cursor-pointer p-1.5 rounded hover:bg-slate-50 transition">
                    <span className="flex items-center gap-2">
                      <span className="h-3.5 w-3.5 rounded-full bg-blue-600 border border-white flex items-center justify-center text-[8px] font-bold text-white">+</span>
                      Posko & Fasilitas Darurat BPBD
                    </span>
                    <input
                      type="checkbox"
                      checked={layerControl.posko}
                      onChange={() => setLayerControl(prev => ({ ...prev, posko: !prev.posko }))}
                      className="accent-emerald-600 h-4 w-4"
                    />
                  </label>
                  <label className="flex items-center justify-between cursor-pointer p-1.5 rounded hover:bg-slate-50 transition">
                    <span className="flex items-center gap-2">
                      <span className="h-3.5 w-3.5 rounded-full bg-amber-500 border border-white flex items-center justify-center text-[7px] text-white">⚠️</span>
                      Laporan Kerusakan Warga
                    </span>
                    <input
                      type="checkbox"
                      checked={layerControl.laporan}
                      onChange={() => setLayerControl(prev => ({ ...prev, laporan: !prev.laporan }))}
                      className="accent-emerald-600 h-4 w-4"
                    />
                  </label>
                </div>
              </div>

              {/* Daftar Lokasi Historis */}
              <div className="space-y-3">
                <div className="flex justify-between items-center px-1">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-teal-700">Daftar Titik Historis</h3>
                  <span className="text-[10px] text-teal-800 bg-teal-50 px-1.5 py-0.5 rounded font-bold">
                    {filteredHistoris.length} Lokasi
                  </span>
                </div>

                {/* Search Box */}
                <input
                  type="text"
                  placeholder="Cari lokasi detail longsor..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full rounded-lg border border-slate-300 bg-white px-3.5 py-2 text-xs text-slate-800 placeholder-slate-400 focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
                />

                {loading ? (
                  <div className="flex flex-col items-center justify-center py-10 text-slate-500">
                    <div className="h-8 w-8 animate-spin rounded-full border-4 border-emerald-500 border-t-transparent mb-3"></div>
                    <p className="text-xs">Memuat data spasial...</p>
                  </div>
                ) : filteredHistoris.length === 0 ? (
                  <p className="text-center text-xs text-slate-500 py-6">Lokasi tidak ditemukan.</p>
                ) : (
                  <div className="space-y-2">
                    {filteredHistoris.map((feature) => {
                      const isSelected = activePoint && activePoint.properties.id === feature.properties.id;
                      const [lng, lat] = feature.geometry.coordinates;

                      let badgeColor = '';
                      switch (feature.properties.tingkat_kerusakan) {
                        case 'Berat':
                          badgeColor = 'bg-red-50 text-red-600 border-red-200';
                          break;
                        case 'Sedang':
                          badgeColor = 'bg-orange-50 text-orange-600 border-orange-200';
                          break;
                        case 'Ringan':
                          badgeColor = 'bg-yellow-50 text-yellow-600 border-yellow-200';
                          break;
                        default:
                          badgeColor = 'bg-slate-100 text-slate-600 border-slate-200';
                      }

                      return (
                        <div
                          key={feature.properties.id}
                          id={`card-${feature.properties.id}`}
                          onClick={() => {
                            setActivePoint(feature);
                            // Set layer control to show historic points so it focuses correctly
                            if (!layerControl.historis) {
                              setLayerControl(prev => ({ ...prev, historis: true }));
                            }
                          }}
                          className={`relative cursor-pointer rounded-xl border p-3.5 transition-all duration-200 ${isSelected
                              ? 'border-emerald-500 bg-emerald-50 scale-[1.01] shadow-md shadow-emerald-500/10'
                              : 'border-slate-200 bg-white hover:border-emerald-300 hover:bg-slate-50'
                            }`}
                        >
                          <div className={`absolute top-0 bottom-0 left-0 w-1 rounded-l-xl ${feature.properties.tingkat_kerusakan === 'Berat' ? 'bg-red-500' :
                              feature.properties.tingkat_kerusakan === 'Sedang' ? 'bg-orange-500' : 'bg-yellow-500'
                            }`}></div>

                          <div className="flex flex-col gap-1.5 pl-1.5">
                            <div className="flex items-start justify-between gap-2">
                              <h4 className="font-semibold text-xs text-slate-800 leading-tight">
                                {feature.properties.lokasi_detail}
                              </h4>
                              <span className={`inline-flex shrink-0 items-center rounded-full border px-1.5 py-0.5 text-[9px] font-bold ${badgeColor}`}>
                                {feature.properties.tingkat_kerusakan}
                              </span>
                            </div>

                            <div className="flex justify-between items-center text-[10px] text-slate-500 pt-1 border-t border-slate-100 mt-1">
                              <span>Tgl: {feature.properties.tanggal_kejadian}</span>
                              <span className="flex items-center gap-1 font-mono">
                                {lat.toFixed(4)}, {lng.toFixed(4)}
                              </span>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>

            </div>
          )}

          {/* TAB 2: LAPORKAN LONGSOR (FORM CITIZEN) */}
          {activeTab === 'laporkan' && (
            <div className="space-y-4">
              <div className="rounded-xl bg-teal-50 border border-teal-200 p-4">
                <h3 className="text-sm font-bold text-teal-900 mb-1.5">Panduan Pelaporan Warga</h3>
                <p className="text-xs text-slate-600 leading-relaxed">
                  Untuk mendaftarkan laporan kejadian longsor secara presisi, silakan <strong className="text-teal-700">klik langsung lokasi longsor pada Peta</strong>. Koordinat Lintang (Lat) dan Bujur (Long) akan terisi otomatis.
                </p>
              </div>

              {formMessage && (
                <div className={`p-3 rounded-lg text-xs border ${formMessage.type === 'success'
                    ? 'bg-emerald-50 border-emerald-200 text-emerald-700'
                    : 'bg-red-50 border-red-200 text-red-700'
                  }`}>
                  {formMessage.text}
                </div>
              )}

              <form onSubmit={handleSubmitReport} className="space-y-3.5 text-xs">

                {/* Lat/Long Fields */}
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-slate-700 font-semibold mb-1">Lintang (Latitude)</label>
                    <input
                      type="text"
                      readOnly
                      placeholder="-5.xxxxxx"
                      value={formReport.latitude}
                      className="w-full rounded-lg border border-slate-300 bg-slate-50 px-3 py-2 text-slate-800 font-mono focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-700 font-semibold mb-1">Bujur (Longitude)</label>
                    <input
                      type="text"
                      readOnly
                      placeholder="104.xxxxxx"
                      value={formReport.longitude}
                      className="w-full rounded-lg border border-slate-300 bg-slate-50 px-3 py-2 text-slate-800 font-mono focus:outline-none"
                    />
                  </div>
                </div>
                <p className="text-[10px] text-slate-500 italic">
                  *Klik peta untuk mendapatkan koordinat secara otomatis.
                </p>

                {/* Tanggal Kejadian */}
                <div>
                  <label className="block text-slate-700 font-semibold mb-1">Tanggal Kejadian Longsor</label>
                  <input
                    type="date"
                    required
                    max={new Date().toISOString().split('T')[0]}
                    value={formReport.tanggal_kejadian}
                    onChange={(e) => setFormReport(prev => ({ ...prev, tanggal_kejadian: e.target.value }))}
                    className="w-full rounded-lg border border-slate-300 bg-white px-3.5 py-2 text-slate-800 focus:border-emerald-500 focus:outline-none"
                  />
                </div>

                {/* Deskripsi */}
                <div>
                  <label className="block text-slate-700 font-semibold mb-1">Deskripsi Kondisi / Kronologi</label>
                  <textarea
                    rows={4}
                    required
                    placeholder="Contoh: Terjadi longsoran tebing batuan setinggi 5 meter menutup jalan raya, kemacetan kendaraan sepanjang 500 meter..."
                    value={formReport.deskripsi}
                    onChange={(e) => setFormReport(prev => ({ ...prev, deskripsi: e.target.value }))}
                    className="w-full rounded-lg border border-slate-300 bg-white px-3.5 py-2 text-slate-800 placeholder-slate-400 focus:border-emerald-500 focus:outline-none"
                  ></textarea>
                </div>

                {/* Upload Foto Bukti */}
                <div>
                  <label className="block text-slate-700 font-semibold mb-1.5">
                    Foto Bukti Kejadian
                    <span className="ml-1.5 text-[10px] font-normal text-slate-500">(JPG/PNG/WebP, maks. 5 MB)</span>
                  </label>

                  {/* Drop zone / file picker */}
                  <label
                    htmlFor="foto-upload-input"
                    className={`flex flex-col items-center justify-center gap-2 w-full rounded-xl border-2 border-dashed cursor-pointer transition-all duration-200 py-5 px-3 text-center
                      ${fotoPreview
                        ? 'border-teal-400 bg-teal-50'
                        : 'border-slate-300 bg-white hover:border-teal-400 hover:bg-slate-50'
                      }`}
                  >
                    {fotoPreview ? (
                      <img
                        src={fotoPreview}
                        alt="Preview foto bukti"
                        className="w-full max-h-36 object-cover rounded-lg shadow-md"
                      />
                    ) : (
                      <>
                        <svg className="w-8 h-8 text-teal-600" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75V16.5m-13.5-9L12 3m0 0 4.5 4.5M12 3v13.5" />
                        </svg>
                        <span className="text-[11px] text-slate-500">Klik untuk pilih gambar</span>
                        <span className="text-[10px] text-slate-400">atau seret & lepas file di sini</span>
                      </>
                    )}
                  </label>
                  <input
                    id="foto-upload-input"
                    type="file"
                    accept="image/jpeg,image/jpg,image/png,image/webp"
                    className="hidden"
                    onChange={(e) => {
                      const file = e.target.files[0];
                      if (file) {
                        if (file.size > 5 * 1024 * 1024) {
                          setFormMessage({ type: 'error', text: 'Ukuran gambar melebihi 5 MB.' });
                          return;
                        }
                        setFotoFile(file);
                        setFotoPreview(URL.createObjectURL(file));
                        setFormMessage(null);
                      }
                    }}
                  />

                  {/* Tombol hapus foto */}
                  {fotoPreview && (
                    <button
                      type="button"
                      onClick={() => { setFotoFile(null); setFotoPreview(null); }}
                      className="mt-2 w-full py-1.5 rounded-lg border border-red-200 bg-red-50 text-[11px] text-red-600 hover:bg-red-100 transition cursor-pointer"
                    >
                      🗑 Hapus Foto
                    </button>
                  )}
                </div>


                <button
                  type="submit"
                  className="w-full py-2.5 rounded-lg bg-gradient-to-r from-emerald-600 to-teal-500 text-white font-bold tracking-wide transition-all duration-300 hover:scale-[1.02] hover:shadow-lg hover:shadow-teal-500/30 cursor-pointer text-center"
                >
                  Kirim Laporan Bencana
                </button>
              </form>
            </div>
          )}

          {/* TAB 3: ADMIN PANEL (BPBD MODERATOR) */}
          {activeTab === 'admin' && (
            <div className="space-y-4">

              {!adminAuth ? (
                /* Formulir Login Admin */
                <form onSubmit={handleAdminLogin} className="space-y-3 text-xs">
                  <div className="rounded-xl border border-slate-200 bg-white shadow-sm p-3.5 mb-2">
                    <h3 className="text-sm font-bold text-teal-900 mb-1">Otorisasi Admin BPBD</h3>
                    <p className="text-slate-600">Silakan masukkan password administrasi BPBD untuk memvalidasi laporan warga.</p>
                  </div>

                  {adminError && (
                    <div className="p-2 rounded bg-red-50 border border-red-200 text-red-700">
                      {adminError}
                    </div>
                  )}

                  <div>
                    <label className="block text-slate-700 font-semibold mb-1">Password Admin</label>
                    <input
                      type="password"
                      required
                      placeholder="Masukkan password admin..."
                      value={adminPassword}
                      onChange={(e) => setAdminPassword(e.target.value)}
                      className="w-full rounded-lg border border-slate-300 bg-white px-3.5 py-2.5 text-slate-800 focus:border-emerald-500 focus:outline-none"
                    />
                    <p className="text-[10px] text-slate-500 mt-1">Petunjuk: Gunakan password <code className="bg-slate-100 px-1 border border-slate-200 rounded text-teal-700">admin123</code></p>
                  </div>

                  <button
                    type="submit"
                    className="w-full py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-lg cursor-pointer"
                  >
                    Masuk Panel Admin
                  </button>
                </form>
              ) : (
                /* Dashboard Modul Admin */
                <div className="space-y-4">
                  <div className="flex justify-between items-center border-b border-slate-200 pb-3">
                    <div>
                      <h3 className="text-sm font-bold text-teal-900">BPBD Moderator</h3>
                      <span className="text-[9px] text-teal-700 font-semibold uppercase tracking-wider">Validasi Laporan Lapangan</span>
                    </div>
                    <button
                      onClick={() => setAdminAuth(false)}
                      className="px-2.5 py-1 bg-red-50 hover:bg-red-100 border border-red-200 text-[10px] text-red-600 font-semibold rounded cursor-pointer transition"
                    >
                      Keluar
                    </button>
                  </div>

                  {/* List Laporan di Admin */}
                  <div className="space-y-3">
                    <h4 className="text-xs font-bold uppercase tracking-wider text-teal-700">Verifikasi Laporan Masuk</h4>

                    {!allLaporanAdmin || !allLaporanAdmin.features || allLaporanAdmin.features.length === 0 ? (
                      <p className="text-center text-xs text-slate-500 py-6">Tidak ada laporan masuk dari warga.</p>
                    ) : (
                      <div className="space-y-3">
                        {allLaporanAdmin.features.map((laporan) => {
                          const props = laporan.properties;
                          const [lng, lat] = laporan.geometry.coordinates;

                          return (
                            <div
                              key={props.id_laporan}
                              className={`rounded-xl border p-3.5 space-y-3 transition bg-white shadow-sm ${props.status_validasi
                                  ? 'border-slate-200'
                                  : 'border-amber-300 shadow-md shadow-amber-500/10'
                                }`}
                            >
                              <div className="flex justify-between items-start">
                                <span className={`px-2 py-0.5 rounded text-[8px] font-bold uppercase ${props.status_validasi
                                    ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                                    : 'bg-amber-50 text-amber-700 border border-amber-200 animate-pulse'
                                  }`}>
                                  {props.status_validasi ? 'Valid (Tampil)' : 'Pending'}
                                </span>
                                <span className="text-[10px] text-slate-500 font-mono">
                                  ID: {props.id_laporan}
                                </span>
                              </div>

                              <p className="text-xs text-slate-800 leading-relaxed font-medium">
                                "{props.deskripsi}"
                              </p>

                              {props.foto_bukti && (
                                <img
                                  src={props.foto_bukti}
                                  alt="Bukti Bencana"
                                  className="w-full h-24 object-cover rounded-lg border border-slate-200 shadow-sm"
                                  onError={(e) => { e.target.style.display = 'none'; }}
                                />
                              )}

                              <div className="flex items-center justify-between text-[10px] text-slate-500 border-t border-slate-100 pt-2">
                                <span>Lat/Lng: {lat.toFixed(5)}, {lng.toFixed(5)}</span>
                                <button
                                  onClick={() => {
                                    // Fokus kamera peta ke titik laporan
                                    setActivePoint(laporan);
                                  }}
                                  className="text-teal-600 hover:text-teal-700 font-semibold cursor-pointer underline"
                                >
                                  Fokus Peta
                                </button>
                              </div>

                              {/* Action Buttons */}
                              <div className="grid grid-cols-2 gap-2 pt-1">
                                {!props.status_validasi && (
                                  <button
                                    onClick={() => handleValidateReport(props.id_laporan)}
                                    className="py-1 px-3 bg-emerald-600 hover:bg-emerald-500 text-white font-semibold rounded text-[11px] cursor-pointer text-center shadow-md transition"
                                  >
                                    Validasi & Tampilkan
                                  </button>
                                )}
                                <button
                                  onClick={() => handleDeleteReport(props.id_laporan)}
                                  className={`py-1 px-3 border font-semibold rounded text-[11px] cursor-pointer text-center transition ${props.status_validasi
                                      ? 'col-span-2 bg-red-50 border-red-200 text-red-600 hover:bg-red-100'
                                      : 'bg-red-50 border-red-200 text-red-600 hover:bg-red-100'
                                    }`}
                                >
                                  Hapus Laporan
                                </button>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>
                </div>
              )}

            </div>
          )}

        </div>

        {/* Footer SIG */}
        <div className="p-4 border-t border-slate-200 bg-slate-50 text-center text-[10px] text-slate-500">
          <span>&copy; {new Date().getFullYear()} CoreSlide &bull; Kelompok SIG</span>
        </div>
      </aside>

      {/* PANEL PETA INTERAKTIF LEAFLET */}
      <main className="relative flex-1">

        {/* Floating Reset Button */}
        {activePoint && (
          <button
            onClick={() => setActivePoint(null)}
            className="absolute top-4 right-4 z-9999 flex items-center gap-1.5 rounded-lg bg-white/95 border border-slate-200 px-3.5 py-2.5 text-xs font-semibold text-slate-800 shadow-xl hover:bg-slate-50 cursor-pointer backdrop-blur-md transition duration-200"
          >
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-3.5 h-3.5">
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 15L3 9m0 0l6-6M3 9h12a6 6 0 010 12h-3" />
            </svg>
            Reset Fokus Peta
          </button>
        )}

        {/* Info Label Form Aktif */}
        {activeTab === 'laporkan' && (
          <div className="absolute top-4 left-4 z-9999 p-3 rounded-lg bg-white/95 border border-teal-500 shadow-2xl backdrop-blur-md max-w-72">
            <h4 className="text-[10px] font-bold uppercase tracking-wider text-teal-700 mb-0.5 flex items-center gap-1.5 animate-pulse">
              <span className="h-2 w-2 rounded-full bg-teal-600"></span> Mode Klik Peta Aktif
            </h4>
            <p className="text-[10px] text-slate-600 leading-tight">
              Arahkan kursor ke titik longsor di peta, klik kiri, koordinat Lintang & Bujur akan otomatis dimasukkan pada formulir.
            </p>
          </div>
        )}

        {/* Floating Map Style Switcher (Satellite / Topo / Streets) */}
        <div className="absolute bottom-4 left-4 z-9999 flex flex-col gap-1.5 rounded-xl bg-white/95 border border-slate-200 p-2.5 shadow-xl backdrop-blur-md">
          <span className="text-[9px] font-bold uppercase tracking-wider text-teal-700 px-1.5">Tipe Peta (Base Map)</span>
          <div className="flex gap-1">
            <button
              onClick={() => setMapStyle('satellite')}
              className={`rounded-lg px-2.5 py-1 text-[11px] font-semibold cursor-pointer transition duration-150 ${mapStyle === 'satellite'
                  ? 'bg-teal-600 text-white shadow-md shadow-teal-500/30'
                  : 'text-slate-600 hover:text-teal-800 hover:bg-teal-50'
                }`}
            >
              Google Satelit
            </button>
            <button
              onClick={() => setMapStyle('topography')}
              className={`rounded-lg px-2.5 py-1 text-[11px] font-semibold cursor-pointer transition duration-150 ${mapStyle === 'topography'
                  ? 'bg-teal-600 text-white shadow-md shadow-teal-500/30'
                  : 'text-slate-600 hover:text-teal-800 hover:bg-teal-50'
                }`}
            >
              Stadia Terrain
            </button>
            <button
              onClick={() => setMapStyle('streets')}
              className={`rounded-lg px-2.5 py-1 text-[11px] font-semibold cursor-pointer transition duration-150 ${mapStyle === 'streets'
                  ? 'bg-teal-600 text-white shadow-md shadow-teal-500/30'
                  : 'text-slate-600 hover:text-teal-800 hover:bg-teal-50'
                }`}
            >
              OpenStreetMap
            </button>
          </div>
        </div>

        {/* LEAFLET MAP CONTAINER */}
        <MapContainer
          center={mapCenter}
          zoom={defaultZoom}
          zoomControl={true}
          className="h-full w-full"
        >
          {/* Base Map Layers */}
          {mapStyle === 'satellite' && (
            <TileLayer
              attribution='&copy; Google Hybrid (Satellite & Terrain)'
              url="https://mt1.google.com/vt/lyrs=y&x={x}&y={y}&z={z}"
            />
          )}
          {mapStyle === 'topography' && (
            <TileLayer
              attribution='&copy; OpenTopoMap contributors, SRTM'
              url="https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png"
            />
          )}
          {mapStyle === 'streets' && (
            <TileLayer
              attribution='&copy; OpenStreetMap contributors'
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />
          )}

          {/* Handler untuk Klik Peta */}
          <MapClickHandler onMapClick={handleMapClick} activeTab={activeTab} />

          {/* 1. LAYER Batas Kawasan TNBBS (Polygon Statis) */}
          {layerControl.tnbbs && (
            <Polygon
              positions={tnbbsPolygon}
              pathOptions={{
                color: '#10b981', // Emerald 500
                fillColor: '#10b981',
                fillOpacity: 0.12,
                weight: 2.5,
                dashArray: '5, 8'
              }}
            >
              <Popup>
                <div className="text-xs text-slate-600">
                  <h4 className="font-bold text-sm text-teal-900">Batas Kawasan Hutan TNBBS</h4>
                  <p className="mt-1 leading-normal">Taman Nasional Bukit Barisan Selatan (Lampung). Area hutan lindung berbatasan langsung dengan jalur utama.</p>
                </div>
              </Popup>
            </Polygon>
          )}

          {/* 2. LAYER Zonasi Rawan Longsor (Poligon Choropleth dari Database) */}
          {layerControl.zonasi && !loading && zonasiData?.features && (
            zonasiData.features.map((feature) => {
              const styles = getZonasiColor(feature.properties.kelas_rawan);
              return (
                <Polygon
                  key={feature.properties.id}
                  positions={convertPolygon(feature.geometry)}
                  pathOptions={{
                    color: styles.color,
                    fillColor: styles.fillColor,
                    fillOpacity: 0.6,
                    weight: 1.5
                  }}
                  eventHandlers={{
                    mouseover: (e) => {
                      e.target.setStyle({ fillOpacity: 0.75, weight: 2.5 });
                    },
                    mouseout: (e) => {
                      e.target.setStyle({ fillOpacity: 0.6, weight: 1.5 });
                    }
                  }}
                >
                  <Popup>
                    <div className="text-xs min-w-44 text-slate-600">
                      <div className="border-b border-slate-200 pb-1 mb-1.5 flex justify-between items-center">
                        <h4 className="font-bold text-teal-900 text-sm">Zonasi Kerawanan</h4>
                        <span className="text-[9px] font-semibold text-slate-500">ID: {feature.properties.id}</span>
                      </div>
                      <p className="leading-relaxed"><strong className="text-teal-700">Kelas Kerawanan:</strong> {feature.properties.kelas_rawan}</p>
                      <p className="leading-relaxed"><strong className="text-teal-700">Total Skor (Weighted Sum):</strong> {feature.properties.skor_total}</p>
                      <p className="leading-relaxed"><strong className="text-teal-700">Luas Area:</strong> {feature.properties.luas_area} Ha</p>
                    </div>
                  </Popup>
                </Polygon>
              );
            })
          )}

          {/* 3. LAYER Titik Historis Bencana (Point dari Database - Segitiga Merah) */}
          {layerControl.historis && !loading && historisData?.features && (
            historisData.features.map((feature) => {
              const [lng, lat] = feature.geometry.coordinates;
              const isSelected = activePoint && activePoint.properties.id === feature.properties.id;

              return (
                <Marker
                  key={feature.properties.id}
                  position={[lat, lng]}
                  icon={createTriangleIcon(isSelected)}
                  eventHandlers={{
                    click: () => {
                      setActivePoint(feature);
                      const cardElement = document.getElementById(`card-${feature.properties.id}`);
                      if (cardElement) {
                        cardElement.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
                      }
                    },
                  }}
                >
                  <Popup>
                    <div className="flex flex-col gap-2 min-w-56 text-slate-800">
                      <div className="border-b border-slate-200 pb-1.5">
                        <span className="inline-block px-2 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-wide mb-1 bg-red-50 text-red-600 border border-red-200">
                          Bencana Longsor (Historis)
                        </span>
                        <h4 className="font-bold text-sm leading-tight text-teal-900">{feature.properties.lokasi_detail}</h4>
                      </div>

                      <div className="text-xs space-y-1.5 text-slate-600">
                        {feature.properties.foto_kondisi && (
                          <img
                            src={feature.properties.foto_kondisi}
                            alt="Kondisi Longsor"
                            className="w-full h-24 object-cover rounded-lg border border-slate-200 shadow"
                            onError={(e) => { e.target.style.display = 'none'; }}
                          />
                        )}
                        <p className="leading-relaxed">
                          <strong className="text-teal-700 font-semibold">Tingkat Kerusakan:</strong> {feature.properties.tingkat_kerusakan}
                        </p>
                        <p className="leading-relaxed">
                          <strong className="text-teal-700 font-semibold">Tanggal Kejadian:</strong> {feature.properties.tanggal_kejadian}
                        </p>
                        <div className="flex items-center gap-2 pt-1 text-[9px] text-slate-500 border-t border-slate-200">
                          <span>Lat: {lat.toFixed(5)}</span>
                          <span>Long: {lng.toFixed(5)}</span>
                        </div>
                      </div>
                    </div>
                  </Popup>
                </Marker>
              );
            })
          )}

          {/* 4. LAYER Posko & Fasilitas Darurat (Point Statis) */}
          {layerControl.posko && (
            poskoList.map((posko) => (
              <Marker
                key={posko.id}
                position={posko.koordinat}
                icon={createMedicalIcon()}
              >
                <Popup>
                  <div className="text-xs min-w-48 text-slate-800">
                    <div className="border-b border-slate-200 pb-1 mb-1.5">
                      <span className="inline-block px-2 py-0.5 rounded-full text-[9px] font-bold uppercase bg-blue-50 text-blue-700 border border-blue-200">
                        {posko.tipe}
                      </span>
                      <h4 className="font-bold text-teal-900 text-sm mt-1">{posko.nama}</h4>
                    </div>
                    <p className="text-slate-600 leading-normal mb-1">{posko.deskripsi}</p>
                    <div className="text-[9px] text-slate-500 flex gap-2 border-t border-slate-200 pt-1.5 mt-1.5 font-mono">
                      <span>Lat: {posko.koordinat[0]}</span>
                      <span>Long: {posko.koordinat[1]}</span>
                    </div>
                  </div>
                </Popup>
              </Marker>
            ))
          )}

          {/* 5. LAYER Laporan Kerusakan Warga (Point dari Database) */}
          {layerControl.laporan && !loading && laporanWarga?.features && (
            laporanWarga.features
              .filter(feature => feature.geometry && Array.isArray(feature.geometry.coordinates))
              .map((feature) => {
                const props = feature.properties;
                const [lng, lat] = feature.geometry.coordinates;
                const isSelected = activePoint && activePoint.properties.id_laporan === props.id_laporan;

                return (
                  <Marker
                    key={props.id_laporan}
                    position={[lat, lng]}
                    icon={createWarningIcon(isSelected)}
                    eventHandlers={{
                      click: () => setActivePoint(feature)
                    }}
                  >
                    <Popup>
                      <div className="flex flex-col gap-2 min-w-56 text-slate-800">
                        <div className="border-b border-slate-200 pb-1.5">
                          <span className="inline-block px-2 py-0.5 rounded-full text-[9px] font-bold uppercase bg-amber-50 text-amber-700 border border-amber-200">
                            Laporan Warga (Tervalidasi)
                          </span>
                          <h4 className="font-semibold text-xs leading-tight text-slate-800 mt-1">" {props.deskripsi} "</h4>
                        </div>

                        <div className="text-xs space-y-1.5 text-slate-600">
                          {props.foto_bukti && (
                            <img
                              src={props.foto_bukti}
                              alt="Laporan Warga"
                              className="w-full h-24 object-cover rounded-lg border border-slate-200 shadow"
                              onError={(e) => { e.target.style.display = 'none'; }}
                            />
                          )}
                          <p className="text-[10px] text-slate-500">
                            <strong className="text-teal-700">Dilaporkan pada:</strong><br />
                            {new Date(props.waktu_kirim).toLocaleString('id-ID')}
                          </p>
                          <div className="flex items-center gap-2 pt-1 text-[9px] text-slate-500 border-t border-slate-200">
                            <span>Lat: {lat.toFixed(5)}</span>
                            <span>Long: {lng.toFixed(5)}</span>
                          </div>
                        </div>
                      </div>
                    </Popup>
                  </Marker>
                );
              })
          )}

          {/* Temporary Marker untuk Koordinat yang dipilih saat melapor */}
          {activeTab === 'laporkan' && formReport.latitude && formReport.longitude && (
            <Marker
              position={[parseFloat(formReport.latitude), parseFloat(formReport.longitude)]}
              icon={createSelectedIcon()}
            >
              <Popup>
                <div className="text-center text-xs p-1">
                  <span className="font-bold text-teal-900 block">Posisi Laporan Dipilih</span>
                  <span className="text-[9px] text-teal-700 block font-mono">
                    {formReport.latitude}, {formReport.longitude}
                  </span>
                </div>
              </Popup>
            </Marker>
          )}

          {/* Pengontrol gerakan kamera peta */}
          <MapController activePoint={activePoint} />
        </MapContainer>
      </main>

    </div>
  );
}
