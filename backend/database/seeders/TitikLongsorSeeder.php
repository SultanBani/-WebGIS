<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class TitikLongsorSeeder extends Seeder
{
    /**
     * Run the database seeds.
     *
     * Referensi Data:
     * [1] Kupas Tuntas, "Longsor di Jalur Krui-Liwa KM 16", 11 Mei 2026 → koordinat aktual: -5.079616, 104.025507
     * [2] Antara News, "BPJN tangani 5 titik longsor ruas Liwa-Krui", Juli 2025 → KM 253+700, ambles 45m
     * [3] Media Lampung / BPBD Lampung Barat, September 2025 → KM 22 & KM 29 Kubu Perahu, longsor musim hujan
     * [4] BPBD Pesisir Barat, "Longsor Pal 5 Talangbaru Waykrui", 30 September 2025
     * [5] Antara News, "28 Titik Rawan Longsor Liwa-Krui" → KM 248+150 s/d KM 271+350
     */
    public function run(): void
    {
        $data = [
            [
                // Ref [1]: Koordinat aktual dari liputan media, kejadian 11 Mei 2026
                // Sumber: kupastuntas.co — "Longsor di Jalur Krui-Liwa Kembali Terjadi, KM 16"
                'koordinat' => DB::raw("ST_GeomFromText('POINT(-5.0796 104.0255)', 4326)"),
                'lokasi_detail' => 'KM 16 Jalan Lintas Liwa-Krui, Pekon Kubu Perahu, Kec. Balik Bukit',
                'tingkat_kerusakan' => 'Berat',
                'tanggal_kejadian' => '2026-05-11',
                'foto_kondisi' => 'https://images.unsplash.com/photo-1541888946425-d81bb19240f5?q=80&w=600',
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                // Ref [2]: KM 253+700, longsoran ambles sepanjang 45 meter, Juli 2025
                // Sumber: antaranews.com — "BPJN Tangani Darurat 5 Titik Longsor Ruas Liwa-Krui"
                // Koordinat estimasi berdasarkan posisi ruas dalam kawasan TNBBS
                'koordinat' => DB::raw("ST_GeomFromText('POINT(-5.1280 104.0480)', 4326)"),
                'lokasi_detail' => 'KM 253+700 Jalan Lintas Nasional Liwa-Krui (Dalam Kawasan TNBBS)',
                'tingkat_kerusakan' => 'Berat',
                'tanggal_kejadian' => '2025-07-15',
                'foto_kondisi' => 'https://images.unsplash.com/photo-1582298538104-fc2c0a5a0027?q=80&w=600',
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                // Ref [3]: KM 22 Kubu Perahu, longsor musim hujan September 2025
                // Sumber: BPBD Lampung Barat via medialampung.co.id & inilampung.com
                // Koordinat estimasi berdasarkan jarak KM dari titik acuan KM 16
                'koordinat' => DB::raw("ST_GeomFromText('POINT(-5.0910 103.9980)', 4326)"),
                'lokasi_detail' => 'KM 22 Jalan Lintas Liwa-Krui, Pekon Kubu Perahu, Kec. Balik Bukit',
                'tingkat_kerusakan' => 'Sedang',
                'tanggal_kejadian' => '2025-09-15',
                'foto_kondisi' => 'https://images.unsplash.com/photo-1578328819058-b69f3a3b0f6b?q=80&w=600',
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                // Ref [3]: KM 29 Kubu Perahu, longsor musim hujan September 2025
                // Sumber: BPBD Lampung Barat via medialampung.co.id — jalur sempat disekat kendaraan roda 6+
                // Koordinat estimasi berdasarkan jarak KM dari titik acuan KM 16
                'koordinat' => DB::raw("ST_GeomFromText('POINT(-5.1050 103.9760)', 4326)"),
                'lokasi_detail' => 'KM 29 Jalan Lintas Liwa-Krui, Pekon Kubu Perahu, Kec. Balik Bukit',
                'tingkat_kerusakan' => 'Berat',
                'tanggal_kejadian' => '2025-09-15',
                'foto_kondisi' => 'https://images.unsplash.com/photo-1547683905-f686c993aae5?q=80&w=600',
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                // Ref [4]: Pal 5 Talangbaru, longsor 30 September 2025, ganggu lalin roda 4
                // Sumber: BPBD Pesisir Barat — Kecamatan Waykrui, Kabupaten Pesisir Barat
                // Koordinat estimasi berdasarkan lokasi Kec. Waykrui di peta Pesisir Barat
                'koordinat' => DB::raw("ST_GeomFromText('POINT(-5.1200 103.9600)', 4326)"),
                'lokasi_detail' => 'Pal 5 Talangbaru, Kec. Waykrui, Kabupaten Pesisir Barat',
                'tingkat_kerusakan' => 'Ringan',
                'tanggal_kejadian' => '2025-09-30',
                'foto_kondisi' => 'https://images.unsplash.com/photo-1616431575958-941b37c97c80?q=80&w=600',
                'created_at' => now(),
                'updated_at' => now(),
            ],
        ];

        foreach ($data as $row) {
            DB::table('titik_longsor')->insert($row);
        }
    }
}
