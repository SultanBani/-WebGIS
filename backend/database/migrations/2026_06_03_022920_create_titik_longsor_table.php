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
        Schema::create('titik_longsor', function (Blueprint $table) {
            $table->id();
            $table->geometry('koordinat', 'point', 4326); // Kolom spasial POINT SRID 4326
            $table->string('lokasi_detail', 255);
            $table->enum('tingkat_kerusakan', ['Ringan', 'Sedang', 'Berat']);
            $table->date('tanggal_kejadian');
            $table->string('foto_kondisi', 255)->nullable();
            $table->spatialIndex('koordinat');
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('titik_longsor');
    }
};
