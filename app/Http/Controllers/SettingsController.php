<?php

namespace App\Http\Controllers;

use App\Models\Customer;
use App\Models\Invoice;
use App\Models\Quote;
use App\Services\LexwareService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\DB;
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
        try {
            // Get database connection info
            $dbName = config('database.connections.mysql.database');
            $dbHost = config('database.connections.mysql.host');

            // Test connection
            DB::connection()->getPdo();
            $isConnected = true;
            $connectionError = null;
        } catch (\Exception $e) {
            $isConnected = false;
            $connectionError = $e->getMessage();
            $dbName = config('database.connections.mysql.database');
            $dbHost = config('database.connections.mysql.host');
        }

        $tables = [];
        $totalRows = 0;
        $totalSize = 0;

        if ($isConnected) {
            try {
                // Get all tables
                $tablesData = DB::select('SHOW TABLE STATUS FROM `' . $dbName . '`');

                foreach ($tablesData as $table) {
                    $rows = $table->Rows ?? 0;
                    $dataLength = $table->Data_length ?? 0;
                    $indexLength = $table->Index_length ?? 0;
                    $size = $dataLength + $indexLength;

                    $tables[] = [
                        'name' => $table->Name,
                        'rows' => $rows,
                        'size' => $this->formatBytes($size),
                        'size_bytes' => $size,
                        'engine' => $table->Engine ?? 'N/A',
                        'collation' => $table->Collation ?? 'N/A',
                    ];

                    $totalRows += $rows;
                    $totalSize += $size;
                }
            } catch (\Exception $e) {
                // If SHOW TABLE STATUS fails, try alternative method
                try {
                    $tablesData = DB::select('SELECT table_name, table_rows FROM information_schema.tables WHERE table_schema = ?', [$dbName]);
                    foreach ($tablesData as $table) {
                        $tables[] = [
                            'name' => $table->table_name,
                            'rows' => $table->table_rows ?? 0,
                            'size' => '0 KB',
                            'size_bytes' => 0,
                            'engine' => 'N/A',
                            'collation' => 'N/A',
                        ];
                        $totalRows += $table->table_rows ?? 0;
                    }
                } catch (\Exception $e2) {
                    // Use fallback demo data
                }
            }
        }

        return Inertia::render('Database/Index', [
            'database' => [
                'connected' => $isConnected,
                'error' => $connectionError,
                'name' => $dbName,
                'host' => $dbHost,
                'driver' => 'MySQL',
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
     * Execute SQL query (DANGEROUS - only for admins)
     */
    public function executeSql(Request $request)
    {
        $request->validate([
            'query' => 'required|string',
        ]);

        $query = trim($request->input('query'));

        // Security: Only allow certain SQL commands
        $allowedCommands = ['SELECT', 'INSERT', 'UPDATE', 'DELETE', 'ALTER', 'SHOW'];
        $command = strtoupper(explode(' ', $query)[0]);

        if (!in_array($command, $allowedCommands)) {
            return response()->json([
                'success' => false,
                'error' => 'Nur SELECT, INSERT, UPDATE, DELETE, ALTER und SHOW Befehle sind erlaubt.',
            ], 403);
        }

        try {
            // Use DB::select for SELECT queries, DB::statement for others
            if ($command === 'SELECT' || $command === 'SHOW') {
                $result = DB::select($query);
                return response()->json([
                    'success' => true,
                    'data' => $result,
                    'rows' => count($result),
                ]);
            } else {
                $affected = DB::statement($query);
                return response()->json([
                    'success' => true,
                    'message' => 'Befehl erfolgreich ausgeführt.',
                    'affected' => $affected,
                ]);
            }
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'error' => $e->getMessage(),
            ], 400);
        }
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
     * Optimize database tables
     */
    public function optimizeDatabase(Request $request)
    {
        try {
            $dbName = config('database.connections.mysql.database');
            DB::select("OPTIMIZE TABLE `$dbName`");
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
            $database = config('database.connections.mysql.database');
            $username = config('database.connections.mysql.username');
            $password = config('database.connections.mysql.password');
            $host = config('database.connections.mysql.host', '127.0.0.1');

            $filename = 'backup_' . $database . '_' . date('Y-m-d_H-i-s') . '.sql';
            $filepath = storage_path('backups/' . $filename);

            if (!file_exists(storage_path('backups'))) {
                mkdir(storage_path('backups'), 0755, true);
            }

            $command = "mysqldump -h$host -u$username -p$password $database > $filepath 2>&1";
            exec($command, $output, $returnVar);

            if ($returnVar === 0 && file_exists($filepath)) {
                return response()->json(['success' => true, 'message' => 'Backup wurde erstellt.', 'filename' => $filename]);
            } else {
                return response()->json(['success' => false, 'error' => 'mysqldump ist nicht verfügbar.'], 400);
            }
        } catch (\Exception $e) {
            return response()->json(['success' => false, 'error' => $e->getMessage()], 400);
        }
    }
}
