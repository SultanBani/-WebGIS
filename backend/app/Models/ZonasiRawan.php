<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class ZonasiRawan extends Model
{
    use HasFactory;

    protected $table = 'zonasi_rawan';

    protected $fillable = [
        'geom',
        'kelas_rawan',
        'skor_total',
        'luas_area',
    ];
}
