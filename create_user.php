<?php

require __DIR__ . '/vendor/autoload.php';

$app = require_once __DIR__ . '/bootstrap/app.php';
$kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);
$kernel->bootstrap();

use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;

// Check users table
$users = DB::table('users')->get();
echo "Users in SQLite: " . $users->count() . "\n";

// Create user
$userId = DB::table('users')->insertGetId([
    'name' => 'Dominic Kluegl',
    'email' => 'dominic.kluegl@outlook.de',
    'password' => Hash::make('Error404.1002'),
    'role' => 'admin',
    'created_at' => now(),
    'updated_at' => now(),
]);

echo "User created with ID: " . $userId . "\n";
