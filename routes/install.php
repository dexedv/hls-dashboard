<?php

use App\Http\Controllers\InstallController;
use Illuminate\Support\Facades\Route;

// Install routes
Route::get('/install', [InstallController::class, 'index'])->name('install.index');
Route::get('/install/eula', [InstallController::class, 'showEula'])->name('install.eula');
Route::post('/install/eula', [InstallController::class, 'acceptEula'])->name('install.eula.accept');
Route::get('/install/license', [InstallController::class, 'showLicense'])->name('install.license');
Route::post('/install/license', [InstallController::class, 'saveLicense'])->name('install.license.save');
Route::get('/install/database', [InstallController::class, 'showDatabase'])->name('install.database');
Route::post('/install/database', [InstallController::class, 'saveDatabase'])->name('install.database.save');
Route::post('/install/test-connection', [InstallController::class, 'testConnection'])->name('install.testConnection');
Route::get('/install/admin', [InstallController::class, 'showAdmin'])->name('install.admin');
Route::post('/install/admin', [InstallController::class, 'saveAdmin'])->name('install.admin.save');
Route::get('/install/company', [InstallController::class, 'showCompany'])->name('install.company');
Route::post('/install/company', [InstallController::class, 'saveCompany'])->name('install.company.save');
Route::get('/install/complete', [InstallController::class, 'complete'])->name('install.complete');
