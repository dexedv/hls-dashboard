<?php

namespace App\Database;

use Illuminate\Database\Connectors\PostgreSqlConnector;
use Illuminate\Support\Facades\DB;

class SupabaseConnector extends PostgreSqlConnector
{
    public function connect(array $config)
    {
        // Supabase uses a specific connection string format
        $config['host'] = $config['host'] ?? 'db.ebttwowzsltieychkldz.supabase.co';
        $config['port'] = $config['port'] ?? '5432';
        $config['database'] = $config['database'] ?? 'postgres';
        $config['username'] = $config['username'] ?? 'postgres';

        return parent::connect($config);
    }
}
