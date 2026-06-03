<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class ZonasiRawanSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $data = [
            [
                'geom' => DB::raw("ST_GeomFromText('POLYGON((-5.1500 104.0800, -5.1100 104.0800, -5.1100 104.1300, -5.1500 104.1300, -5.1500 104.0800))', 4326)"),
                'kelas_rawan' => 'Tinggi',
                'skor_total' => 4.35,
                'luas_area' => 1250.75,
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'geom' => DB::raw("ST_GeomFromText('POLYGON((-5.1100 104.1300, -5.0800 104.1300, -5.0800 104.1600, -5.1100 104.1600, -5.1100 104.1300))', 4326)"),
                'kelas_rawan' => 'Sedang',
                'skor_total' => 3.65,
                'luas_area' => 840.40,
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'geom' => DB::raw("ST_GeomFromText('POLYGON((-5.0800 104.1600, -5.0600 104.1600, -5.0600 104.1900, -5.0800 104.1900, -5.0800 104.1600))', 4326)"),
                'kelas_rawan' => 'Rendah',
                'skor_total' => 2.45,
                'luas_area' => 520.15,
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'geom' => DB::raw("ST_GeomFromText('POLYGON((-5.1800 104.0500, -5.1500 104.0500, -5.1500 104.0800, -5.1800 104.0800, -5.1800 104.0500))', 4326)"),
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
