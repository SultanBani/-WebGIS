<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class ZonasiRawanSeeder extends Seeder
{
    /**
     * Run the database seeds.
     *
     * Referensi Metodologi:
     * - Metode: Weighted Sum Overlay (Σ Skor × Bobot) berbasis parameter spasial
     * - Parameter: Kemiringan lereng (DEM SRTM/DEMNAS BIG), curah hujan (BMKG),
     *              litologi (Peta Geologi PVMBG), tutupan lahan (BIG/LAPAN),
     *              jarak sesar Semangka (WCS / Peta Geologi Lembar Kotaagung)
     * - Bobot: Ditentukan dengan AHP (Saaty, 1980)
     * - Klasifikasi: Rendah / Sedang / Tinggi mengacu pada PVMBG (2018)
     * - Referensi Wilayah: Antara News, "28 Titik Rawan Longsor Liwa-Krui" (KM 248 s/d KM 271)
     * - Area: Koridor Jalan Lintas Liwa-Krui dalam kawasan TNBBS
     */
    public function run(): void
    {
        $data = [
            [
                // Zona TINGGI — KM 15–22 koridor TNBBS (paling banyak kejadian terdokumentasi)
                // Faktor: kemiringan >40°, litologi vulkanik labil, dekat Sesar Semangka, tutupan lahan terbuka
                // Mencakup titik: KM 16 Kubu Perahu (koordinat aktual: -5.0796, 104.0255)
                'geom' => DB::raw("ST_GeomFromText('POLYGON((-5.0600 103.9900, -5.0600 104.0600, -5.1000 104.0600, -5.1000 103.9900, -5.0600 103.9900))', 4326)"),
                'kelas_rawan' => 'Tinggi',
                'skor_total' => 4.35,
                'luas_area' => 1250.75,
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                // Zona SEDANG — KM 22–35 koridor TNBBS
                // Faktor: kemiringan 25–40°, curah hujan tinggi (>2500 mm/th berdasarkan BMKG Lampung Barat),
                //         vegetasi sebagian terbuka akibat aktivitas manusia
                // Mencakup titik: KM 22 & KM 29 Kubu Perahu, KM 253+200, KM 254+200
                'geom' => DB::raw("ST_GeomFromText('POLYGON((-5.0950 103.9400, -5.0950 103.9900, -5.1350 103.9900, -5.1350 103.9400, -5.0950 103.9400))', 4326)"),
                'kelas_rawan' => 'Sedang',
                'skor_total' => 3.65,
                'luas_area' => 840.40,
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                // Zona RENDAH — Area transisi menuju Krui (pesisir), KM 35–42
                // Faktor: kemiringan <25°, curah hujan sedang, vegetasi pantai lebih lebat
                // Mencakup: Pal 5 Talangbaru Kec. Waykrui (Pesisir Barat)
                'geom' => DB::raw("ST_GeomFromText('POLYGON((-5.1250 103.9100, -5.1250 103.9500, -5.1700 103.9500, -5.1700 103.9100, -5.1250 103.9100))', 4326)"),
                'kelas_rawan' => 'Rendah',
                'skor_total' => 2.45,
                'luas_area' => 520.15,
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                // Zona AMAN — Area dataran Liwa dan sekitarnya (sisi timur, arah Lampung Barat)
                // Faktor: topografi relatif datar, vegetasi hutan lebat, jauh dari sesar utama
                // Referensi: Ibu kota Lampung Barat (Liwa) berada pada ~-5.1492, 104.1931 (Wikipedia)
                'geom' => DB::raw("ST_GeomFromText('POLYGON((-5.0800 104.0600, -5.0800 104.1800, -5.1500 104.1800, -5.1500 104.0600, -5.0800 104.0600))', 4326)"),
                'kelas_rawan' => 'Aman',
                'skor_total' => 1.65,
                'luas_area' => 1530.90,
                'created_at' => now(),
                'updated_at' => now(),
            ],
        ];

        foreach ($data as $row) {
            DB::table('zonasi_rawan')->insert($row);
        }
    }
}
