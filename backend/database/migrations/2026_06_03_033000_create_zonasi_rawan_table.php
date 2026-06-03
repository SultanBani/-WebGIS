<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('zonasi_rawan', function (Blueprint $table) {
            $table->id();
            $table->geometry('geom', 'polygon', 4326); // Kolom spasial POLYGON SRID 4326
            $table->enum('kelas_rawan', ['Aman', 'Rendah', 'Sedang', 'Tinggi']);
            $table->float('skor_total');
            $table->float('luas_area');
            $table->spatialIndex('geom');
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('zonasi_rawan');
    }
};
