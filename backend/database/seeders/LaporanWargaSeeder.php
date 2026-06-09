<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class LaporanWargaSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $data = [
            [
                'koordinat_laporan' => DB::raw("ST_GeomFromText('POINT(-5.1250 104.1150)', 4326)"),
                'deskripsi'         => 'Terjadi longsoran kecil di bahu jalan lintas, material batu dan tanah menutupi sebagian jalan. Kendaraan roda 4 harus antre.',
                'tanggal_kejadian'  => '2026-05-20',
                'foto_bukti'        => 'https://images.unsplash.com/photo-1541888946425-d81bb19240f5?q=80&w=600',
                'status_validasi'   => true,
                'waktu_kirim'       => now()->subHours(5),
            ],
            [
                'koordinat_laporan' => DB::raw("ST_GeomFromText('POINT(-5.1380 104.1000)', 4326)"),
                'deskripsi'         => 'Tebing di samping tikungan jalan terlihat retak dan mulai berguguran kerikil kecil. Sangat membahayakan saat hujan lebat.',
                'tanggal_kejadian'  => '2026-06-03',
                'foto_bukti'        => 'https://images.unsplash.com/photo-1578328819058-b69f3a3b0f6b?q=80&w=600',
                'status_validasi'   => false,
                'waktu_kirim'       => now()->subMinutes(30),
            ],
        ];

        foreach ($data as $row) {
            DB::table('laporan_warga')->insert($row);
        }
    }
}
