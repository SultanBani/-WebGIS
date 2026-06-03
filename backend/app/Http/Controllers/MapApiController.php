<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Validator;

class MapApiController extends Controller
{
    /**
     * Mengambil data titik longsor (historis) dalam format GeoJSON FeatureCollection
     */
    public function getTitikLongsor()
    {
        try {
            $data = DB::table('titik_longsor')
                ->select([
                    'id',
                    'lokasi_detail',
                    'tingkat_kerusakan',
                    'tanggal_kejadian',
                    'foto_kondisi',
                    DB::raw('ST_AsGeoJSON(koordinat) as geometry')
                ])
                ->get();

            $features = $data->map(function ($item) {
                return [
                    'type' => 'Feature',
                    'geometry' => json_decode($item->geometry),
                    'properties' => [
                        'id' => $item->id,
                        'lokasi_detail' => $item->lokasi_detail,
                        'tingkat_kerusakan' => $item->tingkat_kerusakan,
                        'tanggal_kejadian' => $item->tanggal_kejadian,
                        'foto_kondisi' => $item->foto_kondisi,
                    ]
                ];
            });

            return response()->json([
                'type' => 'FeatureCollection',
                'features' => $features
            ], 200, [], JSON_UNESCAPED_SLASHES | JSON_PRETTY_PRINT);
        } catch (\Exception $e) {
            return response()->json([
                'status' => 'error',
                'message' => 'Gagal mengambil data titik longsor: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Mengambil data zonasi rawan (poligon) dalam format GeoJSON FeatureCollection
     */
    public function getZonasiRawan()
    {
        try {
            $data = DB::table('zonasi_rawan')
                ->select([
                    'id',
                    'kelas_rawan',
                    'skor_total',
                    'luas_area',
                    DB::raw('ST_AsGeoJSON(geom) as geometry')
                ])
                ->get();

            $features = $data->map(function ($item) {
                return [
                    'type' => 'Feature',
                    'geometry' => json_decode($item->geometry),
                    'properties' => [
                        'id' => $item->id,
                        'kelas_rawan' => $item->kelas_rawan,
                        'skor_total' => $item->skor_total,
                        'luas_area' => $item->luas_area,
                    ]
                ];
            });

            return response()->json([
                'type' => 'FeatureCollection',
                'features' => $features
            ], 200, [], JSON_UNESCAPED_SLASHES | JSON_PRETTY_PRINT);
        } catch (\Exception $e) {
            return response()->json([
                'status' => 'error',
                'message' => 'Gagal mengambil data zonasi rawan: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Mengambil data laporan warga dalam format GeoJSON FeatureCollection
     * Menyaring data tervalidasi untuk konsumsi umum, atau menampilkan semua untuk admin (?all=true)
     */
    public function getLaporanWarga(Request $request)
    {
        try {
            $query = DB::table('laporan_warga');
            
            if ($request->query('all') !== 'true') {
                $query->where('status_validasi', true);
            }

            $data = $query->select([
                'id_laporan',
                'deskripsi',
                'foto_bukti',
                'status_validasi',
                'waktu_kirim',
                DB::raw('ST_AsGeoJSON(koordinat_laporan) as geometry')
            ])->get();

            $features = $data->map(function ($item) {
                return [
                    'type' => 'Feature',
                    'geometry' => json_decode($item->geometry),
                    'properties' => [
                        'id_laporan' => $item->id_laporan,
                        'deskripsi' => $item->deskripsi,
                        'foto_bukti' => $item->foto_bukti,
                        'status_validasi' => (bool)$item->status_validasi,
                        'waktu_kirim' => $item->waktu_kirim,
                    ]
                ];
            });

            return response()->json([
                'type' => 'FeatureCollection',
                'features' => $features
            ], 200, [], JSON_UNESCAPED_SLASHES | JSON_PRETTY_PRINT);
        } catch (\Exception $e) {
            return response()->json([
                'status' => 'error',
                'message' => 'Gagal mengambil data laporan warga: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Menyimpan laporan baru dari warga
     */
    public function storeLaporanWarga(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'latitude' => 'required|numeric',
            'longitude' => 'required|numeric',
            'deskripsi' => 'required|string',
            'foto_bukti' => 'nullable|string',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'status' => 'error',
                'message' => 'Data input tidak valid.',
                'errors' => $validator->errors()
            ], 400);
        }

        try {
            $lat = $request->input('latitude');
            $lng = $request->input('longitude');
            $deskripsi = $request->input('deskripsi');
            $foto_bukti = $request->input('foto_bukti');

            DB::table('laporan_warga')->insert([
                'koordinat_laporan' => DB::raw("ST_GeomFromText('POINT({$lat} {$lng})', 4326)"),
                'deskripsi' => $deskripsi,
                'foto_bukti' => $foto_bukti,
                'status_validasi' => false, // Default tidak valid, menunggu moderasi admin
                'waktu_kirim' => now()
            ]);

            return response()->json([
                'status' => 'success',
                'message' => 'Laporan longsor berhasil dikirim dan menunggu validasi admin BPBD.'
            ], 201);
        } catch (\Exception $e) {
            return response()->json([
                'status' => 'error',
                'message' => 'Gagal menyimpan laporan warga: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Memvalidasi laporan warga oleh admin
     */
    public function validateLaporanWarga($id)
    {
        try {
            $affected = DB::table('laporan_warga')
                ->where('id_laporan', $id)
                ->update(['status_validasi' => true]);

            if ($affected === 0) {
                return response()->json([
                    'status' => 'error',
                    'message' => 'Laporan tidak ditemukan atau sudah divalidasi.'
                ], 404);
            }

            return response()->json([
                'status' => 'success',
                'message' => 'Laporan berhasil divalidasi dan akan ditampilkan pada peta utama.'
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'status' => 'error',
                'message' => 'Gagal memvalidasi laporan warga: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Menghapus laporan warga oleh admin
     */
    public function deleteLaporanWarga($id)
    {
        try {
            $affected = DB::table('laporan_warga')
                ->where('id_laporan', $id)
                ->delete();

            if ($affected === 0) {
                return response()->json([
                    'status' => 'error',
                    'message' => 'Laporan tidak ditemukan.'
                ], 404);
            }

            return response()->json([
                'status' => 'success',
                'message' => 'Laporan berhasil dihapus.'
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'status' => 'error',
                'message' => 'Gagal menghapus laporan warga: ' . $e->getMessage()
            ], 500);
        }
    }
}
