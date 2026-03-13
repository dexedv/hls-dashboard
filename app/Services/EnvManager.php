<?php

namespace App\Services;

use Illuminate\Support\Facades\Artisan;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\File;

class EnvManager
{
    private string $envPath;

    public function __construct()
    {
        $this->envPath = base_path('.env');
    }

    /**
     * Check if the application is already installed
     */
    public function isInstalled(): bool
    {
        // Check if .env file exists
        if (!File::exists($this->envPath)) {
            return false;
        }

        // Check if APP_KEY is set
        $appKey = config('app.key');
        if (empty($appKey) || str_starts_with($appKey, 'base64:')) {
            // Need to check if it's a valid key
            if (empty($appKey)) {
                return false;
            }
        }

        // Check if INSTALLED flag is set
        if (!$this->getEnv('INSTALLED')) {
            return false;
        }

        // Try to connect to database
        try {
            DB::connection()->getPdo();
            return true;
        } catch (\Exception $e) {
            return false;
        }
    }

    /**
     * Get a value from .env file
     */
    public function getEnv(string $key): ?string
    {
        if (!File::exists($this->envPath)) {
            return null;
        }

        $content = File::get($this->envPath);
        $lines = explode("\n", $content);

        foreach ($lines as $line) {
            $line = trim($line);
            if (empty($line) || str_starts_with($line, '#')) {
                continue;
            }

            if (str_starts_with($line, $key . '=')) {
                return substr($line, strlen($key) + 1);
            }
        }

        return null;
    }

    /**
     * Write .env file with database configuration
     */
    public function writeEnv(array $data): bool
    {
        $envContent = File::exists($this->envPath) ? File::get($this->envPath) : '';

        // Remove existing database and Supabase settings
        $envContent = $this->removeEnvLines($envContent, [
            'APP_NAME',
            'APP_ENV',
            'APP_KEY',
            'APP_DEBUG',
            'APP_URL',
            'APP_LOCALE',
            'LOG_CHANNEL',
            'LOG_LEVEL',
            'DB_CONNECTION',
            'DB_HOST',
            'DB_PORT',
            'DB_DATABASE',
            'DB_USERNAME',
            'DB_PASSWORD',
            'USE_SUPABASE',
            'SUPABASE_URL',
            'SUPABASE_ANON_KEY',
            'SUPABASE_SERVICE_KEY',
            'SESSION_DRIVER',
            'CACHE_STORE',
            'INSTALLED',
        ]);

        // Add new configuration
        $newContent = $envContent;

        // Add APP settings
        $newContent .= "\nAPP_NAME=\"HLS Dashboard\"\n";
        $newContent .= "APP_ENV=production\n";
        $newContent .= "APP_KEY=" . ($data['APP_KEY'] ?? $this->generateKey()) . "\n";
        $newContent .= "APP_DEBUG=" . ($data['APP_DEBUG'] ?? 'false') . "\n";
        $newContent .= "APP_URL=" . ($data['APP_URL'] ?? 'http://localhost') . "\n";
        $newContent .= "APP_LOCALE=de\n";
        $newContent .= "LOG_CHANNEL=stack\n";
        $newContent .= "LOG_LEVEL=debug\n";

        // Add database settings
        $newContent .= "\n# Database Configuration\n";
        $newContent .= "DB_CONNECTION=" . $data['DB_CONNECTION'] . "\n";

        if ($data['DB_CONNECTION'] === 'sqlite') {
            $newContent .= "DB_DATABASE=" . database_path('database.sqlite') . "\n";
        } else {
            $newContent .= "DB_HOST=" . ($data['DB_HOST'] ?? '127.0.0.1') . "\n";
            $newContent .= "DB_PORT=" . ($data['DB_PORT'] ?? '3306') . "\n";
            $newContent .= "DB_DATABASE=" . $data['DB_DATABASE'] . "\n";
            $newContent .= "DB_USERNAME=" . $data['DB_USERNAME'] . "\n";
            $newContent .= "DB_PASSWORD=" . ($data['DB_PASSWORD'] ?? '') . "\n";
        }

        // Add Supabase settings if enabled
        if (isset($data['USE_SUPABASE']) && $data['USE_SUPABASE']) {
            $newContent .= "\n# Supabase Configuration\n";
            $newContent .= "USE_SUPABASE=true\n";
            $newContent .= "SUPABASE_URL=" . ($data['SUPABASE_URL'] ?? '') . "\n";
            $newContent .= "SUPABASE_ANON_KEY=" . ($data['SUPABASE_ANON_KEY'] ?? '') . "\n";
            $newContent .= "SUPABASE_SERVICE_KEY=" . ($data['SUPABASE_SERVICE_KEY'] ?? '') . "\n";
        }

        // Add session and cache
        $newContent .= "\nSESSION_DRIVER=file\n";
        $newContent .= "CACHE_STORE=file\n";

        // Mark as installed
        $newContent .= "\nINSTALLED=true\n";

        return File::put($this->envPath, $newContent) !== false;
    }

    /**
     * Remove specific lines from .env content
     */
    private function removeEnvLines(string $content, array $keys): string
    {
        $lines = explode("\n", $content);
        $newLines = [];

        foreach ($lines as $line) {
            $line = trim($line);
            $keep = true;

            foreach ($keys as $key) {
                if (str_starts_with($line, $key . '=')) {
                    $keep = false;
                    break;
                }
            }

            if ($keep && !empty($line)) {
                $newLines[] = $line;
            }
        }

        return implode("\n", $newLines);
    }

    /**
     * Generate a new APP_KEY
     */
    public function generateKey(): string
    {
        return 'base64:' . base64_encode(random_bytes(32));
    }

    /**
     * Test database connection
     */
    public function testDatabase(string $connection, ?string $host = null, ?int $port = null, ?string $database = null, ?string $username = null, ?string $password = null): array
    {
        try {
            // For SQLite, just check if we can create the file
            if ($connection === 'sqlite') {
                $dbPath = database_path('database.sqlite');

                // Create empty file if it doesn't exist
                if (!file_exists($dbPath)) {
                    touch($dbPath);
                }

                config([
                    'database.connections.sqlite.database' => $dbPath,
                ]);

                DB::connection('sqlite')->getPdo();
                return ['success' => true, 'message' => 'SQLite connection successful'];
            }

            // Test MySQL/PostgreSQL connection
            config([
                'database.connections.' . $connection => [
                    'driver' => $connection,
                    'host' => $host ?? '127.0.0.1',
                    'port' => $port ?? ($connection === 'mysql' ? 3306 : 5432),
                    'database' => $database,
                    'username' => $username ?? 'root',
                    'password' => $password ?? '',
                    'charset' => 'utf8mb4',
                    'collation' => 'utf8mb4_unicode_ci',
                    'prefix' => '',
                    'strict' => true,
                    'engine' => null,
                ],
            ]);

            DB::connection($connection)->getPdo();

            return ['success' => true, 'message' => ucfirst($connection) . ' connection successful'];
        } catch (\Exception $e) {
            return ['success' => false, 'message' => $e->getMessage()];
        }
    }

    /**
     * Run database migrations
     */
    public function runMigrations(): array
    {
        try {
            // Clear config cache
            Artisan::call('config:clear');

            // Run migrations
            Artisan::call('migrate', ['--force' => true]);

            return ['success' => true, 'message' => 'Migrations completed successfully'];
        } catch (\Exception $e) {
            return ['success' => false, 'message' => $e->getMessage()];
        }
    }

    /**
     * Create default labels
     */
    public function createDefaultLabel(): void
    {
        try {
            // Run the LabelSeeder to create all default labels
            $seeder = new \Database\Seeders\LabelSeeder();
            $seeder->run();
        } catch (\Exception $e) {
            // Ignore if labels table doesn't exist yet
        }
    }

    /**
     * Create chat messages table
     */
    public function createChatTable(): void
    {
        try {
            $dbDriver = config('database.default');

            if ($dbDriver === 'mysql') {
                \Illuminate\Support\Facades\DB::statement("
                    CREATE TABLE IF NOT EXISTS chat_messages (
                        id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
                        sender_id BIGINT UNSIGNED NOT NULL,
                        receiver_id BIGINT UNSIGNED NOT NULL,
                        message TEXT NOT NULL,
                        is_read TINYINT(1) DEFAULT 0,
                        created_at TIMESTAMP NULL,
                        updated_at TIMESTAMP NULL,
                        FOREIGN KEY (sender_id) REFERENCES users(id) ON DELETE CASCADE,
                        FOREIGN KEY (receiver_id) REFERENCES users(id) ON DELETE CASCADE
                    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
                ");
            }
        } catch (\Exception $e) {
            // Ignore errors
        }
    }
}
