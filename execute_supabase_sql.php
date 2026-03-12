<?php

use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\File;

require __DIR__ . '/vendor/autoload.php';

$app = require_once __DIR__ . '/bootstrap/app.php';
$kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);
$kernel->bootstrap();

$supabaseUrl = config('services.supabase.url');
$serviceKey = config('services.supabase.service_key') ?? config('services.supabase.anon_key');

// Read SQL file
$sql = File::get(database_path('migrations/supabase_tables.sql'));

// Execute SQL via Supabase REST API
$response = Http::withHeaders([
    'apikey' => $serviceKey,
    'Authorization' => 'Bearer ' . $serviceKey,
    'Content-Type' => 'application/json',
    'Prefer' => 'params=single-object',
])->withOptions(['verify' => false])
  ->post("{$supabaseUrl}/rest/v1/rpc/exec_sql", [
    'query' => $sql,
  ]);

echo "Response: " . $response->status() . "\n";
echo $response->body() . "\n";
