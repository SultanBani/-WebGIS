<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class LaporanWarga extends Model
{
    use HasFactory;

    protected $table = 'laporan_warga';
    protected $primaryKey = 'id_laporan';
    public $timestamps = false;

    protected $fillable = [
        'koordinat_laporan',
        'deskripsi',
        'foto_bukti',
        'status_validasi',
        'waktu_kirim',
    ];
}
