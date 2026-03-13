<?php

use Illuminate\Foundation\Application;
use Illuminate\Http\Request;

define('LARAVEL_START', microtime(true));

// Determine if the application is in maintenance mode...
if (file_exists($maintenance = __DIR__.'/../storage/framework/maintenance.php')) {
    require $maintenance;
}

// Register the Composer autoloader...
require __DIR__.'/../vendor/autoload.php';

// Bootstrap Laravel and handle the request...
/** @var Application $app */
$app = require_once __DIR__.'/../bootstrap/app.php';

// Clear route cache in debug mode
if (config('app.debug')) {
    $app->make('Illuminate\Contracts\Console\Kernel')->bootstrap();
    try {
        \Illuminate\Support\Facades\Artisan::call('route:clear');
    } catch (\Exception $e) {
        // Ignore errors
    }
}

$app->handleRequest(Request::capture());
