<?php

require __DIR__ . '/vendor/autoload.php';

$app = require_once __DIR__ . '/bootstrap/app.php';
$kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);
$kernel->bootstrap();

use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;

// Update password
DB::table('users')
    ->where('email', 'dominic.kluegl@outlook.de')
    ->update([
        'password' => Hash::make('Error404.1002'),
        'role' => 'admin',
        'updated_at' => now(),
    ]);

echo "Password updated!\n";
