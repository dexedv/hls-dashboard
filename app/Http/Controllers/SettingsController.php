<?php

namespace App\Http\Controllers;

use App\Models\Customer;
use App\Models\Invoice;
use App\Models\License;
use App\Models\Quote;
use App\Models\Setting;
use App\Models\User;
use App\Services\LexwareService;
use App\Services\LicenseService;
use App\Services\UpdateService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Mail;
use Illuminate\Support\Facades\Schema;
use Inertia\Inertia;

class SettingsController extends Controller
{
    public function index()
    {
        $user = auth()->user();
        $isAdmin = in_array($user->role ?? '', ['owner', 'admin']);

        $props = [
            'twoFactorEnabled' => $user->two_factor_enabled ?? false,
            'isAdmin' => $isAdmin,
        ];

        // Only load admin-sensitive data for owner/admin
        if ($isAdmin) {
            $licenseService = app(LicenseService::class);
            $license = $licenseService->current();

            $props['settings'] = [
                'tax_rate' => Setting::get('tax_rate', 19),
                'currency' => Setting::get('currency', 'EUR'),
                'currency_symbol' => Setting::get('currency_symbol', 'EUR'),
                'company_name' => Setting::get('company_name', ''),
                'company_address' => Setting::get('company_address', ''),
                'company_zip' => Setting::get('company_zip', ''),
                'company_city' => Setting::get('company_city', ''),
                'company_country' => Setting::get('company_country', 'Deutschland'),
                'company_phone' => Setting::get('company_phone', ''),
                'company_email' => Setting::get('company_email', ''),
                'company_website' => Setting::get('company_website', ''),
                'company_tax_id' => Setting::get('company_tax_id', ''),
                'company_vat_id' => Setting::get('company_vat_id', ''),
                'app_name' => Setting::get('app_name', 'Dashboard'),
                'app_logo' => Setting::get('app_logo'),
                'app_favicon' => Setting::get('app_favicon'),
                'primary_color' => Setting::get('primary_color', '#0284c7'),
            ];

            $props['emailSettings'] = [
                'mail_host' => Setting::get('mail_host', ''),
                'mail_port' => Setting::get('mail_port', '587'),
                'mail_username' => Setting::get('mail_username', ''),
                'mail_password' => Setting::get('mail_password', ''),
                'mail_encryption' => Setting::get('mail_encryption', 'tls'),
                'mail_from_address' => Setting::get('mail_from_address', ''),
                'mail_from_name' => Setting::get('mail_from_name', ''),
            ];

            $props['licenseInfo'] = null;
            if ($license) {
                $props['licenseInfo'] = [
                    'plan' => $license->getPlan(),
                    'max_users' => $license->getUserLimit(),
                    'licensed_to' => $license->licensed_to,
                    'licensed_email' => $license->licensed_email,
                    'valid_until' => $license->valid_until?->format('Y-m-d'),
                    'is_expired' => $license->isExpired(),
                    'is_valid' => $license->isValid(),
                    'activated_at' => $license->activated_at?->format('Y-m-d H:i'),
                    'license_key_masked' => $this->maskLicenseKey($license->license_key),
                ];
            }

            $props['userCount'] = User::count();
        } else {
            $props['settings'] = [];
            $props['emailSettings'] = [];
            $props['licenseInfo'] = null;
            $props['userCount'] = 0;
        }

        return Inertia::render('Settings/Index', $props);
    }

    private function maskLicenseKey(string $key): string
    {
        if (strlen($key) <= 20) {
            return str_repeat('*', strlen($key));
        }
        return substr($key, 0, 10) . '...' . substr($key, -10);
    }

    private function ensureAdmin()
    {
        $role = auth()->user()->role ?? '';
        if (!in_array($role, ['owner', 'admin'])) {
            abort(403, 'Nur Administratoren haben Zugriff auf diese Funktion.');
        }
    }

    public function saveTaxRate(Request $request)
    {
        $this->ensureAdmin();

        $request->validate([
            'tax_rate' => 'required|numeric|min:0|max:100',
        ]);

        Setting::set('tax_rate', $request->tax_rate);

        return redirect()->back()->with('success', 'Steuerrate erfolgreich aktualisiert.');
    }

    public function saveGeneral(Request $request)
    {
        $this->ensureAdmin();
        $request->validate([
            'tax_rate' => 'required|numeric|min:0|max:100',
            'currency' => 'required|string|max:10',
        ]);

        Setting::set('tax_rate', $request->tax_rate);
        Setting::set('currency', $request->currency);
        Setting::set('currency_symbol', $request->currency);

        return redirect()->back()->with('success', 'Allgemeine Einstellungen gespeichert.');
    }

    public function saveCompany(Request $request)
    {
        $this->ensureAdmin();

        $request->validate([
            'company_name' => 'required|string|max:255',
        ]);

        $fields = [
            'company_name', 'company_address', 'company_zip', 'company_city',
            'company_country', 'company_phone', 'company_email', 'company_website',
            'company_tax_id', 'company_vat_id',
        ];

        foreach ($fields as $field) {
            Setting::set($field, $request->input($field, ''));
        }

        return redirect()->back()->with('success', 'Firmendaten gespeichert.');
    }

    public function saveBranding(Request $request)
    {
        $this->ensureAdmin();

        $request->validate([
            'app_name' => 'required|string|max:255',
            'app_logo' => 'nullable|file|max:2048|mimes:png,jpg,jpeg,svg',
            'app_favicon' => 'nullable|file|max:1024|mimes:png,ico,svg',
            'primary_color' => 'required|string|max:7',
        ]);

        Setting::set('app_name', $request->app_name);
        Setting::set('primary_color', $request->primary_color);

        if ($request->hasFile('app_logo')) {
            $path = $request->file('app_logo')->store('branding', 'public');
            Setting::set('app_logo', $path);
        }

        if ($request->hasFile('app_favicon')) {
            $path = $request->file('app_favicon')->store('branding', 'public');
            Setting::set('app_favicon', $path);
        }

        return redirect()->back()->with('success', 'Erscheinungsbild gespeichert.');
    }

    public function activateLicense(Request $request)
    {
        $this->ensureAdmin();

        $request->validate([
            'license_key' => 'required|string|min:10',
        ]);

        $licenseService = app(LicenseService::class);
        $result = $licenseService->activate(trim($request->license_key));

        if ($result['success']) {
            return redirect()->back()->with('success', $result['message']);
        }

        return redirect()->back()->with('error', $result['message']);
    }

    // ── Backup Management ──────────────────────────────────────────

    public function listBackups()
    {
        $this->ensureAdmin();

        $backupDir = storage_path('backups');
        $backups = [];

        if (is_dir($backupDir)) {
            $files = scandir($backupDir, SCANDIR_SORT_DESCENDING);
            foreach ($files as $file) {
                if ($file === '.' || $file === '..') continue;
                $filepath = $backupDir . '/' . $file;
                $backups[] = [
                    'name' => $file,
                    'size' => $this->formatBytes(filesize($filepath)),
                    'size_bytes' => filesize($filepath),
                    'date' => date('Y-m-d H:i:s', filemtime($filepath)),
                ];
            }
        }

        return response()->json($backups);
    }

    public function restoreBackup(Request $request)
    {
        $this->ensureAdmin();

        $request->validate(['filename' => 'required|string']);
        $filename = basename($request->filename);
        $filepath = storage_path('backups/' . $filename);

        if (!file_exists($filepath)) {
            return response()->json(['success' => false, 'error' => 'Backup-Datei nicht gefunden.'], 404);
        }

        try {
            $driver = config('database.default');
            $connection = config("database.connections.{$driver}");
            $database = $connection['database'];

            if ($driver === 'pgsql') {
                $host = escapeshellarg($connection['host'] ?? '127.0.0.1');
                $port = escapeshellarg($connection['port'] ?? '5432');
                $username = escapeshellarg($connection['username'] ?? 'postgres');
                $dbName = escapeshellarg($database);
                $file = escapeshellarg($filepath);

                $command = "PGPASSWORD=" . escapeshellarg($connection['password'] ?? '') .
                    " psql -h {$host} -p {$port} -U {$username} {$dbName} < {$file} 2>&1";
            } elseif ($driver === 'mysql' || $driver === 'mariadb') {
                $host = escapeshellarg($connection['host'] ?? '127.0.0.1');
                $username = escapeshellarg($connection['username'] ?? 'root');
                $password = $connection['password'] ?? '';
                $dbName = escapeshellarg($database);
                $file = escapeshellarg($filepath);

                $command = "mysql -h {$host} -u {$username}"
                    . ($password !== '' ? " -p" . escapeshellarg($password) : '')
                    . " {$dbName} < {$file} 2>&1";
            } elseif ($driver === 'sqlite') {
                $dbFile = $database;
                // For sqlite, copy backup over the database file
                copy($filepath, $dbFile);
                return response()->json(['success' => true, 'message' => 'Backup wurde wiederhergestellt.']);
            } else {
                return response()->json(['success' => false, 'error' => 'Restore nicht unterstützt.'], 400);
            }

            exec($command, $output, $returnVar);

            if ($returnVar === 0) {
                return response()->json(['success' => true, 'message' => 'Backup wurde wiederhergestellt.']);
            }

            return response()->json(['success' => false, 'error' => 'Restore fehlgeschlagen.'], 400);
        } catch (\Exception $e) {
            return response()->json(['success' => false, 'error' => $e->getMessage()], 400);
        }
    }

    public function deleteBackup(Request $request)
    {
        $this->ensureAdmin();

        $request->validate(['filename' => 'required|string']);
        $filename = basename($request->filename);
        $filepath = storage_path('backups/' . $filename);

        if (!file_exists($filepath)) {
            return response()->json(['success' => false, 'error' => 'Datei nicht gefunden.'], 404);
        }

        unlink($filepath);
        return response()->json(['success' => true, 'message' => 'Backup gelöscht.']);
    }

    public function downloadBackup($filename)
    {
        $this->ensureAdmin();

        $filename = basename($filename);
        $filepath = storage_path('backups/' . $filename);

        if (!file_exists($filepath)) {
            abort(404);
        }

        return response()->download($filepath);
    }

    // ── Email SMTP Config ──────────────────────────────────────────

    public function saveEmail(Request $request)
    {
        $this->ensureAdmin();

        $request->validate([
            'mail_host' => 'required|string|max:255',
            'mail_port' => 'required|integer|min:1|max:65535',
            'mail_username' => 'nullable|string|max:255',
            'mail_password' => 'nullable|string|max:255',
            'mail_encryption' => 'required|in:tls,ssl,none',
            'mail_from_address' => 'required|email|max:255',
            'mail_from_name' => 'required|string|max:255',
        ]);

        $fields = ['mail_host', 'mail_port', 'mail_username', 'mail_password', 'mail_encryption', 'mail_from_address', 'mail_from_name'];
        foreach ($fields as $field) {
            Setting::set($field, $request->input($field, ''));
        }

        return redirect()->back()->with('success', 'E-Mail-Einstellungen gespeichert.');
    }

    public function testEmail(Request $request)
    {
        $this->ensureAdmin();

        try {
            // Apply runtime SMTP config from settings
            $encryption = Setting::get('mail_encryption', 'tls');
            config([
                'mail.mailers.smtp.host' => Setting::get('mail_host'),
                'mail.mailers.smtp.port' => (int) Setting::get('mail_port', 587),
                'mail.mailers.smtp.username' => Setting::get('mail_username'),
                'mail.mailers.smtp.password' => Setting::get('mail_password'),
                'mail.mailers.smtp.encryption' => $encryption === 'none' ? null : $encryption,
                'mail.from.address' => Setting::get('mail_from_address'),
                'mail.from.name' => Setting::get('mail_from_name'),
            ]);

            $userEmail = auth()->user()->email;

            Mail::raw('Dies ist eine Test-E-Mail von ' . config('app.name') . '. Wenn Sie diese Nachricht erhalten, funktioniert die E-Mail-Konfiguration korrekt.', function ($message) use ($userEmail) {
                $message->to($userEmail)
                    ->subject('Test-E-Mail - ' . config('app.name'));
            });

            return response()->json(['success' => true, 'message' => 'Test-E-Mail wurde an ' . $userEmail . ' gesendet.']);
        } catch (\Exception $e) {
            return response()->json(['success' => false, 'error' => 'E-Mail konnte nicht gesendet werden: ' . $e->getMessage()], 400);
        }
    }

    // ── Health Check ───────────────────────────────────────────────

    public function healthCheck()
    {
        $checks = [];

        // Database
        try {
            DB::connection()->getPdo();
            $checks['database'] = ['status' => 'ok', 'message' => 'Verbunden'];
        } catch (\Exception $e) {
            $checks['database'] = ['status' => 'error', 'message' => $e->getMessage()];
        }

        // Redis
        try {
            $redis = app('redis');
            $redis->ping();
            $checks['redis'] = ['status' => 'ok', 'message' => 'Verbunden'];
        } catch (\Exception $e) {
            $checks['redis'] = ['status' => 'warning', 'message' => 'Nicht verfügbar'];
        }

        // Disk Space
        $freeSpace = disk_free_space(storage_path());
        $checks['disk'] = [
            'status' => $freeSpace > 100 * 1024 * 1024 ? 'ok' : 'warning',
            'message' => $this->formatBytes($freeSpace) . ' frei',
            'free_bytes' => $freeSpace,
        ];

        // PHP Version
        $checks['php'] = [
            'status' => version_compare(PHP_VERSION, '8.1', '>=') ? 'ok' : 'error',
            'message' => 'PHP ' . PHP_VERSION,
        ];

        // Storage Writable
        $checks['storage'] = [
            'status' => is_writable(storage_path()) ? 'ok' : 'error',
            'message' => is_writable(storage_path()) ? 'Beschreibbar' : 'Nicht beschreibbar',
        ];

        $overallStatus = 'ok';
        foreach ($checks as $check) {
            if ($check['status'] === 'error') {
                $overallStatus = 'error';
                break;
            }
            if ($check['status'] === 'warning') {
                $overallStatus = 'warning';
            }
        }

        return response()->json([
            'status' => $overallStatus,
            'version' => config('app.version', '1.0.0'),
            'checks' => $checks,
            'timestamp' => now()->toIso8601String(),
        ]);
    }

    // ── Log Viewer ─────────────────────────────────────────────────

    public function logs(Request $request)
    {
        $this->ensureAdmin();

        $date = $request->input('date', date('Y-m-d'));
        $level = $request->input('level');
        $page = max(1, (int) $request->input('page', 1));
        $perPage = 50;

        $logFile = storage_path("logs/laravel-{$date}.log");

        if (!file_exists($logFile)) {
            // Try single log file as fallback
            $logFile = storage_path('logs/laravel.log');
        }

        $entries = [];
        if (file_exists($logFile)) {
            $content = file_get_contents($logFile);
            // Parse Laravel log format: [YYYY-MM-DD HH:MM:SS] environment.LEVEL: message
            preg_match_all('/\[(\d{4}-\d{2}-\d{2}\s\d{2}:\d{2}:\d{2})\]\s\w+\.(\w+):\s(.+?)(?=\[\d{4}-\d{2}-\d{2}\s|\z)/s', $content, $matches, PREG_SET_ORDER);

            foreach ($matches as $match) {
                $entryLevel = strtolower($match[2]);
                if ($level && $entryLevel !== strtolower($level)) continue;

                $entries[] = [
                    'timestamp' => $match[1],
                    'level' => $entryLevel,
                    'message' => trim(substr($match[3], 0, 500)),
                ];
            }
        }

        // Reverse to show newest first
        $entries = array_reverse($entries);

        $total = count($entries);
        $entries = array_slice($entries, ($page - 1) * $perPage, $perPage);

        // List available log dates
        $logDates = [];
        $logDir = storage_path('logs');
        if (is_dir($logDir)) {
            foreach (scandir($logDir, SCANDIR_SORT_DESCENDING) as $file) {
                if (preg_match('/laravel-(\d{4}-\d{2}-\d{2})\.log/', $file, $m)) {
                    $logDates[] = $m[1];
                }
            }
        }

        return response()->json([
            'entries' => $entries,
            'total' => $total,
            'page' => $page,
            'per_page' => $perPage,
            'dates' => $logDates,
        ]);
    }

    public function clearLogs(Request $request)
    {
        $this->ensureAdmin();

        $date = $request->input('date', date('Y-m-d'));
        $logFile = storage_path("logs/laravel-{$date}.log");

        if (!file_exists($logFile)) {
            $logFile = storage_path('logs/laravel.log');
        }

        if (file_exists($logFile)) {
            file_put_contents($logFile, '');
        }

        return response()->json(['success' => true, 'message' => 'Logs gelöscht.']);
    }

    // ── Update Check ───────────────────────────────────────────────

    public function checkUpdate()
    {
        $this->ensureAdmin();

        $updateService = new UpdateService();
        return response()->json($updateService->check());
    }

    // ── Password Reset (Admin) ─────────────────────────────────────

    public function resetUserPassword(Request $request)
    {
        $this->ensureAdmin();

        $request->validate([
            'user_id' => 'required|exists:users,id',
        ]);

        $user = User::findOrFail($request->user_id);

        // Generate temporary password
        $tempPassword = substr(str_shuffle('abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$'), 0, 12);

        $user->password = bcrypt($tempPassword);
        $user->save();

        return response()->json([
            'success' => true,
            'temporary_password' => $tempPassword,
            'message' => 'Passwort wurde zurückgesetzt.',
        ]);
    }

    // ── Existing Methods ───────────────────────────────────────────

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

    private function formatBytes($bytes, $precision = 2)
    {
        $units = ['B', 'KB', 'MB', 'GB', 'TB'];
        $bytes = max($bytes, 0);
        $pow = floor(($bytes ? log($bytes) : 0) / log(1024));
        $pow = min($pow, count($units) - 1);
        $bytes /= (1 << (10 * $pow));
        return round($bytes, $precision) . ' ' . $units[$pow];
    }

    public function clearCache(Request $request)
    {
        try {
            Cache::flush();
            return response()->json(['success' => true, 'message' => 'Cache wurde geleert.']);
        } catch (\Exception $e) {
            return response()->json(['success' => false, 'error' => $e->getMessage()], 400);
        }
    }

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
