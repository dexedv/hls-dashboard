<?php

use Illuminate\Foundation\Inspiring;
use Illuminate\Support\Facades\Artisan;
use Illuminate\Support\Facades\Schedule;

Artisan::command('inspire', function () {
    $this->comment(Inspiring::quote());
})->purpose('Display an inspiring quote');

// Lexware Sync Zeitplan - täglich um 6:00 Uhr
Schedule::command('lexware:sync-customers')->dailyAt('06:00');
