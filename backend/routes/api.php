<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;

use App\Http\Controllers\MapApiController;

Route::get('/user', function (Request $request) {
    return $request->user();
})->middleware('auth:sanctum');

Route::get('/titik-longsor', [MapApiController::class, 'getTitikLongsor']);
Route::get('/zonasi-rawan', [MapApiController::class, 'getZonasiRawan']);
Route::get('/laporan-warga', [MapApiController::class, 'getLaporanWarga']);
Route::post('/laporan-warga', [MapApiController::class, 'storeLaporanWarga']);
Route::patch('/laporan-warga/{id}/validate', [MapApiController::class, 'validateLaporanWarga']);
Route::delete('/laporan-warga/{id}', [MapApiController::class, 'deleteLaporanWarga']);
