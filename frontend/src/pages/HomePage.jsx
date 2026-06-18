import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { MapContainer, TileLayer, Marker, Popup, Polygon, useMap } from 'react-leaflet';
import L from 'leaflet';

// ── Icon helpers ──────────────────────────────────────────────────────────────
const createTriangleIcon = (isActive) => {
  const size = isActive ? 28 : 20;
  return L.divIcon({
    html: `<svg width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" style="filter:drop-shadow(0 2px 5px rgba(0,0,0,0.5))">
             <polygon points="12,3 22,21 2,21" fill="#ef4444" stroke="#ffffff" stroke-width="2" stroke-linejoin="round"/>
           </svg>`,
    className: '', iconSize: [size, size], iconAnchor: [size / 2, size],
  });
};
const createMedicalIcon = () => L.divIcon({
  html: `<div style="width:24px;height:24px;border-radius:50%;background:#2563eb;border:2px solid white;display:flex;align-items:center;justify-content:center;box-shadow:0 2px 8px rgba(0,0,0,0.5)">
           <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="3" stroke-linecap="round">
             <line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>
           </svg></div>`,
  className: '', iconSize: [24, 24], iconAnchor: [12, 12],
});
const createWarningIcon = () => L.divIcon({
  html: `<div style="width:24px;height:24px;border-radius:50%;background:#f59e0b;border:2px solid white;display:flex;align-items:center;justify-content:center;box-shadow:0 2px 8px rgba(0,0,0,0.5)">
           <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="3" stroke-linecap="round">
             <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/>
             <line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/>
           </svg></div>`,
  className: '', iconSize: [24, 24], iconAnchor: [12, 12],
});

// ── Static data ───────────────────────────────────────────────────────────────
const tnbbsPolygon = [
  [-5.0500, 103.9500], [-5.0600, 104.0400], [-5.0750, 104.1000],
  [-5.0900, 104.1600], [-5.1000, 104.1900], [-5.1500, 104.1900],
  [-5.1600, 104.1400], [-5.1500, 104.0800], [-5.1350, 104.0200],
  [-5.1200, 103.9700], [-5.0900, 103.9300], [-5.0500, 103.9500],
];
const poskoList = [
  { id: 'p1', nama: 'Kantor BPBD Kabupaten Lampung Barat', tipe: 'Posko BPBD', koordinat: [-5.1065, 104.1850] },
  { id: 'p2', nama: 'Posko Taktis BPBD Jalur TNBBS (KM 15)', tipe: 'Posko Siaga', koordinat: [-5.0800, 104.0300] },
  { id: 'p3', nama: 'UPT Puskesmas Krui (Pos Evakuasi Medis)', tipe: 'Fasilitas Medis', koordinat: [-5.1563, 103.9483] },
];

function MapFlyTo({ activePoint }) {
  const map = useMap();
  useEffect(() => {
    if (activePoint?.geometry?.coordinates) {
      const [lng, lat] = activePoint.geometry.coordinates;
      map.flyTo([lat, lng], 15, { animate: true, duration: 1.5 });
    }
  }, [activePoint, map]);
  return null;
}

const zonasiColors = { Tinggi: '#ef4444', Sedang: '#f97316', Rendah: '#eab308', Aman: '#22c55e' };
const convertPolygon = (geom) =>
  geom?.type === 'Polygon' ? geom.coordinates.map(ring => ring.map(c => [c[1], c[0]])) : [];

export default function HomePage() {
  const [historis, setHistoris] = useState(null);
  const [zonasi, setZonasi] = useState(null);
  const [laporan, setLaporan] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activePoint, setActivePoint] = useState(null);
  const [search, setSearch] = useState('');
  const [layers, setLayers] = useState({ tnbbs: true, zonasi: true, historis: true, posko: true, laporan: true });
  const [mapStyle, setMapStyle] = useState('satellite');

  const tileLayers = {
    satellite: 'https://mt1.google.com/vt/lyrs=y&x={x}&y={y}&z={z}',
    streets: 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
    topography: 'https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png',
  };

  useEffect(() => {
    const load = async () => {
      try {
        const [rH, rZ, rL] = await Promise.all([
          fetch('https://webgis-production-93ef.up.railway.app/api/titik-longsor'),
          fetch('https://webgis-production-93ef.up.railway.app/api/zonasi-rawan'),
          fetch('https://webgis-production-93ef.up.railway.app/api/laporan-warga'),
        ]);
        setHistoris(await rH.json());
        setZonasi(await rZ.json());
        setLaporan(await rL.json());
      } catch (e) { console.error(e); }
      finally { setLoading(false); }
    };
    load();
  }, []);

  const stats = {
    total: historis?.features?.length || 0,
    berat: historis?.features?.filter(f => f.properties.tingkat_kerusakan === 'Berat').length || 0,
    sedang: historis?.features?.filter(f => f.properties.tingkat_kerusakan === 'Sedang').length || 0,
    ringan: historis?.features?.filter(f => f.properties.tingkat_kerusakan === 'Ringan').length || 0,
  };

  const filtered = historis?.features?.filter(f =>
    f.properties.lokasi_detail.toLowerCase().includes(search.toLowerCase())
  ) || [];

  const toggleLayer = (key) => setLayers(p => ({ ...p, [key]: !p[key] }));

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-gradient-to-br from-[#8ba8be] via-[#e2c7a7] to-[#f7b464] pt-16">

      {/* ── SIDEBAR ───────────────────────────────────────────────── */}
      <aside className="z-10 flex w-96 max-w-96 shrink-0 flex-col border-r border-slate-200
        bg-white/95 backdrop-blur-md shadow-2xl overflow-y-auto overflow-x-hidden custom-scrollbar">

        {/* Stats bar */}
        <div className="p-4 border-b border-slate-100 space-y-3">
          <h2 className="text-xs font-bold uppercase tracking-widest text-[#d97706]">
            Statistik Bencana
          </h2>
          <div className="grid grid-cols-4 gap-2">
            {[
              { label: 'Total', val: stats.total, color: 'text-slate-800', bg: 'bg-slate-50 border-slate-100' },
              { label: 'Berat', val: stats.berat, color: 'text-red-650 text-red-600', bg: 'bg-red-50 border-red-100/50' },
              { label: 'Sedang', val: stats.sedang, color: 'text-orange-650 text-orange-600', bg: 'bg-orange-50 border-orange-100/50' },
              { label: 'Ringan', val: stats.ringan, color: 'text-yellow-650 text-yellow-600', bg: 'bg-yellow-50 border-yellow-100/50' },
            ].map(s => (
              <div key={s.label} className={`${s.bg} rounded-xl p-2.5 text-center border`}>
                <div className={`text-xl font-extrabold ${s.color}`}>{loading ? '–' : s.val}</div>
                <div className="text-[9px] text-slate-500 uppercase font-bold mt-0.5">{s.label}</div>
              </div>
            ))}
          </div>

          {/* CTA laporan */}
          <Link to="/laporan"
            className="flex items-center justify-center gap-2 w-full py-2.5 rounded-xl
              bg-gradient-to-r from-[#8ba8be] to-[#f7b464] hover:from-[#7a96ab] hover:to-[#e5a353]
              text-white text-xs font-bold shadow-md shadow-[#8ba8be]/10 transition-all">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126ZM12 15.75h.007v.008H12v-.008Z" />
            </svg>
            Laporkan Bencana
          </Link>
        </div>

        {/* Layer controls */}
        <div className="p-4 border-b border-slate-100">
          <h3 className="text-xs font-bold uppercase tracking-widest text-[#d97706] mb-3">Kontrol Layer</h3>
          <div className="space-y-1.5">
            {[
              { key: 'tnbbs', label: 'Batas TNBBS', dot: 'bg-slate-500' },
              { key: 'zonasi', label: 'Zonasi Rawan', dot: 'bg-gradient-to-r from-red-500 to-green-500' },
              { key: 'historis', label: 'Titik Historis', dot: 'bg-red-500' },
              { key: 'posko', label: 'Posko & Fasilitas', dot: 'bg-blue-500' },
              { key: 'laporan', label: 'Laporan Warga', dot: 'bg-amber-500' },
            ].map(l => (
              <label key={l.key} className="flex items-center justify-between cursor-pointer
                px-3 py-1.5 rounded-lg hover:bg-slate-50 transition">
                <span className="flex items-center gap-2 text-xs text-slate-700 font-medium">
                  <span className={`w-2.5 h-2.5 rounded-full ${l.dot}`} />
                  {l.label}
                </span>
                <input type="checkbox" checked={layers[l.key]}
                  onChange={() => toggleLayer(l.key)}
                  className="accent-[#8ba8be] h-4 w-4" />
              </label>
            ))}
          </div>
        </div>

        {/* Daftar historis */}
        <div className="p-4 space-y-3 mb-10">
          <div className="flex justify-between items-center">
            <h3 className="text-xs font-bold uppercase tracking-widest text-[#d97706] font-bold">Titik Historis</h3>
            <span className="text-[10px] bg-slate-50 text-[#d97706] border border-slate-200 px-2 py-0.5 rounded-full font-semibold font-semibold">
              {filtered.length} lokasi
            </span>
          </div>
          <input
            type="text" placeholder="Cari lokasi..."
            value={search} onChange={e => setSearch(e.target.value)}
            className="w-full rounded-lg border border-slate-200 bg-slate-50
              px-3 py-2 text-xs text-slate-800 placeholder-slate-400
              focus:bg-white focus:border-[#8ba8be] focus:outline-none"
          />
          {loading ? (
            <div className="flex justify-center py-8">
              <div className="h-6 w-6 animate-spin rounded-full border-2 border-[#8ba8be] border-t-transparent" />
            </div>
          ) : filtered.map(f => {
            const sel = activePoint?.properties?.id === f.properties.id;
            const [lng, lat] = f.geometry.coordinates;
            const clr = f.properties.tingkat_kerusakan === 'Berat' ? 'red'
              : f.properties.tingkat_kerusakan === 'Sedang' ? 'orange' : 'yellow';
            return (
              <div key={f.properties.id}
                onClick={() => setActivePoint(f)}
                className={`cursor-pointer rounded-xl border p-3 transition-all duration-200
                  ${sel ? 'border-[#8ba8be] bg-slate-50/60 shadow-sm scale-[1.01]'
                    : 'border-slate-100 bg-white hover:bg-slate-50/80 hover:border-slate-200'}`}>
                <div className={`h-0.5 w-8 rounded-full mb-2
                  ${clr === 'red' ? 'bg-red-500' : clr === 'orange' ? 'bg-orange-500' : 'bg-yellow-500'}`} />
                <div className="flex items-start justify-between gap-2">
                  <p className="text-xs font-bold text-slate-800 leading-snug">{f.properties.lokasi_detail}</p>
                  <span className={`shrink-0 text-[9px] font-bold px-2 py-0.5 rounded-full border
                    ${clr === 'red' ? 'bg-red-50 border-red-100 text-red-600' : clr === 'orange' ? 'bg-orange-50 border-orange-100 text-orange-600' : 'bg-yellow-50 border-yellow-100 text-yellow-600'}`}>
                    {f.properties.tingkat_kerusakan}
                  </span>
                </div>
                <div className="mt-1.5 text-[10px] text-slate-500 space-y-0.5">
                  <div className="flex justify-between">
                    <span>Tanggal: <strong>{f.properties.tanggal_kejadian}</strong></span>
                  </div>
                  <div className="text-[9px] font-mono text-slate-400">
                    Lat/Lng: {lat.toFixed(6)}, {lng.toFixed(6)}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </aside>

      {/* ── MAP ───────────────────────────────────────────────────── */}
      <div className="flex-1 relative">
        <MapContainer
          center={[-5.1050, 104.0700]} zoom={11}
          style={{ width: '100%', height: '100%' }}
          zoomControl={false}>
          <MapFlyTo activePoint={activePoint} />
          <TileLayer url={tileLayers[mapStyle]} attribution="" />

          {/* TNBBS border */}
          {layers.tnbbs && (
            <Polygon positions={tnbbsPolygon}
              pathOptions={{ color: '#f7b464', fillColor: 'transparent', weight: 2.5, dashArray: '6 4' }} />
          )}

          {/* Zonasi */}
          {layers.zonasi && zonasi?.features?.map(f => {
            const clr = zonasiColors[f.properties.kelas_rawan] || '#9ca3af';
            return (
              <Polygon key={f.properties.id} positions={convertPolygon(f.geometry)}
                pathOptions={{ color: clr, fillColor: clr, fillOpacity: 0.25, weight: 1.5 }}>
                <Popup>
                  <div className="text-sm font-bold text-slate-800">{f.properties.kelas_rawan}</div>
                  <div className="text-xs text-slate-600">Skor: {f.properties.skor_total} | Luas: {f.properties.luas_area} ha</div>
                </Popup>
              </Polygon>
            );
          })}

          {/* Titik Historis */}
          {layers.historis && historis?.features?.map(f => {
            const [lng, lat] = f.geometry.coordinates;
            const sel = activePoint?.properties?.id === f.properties.id;
            return (
              <Marker key={f.properties.id} position={[lat, lng]} icon={createTriangleIcon(sel)}>
                <Popup>
                  <div className="space-y-1 text-slate-800">
                    <div className="font-bold text-sm">{f.properties.lokasi_detail}</div>
                    <div className="text-xs text-red-650 text-red-600 font-semibold">Tingkat: {f.properties.tingkat_kerusakan}</div>
                    <div className="text-xs text-slate-500">Tanggal: {f.properties.tanggal_kejadian}</div>
                    <div className="text-[10px] text-slate-400 font-mono">Koordinat: {lat.toFixed(6)}, {lng.toFixed(6)}</div>
                    {f.properties.foto_kondisi && (
                      <img src={f.properties.foto_kondisi} className="w-full rounded-lg mt-1 border border-slate-200" alt="Foto kondisi" />
                    )}
                  </div>
                </Popup>
              </Marker>
            );
          })}

          {/* Posko */}
          {layers.posko && poskoList.map(p => (
            <Marker key={p.id} position={p.koordinat} icon={createMedicalIcon()}>
              <Popup>
                <div className="font-bold text-sm text-slate-800">{p.nama}</div>
                <div className="text-xs text-blue-600 font-semibold">{p.tipe}</div>
              </Popup>
            </Marker>
          ))}

          {/* Laporan Warga */}
          {layers.laporan && laporan?.features?.map(f => {
            const [lng, lat] = f.geometry.coordinates;
            return (
              <Marker key={f.properties.id_laporan} position={[lat, lng]} icon={createWarningIcon()}>
                <Popup>
                  <div className="space-y-1 text-slate-800">
                    <div className="font-bold text-sm text-amber-600">Laporan Warga</div>
                    <div className="text-xs text-slate-700">{f.properties.deskripsi}</div>
                    {f.properties.tanggal_kejadian && <div className="text-xs text-slate-500">{f.properties.tanggal_kejadian}</div>}
                    {f.properties.foto_bukti && (
                      <img src={f.properties.foto_bukti} className="w-full rounded-lg mt-1 border border-slate-200" alt="Foto bukti" />
                    )}
                  </div>
                </Popup>
              </Marker>
            );
          })}
        </MapContainer>

        {/* Floating Map Style Switcher (Satellite / Topography / Streets) */}
        <div className="absolute bottom-4 left-4 z-[1000] flex flex-col gap-1 rounded-xl bg-white/90 border border-slate-200 p-2.5 shadow-xl backdrop-blur-md">
          <span className="text-[9px] font-bold uppercase tracking-wider text-slate-500 px-1.5 font-semibold">Tipe Peta (Base Map)</span>
          <div className="flex gap-1">
            {[
              ['satellite', 'Satelit'],
              ['topography', 'Topo'],
              ['streets', 'Jalan']
            ].map(([k, lb]) => (
              <button
                key={k}
                onClick={() => setMapStyle(k)}
                className={`rounded-lg px-2.5 py-1 text-[11px] font-bold cursor-pointer transition duration-150 ${
                  mapStyle === k
                    ? 'bg-[#7a96ab] text-white shadow shadow-slate-800/30'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                }`}
              >
                {lb}
              </button>
            ))}
          </div>
        </div>

        {/* Legend overlay */}
        <div className="absolute bottom-4 right-4 z-[1000]
          bg-white/90 backdrop-blur-sm border border-slate-200
          rounded-xl p-3 shadow-xl space-y-1.5 text-[10px] text-slate-600 min-w-[140px]">
          <div className="font-bold text-xs text-[#d97706] mb-2">Legenda</div>
          {[
            { color: 'bg-red-500', label: 'Zona Tinggi' },
            { color: 'bg-orange-500', label: 'Zona Sedang' },
            { color: 'bg-yellow-500', label: 'Zona Rendah' },
            { color: 'bg-green-500', label: 'Zona Aman' },
          ].map(l => (
            <div key={l.label} className="flex items-center gap-2">
              <span className={`w-3 h-3 rounded-sm ${l.color} opacity-70`} />
              {l.label}
            </div>
          ))}
          <div className="border-t border-slate-200 pt-1.5 mt-1 space-y-1.5">
            <div className="flex items-center gap-2">
              <span className="text-red-500 font-bold text-base leading-none">▲</span> Historis
            </div>
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 rounded-full bg-blue-500" /> Posko
            </div>
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 rounded-full bg-amber-500" /> Laporan
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
