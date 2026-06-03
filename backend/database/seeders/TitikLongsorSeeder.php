<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class TitikLongsorSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $data = [
            [
                'koordinat' => DB::raw("ST_GeomFromText('POINT(-5.1324 104.1082)', 4326)"),
                'lokasi_detail' => 'Kawasan Hutan Lindung TNBBS Jalan Lintas Barat KM 20',
                'tingkat_kerusakan' => 'Berat',
                'tanggal_kejadian' => '2025-12-14',
                'foto_kondisi' => 'https://images.unsplash.com/photo-1541888946425-d81bb19240f5?q=80&w=600',
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'koordinat' => DB::raw("ST_GeomFromText('POINT(-5.1412 104.0945)', 4326)"),
                'lokasi_detail' => 'Tikungan Pal 8 (Pekon Labuhan Mandi), Lereng Tebing Luar',
                'tingkat_kerusakan' => 'Sedang',
                'tanggal_kejadian' => '2026-01-20',
                'foto_kondisi' => 'https://images.unsplash.com/photo-1582298538104-fc2c0a5a0027?q=80&w=600',
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'koordinat' => DB::raw("ST_GeomFromText('POINT(-5.1201 104.1215)', 4326)"),
                'lokasi_detail' => 'Tebing Batu Jembatan Dua Jalur Lintas Krui-Liwa',
                'tingkat_kerusakan' => 'Berat',
                'tanggal_kejadian' => '2026-02-05',
                'foto_kondisi' => 'https://images.unsplash.com/photo-1578328819058-b69f3a3b0f6b?q=80&w=600',
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'koordinat' => DB::raw("ST_GeomFromText('POINT(-5.1115 104.1390)', 4326)"),
                'lokasi_detail' => 'Sekitar Gapura Perbatasan Pesisir Barat - Lampung Barat',
                'tingkat_kerusakan' => 'Ringan',
                'tanggal_kejadian' => '2026-03-10',
                'foto_kondisi' => 'https://images.unsplash.com/photo-1547683905-f686c993aae5?q=80&w=600',
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'koordinat' => DB::raw("ST_GeomFromText('POINT(-5.0948 104.1652)', 4326)"),
                'lokasi_detail' => 'Jalan Utama Way Mengaku (Dekat Kawasan Atas Liwa)',
                'tingkat_kerusakan' => 'Sedang',
                'tanggal_kejadian' => '2026-04-18',
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
