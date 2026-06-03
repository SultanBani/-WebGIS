<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class TitikLongsor extends Model
{
    use HasFactory;

    protected $table = 'titik_longsor';

    protected $fillable = [
        'koordinat',
        'lokasi_detail',
        'tingkat_kerusakan',
        'tanggal_kejadian',
        'foto_kondisi',
    ];
}
