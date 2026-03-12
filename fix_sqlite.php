<?php

require __DIR__ . '/vendor/autoload.php';

$app = require_once __DIR__ . '/bootstrap/app.php';
$kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);
$kernel->bootstrap();

use Illuminate\Support\Facades\DB;

$db = DB::connection('sqlite');

// Add deleted_at column to tables that use SoftDeletes
$tablesWithSoftDeletes = ['customers', 'leads', 'projects', 'tasks', 'invoices', 'quotes', 'tickets', 'inventories'];

foreach ($tablesWithSoftDeletes as $table) {
    try {
        $db->statement("ALTER TABLE $table ADD COLUMN deleted_at TIMESTAMP NULL");
        echo "Added deleted_at to $table\n";
    } catch (\Exception $e) {
        // Column might already exist
    }
}

echo "Done!\n";
