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
        Schema::create('laporan_warga', function (Blueprint $table) {
            $table->id('id_laporan');
            $table->geometry('koordinat_laporan', 'point', 4326); // Kolom spasial POINT SRID 4326
            $table->text('deskripsi');
            $table->date('tanggal_kejadian')->nullable(); // Tanggal kejadian longsor
            $table->string('foto_bukti', 500)->nullable();  // Path file upload atau URL
            $table->boolean('status_validasi')->default(false);
            $table->timestamp('waktu_kirim')->useCurrent();
            $table->spatialIndex('koordinat_laporan');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('laporan_warga');
    }
};
