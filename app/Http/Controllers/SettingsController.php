<?php

namespace App\Http\Controllers;

use App\Models\Customer;
use App\Models\Invoice;
use App\Models\Quote;
use App\Services\LexwareService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;
use Inertia\Inertia;

class SettingsController extends Controller
{
    public function index()
    {
        return Inertia::render('Settings/Index');
    }

    public function integrations()
    {
        $lexwareService = new LexwareService();
        $isConfigured = $lexwareService->isConfigured();

        $stats = [];
        if ($isConfigured) {
            $stats = [
                'customers_synced' => Customer::where('sync_status', 'synced')->count(),
                'customers_pending' => Customer::where('sync_status', 'pending')->count(),
                'customers_error' => Customer::where('sync_status', 'error')->count(),
                'invoices_synced' => Invoice::whereNotNull('lexware_id')->count(),
                'quotes_synced' => Quote::whereNotNull('lexware_id')->count(),
            ];
        }

        return Inertia::render('Integrations/Index', [
            'lexware' => [
                'is_configured' => $isConfigured,
                'stats' => $stats,
            ],
        ]);
    }

    public function database()
    {
        $driver = config('database.default');
        $connection = config("database.connections.{$driver}");
        $dbName = $connection['database'] ?? 'unknown';
        $dbHost = $connection['host'] ?? 'localhost';

        try {
            DB::connection()->getPdo();
            $isConnected = true;
            $connectionError = null;
        } catch (\Exception $e) {
            $isConnected = false;
            $connectionError = $e->getMessage();
        }

        $tables = [];
        $totalRows = 0;
        $totalSize = 0;

        if ($isConnected) {
            try {
                $tables = $this->getTableInfo($driver, $dbName);
                foreach ($tables as $table) {
                    $totalRows += $table['rows'];
                    $totalSize += $table['size_bytes'];
                }
            } catch (\Exception $e) {
                // Fallback: empty tables list
            }
        }

        return Inertia::render('Database/Index', [
            'database' => [
                'connected' => $isConnected,
                'error' => $connectionError,
                'name' => $dbName,
                'host' => $dbHost,
                'driver' => $this->getDriverLabel($driver),
            ],
            'tables' => $tables,
            'stats' => [
                'total_tables' => count($tables),
                'total_rows' => $totalRows,
                'total_size' => $this->formatBytes($totalSize),
                'total_size_bytes' => $totalSize,
            ],
        ]);
    }

    /**
     * Get table info based on database driver
     */
    private function getTableInfo(string $driver, string $dbName): array
    {
        $tables = [];

        if ($driver === 'pgsql') {
            $tablesData = DB::select("
                SELECT
                    t.tablename AS name,
                    COALESCE(s.n_live_tup, 0) AS row_count,
                    COALESCE(pg_total_relation_size(quote_ident(t.tablename)), 0) AS total_size
                FROM pg_tables t
                LEFT JOIN pg_stat_user_tables s ON s.relname = t.tablename
                WHERE t.schemaname = 'public'
                ORDER BY t.tablename
            ");

            foreach ($tablesData as $table) {
                $tables[] = [
                    'name' => $table->name,
                    'rows' => (int) $table->row_count,
                    'size' => $this->formatBytes((int) $table->total_size),
                    'size_bytes' => (int) $table->total_size,
                    'engine' => 'PostgreSQL',
                    'collation' => 'N/A',
                ];
            }
        } elseif ($driver === 'mysql' || $driver === 'mariadb') {
            $tablesData = DB::select(
                'SELECT table_name, table_rows, data_length, index_length, engine, table_collation FROM information_schema.tables WHERE table_schema = ?',
                [$dbName]
            );

            foreach ($tablesData as $table) {
                $size = ($table->data_length ?? 0) + ($table->index_length ?? 0);
                $tables[] = [
                    'name' => $table->table_name,
                    'rows' => (int) ($table->table_rows ?? 0),
                    'size' => $this->formatBytes($size),
                    'size_bytes' => $size,
                    'engine' => $table->engine ?? 'N/A',
                    'collation' => $table->table_collation ?? 'N/A',
                ];
            }
        } elseif ($driver === 'sqlite') {
            $tablesData = DB::select("SELECT name FROM sqlite_master WHERE type='table' AND name NOT LIKE 'sqlite_%' ORDER BY name");

            foreach ($tablesData as $table) {
                $rowCount = DB::selectOne("SELECT COUNT(*) as cnt FROM \"{$table->name}\"")->cnt ?? 0;
                $tables[] = [
                    'name' => $table->name,
                    'rows' => (int) $rowCount,
                    'size' => 'N/A',
                    'size_bytes' => 0,
                    'engine' => 'SQLite',
                    'collation' => 'N/A',
                ];
            }
        }

        return $tables;
    }

    /**
     * Get human-readable driver label
     */
    private function getDriverLabel(string $driver): string
    {
        return match ($driver) {
            'pgsql' => 'PostgreSQL',
            'mysql' => 'MySQL',
            'mariadb' => 'MariaDB',
            'sqlite' => 'SQLite',
            default => ucfirst($driver),
        };
    }

    /**
     * Format bytes to human readable string
     */
    private function formatBytes($bytes, $precision = 2)
    {
        $units = ['B', 'KB', 'MB', 'GB', 'TB'];
        $bytes = max($bytes, 0);
        $pow = floor(($bytes ? log($bytes) : 0) / log(1024));
        $pow = min($pow, count($units) - 1);
        $bytes /= (1 << (10 * $pow));
        return round($bytes, $precision) . ' ' . $units[$pow];
    }

    /**
     * Clear application cache
     */
    public function clearCache(Request $request)
    {
        try {
            Cache::flush();
            return response()->json(['success' => true, 'message' => 'Cache wurde geleert.']);
        } catch (\Exception $e) {
            return response()->json(['success' => false, 'error' => $e->getMessage()], 400);
        }
    }

    /**
     * Optimize database
     */
    public function optimizeDatabase(Request $request)
    {
        try {
            $driver = config('database.default');

            if ($driver === 'pgsql') {
                DB::statement('VACUUM ANALYZE');
            } elseif ($driver === 'mysql' || $driver === 'mariadb') {
                $tables = Schema::getTableListing();
                foreach ($tables as $table) {
                    DB::statement("OPTIMIZE TABLE `{$table}`");
                }
            } elseif ($driver === 'sqlite') {
                DB::statement('VACUUM');
            }

            return response()->json(['success' => true, 'message' => 'Datenbank wurde optimiert.']);
        } catch (\Exception $e) {
            return response()->json(['success' => false, 'error' => $e->getMessage()], 400);
        }
    }

    /**
     * Create database backup
     */
    public function createBackup(Request $request)
    {
        try {
            $driver = config('database.default');
            $connection = config("database.connections.{$driver}");

            $database = $connection['database'];
            $filename = 'backup_' . basename($database) . '_' . date('Y-m-d_H-i-s') . '.sql';
            $filepath = storage_path('backups/' . $filename);

            if (!file_exists(storage_path('backups'))) {
                mkdir(storage_path('backups'), 0755, true);
            }

            if ($driver === 'pgsql') {
                $host = escapeshellarg($connection['host'] ?? '127.0.0.1');
                $port = escapeshellarg($connection['port'] ?? '5432');
                $username = escapeshellarg($connection['username'] ?? 'postgres');
                $dbName = escapeshellarg($database);
                $file = escapeshellarg($filepath);

                $command = "PGPASSWORD=" . escapeshellarg($connection['password'] ?? '') .
                    " pg_dump -h {$host} -p {$port} -U {$username} {$dbName} > {$file} 2>&1";
            } elseif ($driver === 'mysql' || $driver === 'mariadb') {
                $host = escapeshellarg($connection['host'] ?? '127.0.0.1');
                $username = escapeshellarg($connection['username'] ?? 'root');
                $password = $connection['password'] ?? '';
                $dbName = escapeshellarg($database);
                $file = escapeshellarg($filepath);

                $command = "mysqldump -h {$host} -u {$username}"
                    . ($password !== '' ? " -p" . escapeshellarg($password) : '')
                    . " {$dbName} > {$file} 2>&1";
            } elseif ($driver === 'sqlite') {
                $dbFile = escapeshellarg($database);
                $file = escapeshellarg($filepath);
                $command = "cp {$dbFile} {$file} 2>&1";
            } else {
                return response()->json(['success' => false, 'error' => 'Backup für diesen Datenbank-Treiber nicht unterstützt.'], 400);
            }

            exec($command, $output, $returnVar);

            if ($returnVar === 0 && file_exists($filepath)) {
                return response()->json(['success' => true, 'message' => 'Backup wurde erstellt.', 'filename' => $filename]);
            } else {
                return response()->json(['success' => false, 'error' => 'Backup-Tool ist nicht verfügbar.'], 400);
            }
        } catch (\Exception $e) {
            return response()->json(['success' => false, 'error' => $e->getMessage()], 400);
        }
    }
}
