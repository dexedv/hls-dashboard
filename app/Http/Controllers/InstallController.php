<?php

namespace App\Http\Controllers;

use App\Services\EnvManager;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Artisan;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\Rule;

class InstallController extends Controller
{
    private EnvManager $envManager;

    public function __construct(EnvManager $envManager)
    {
        $this->envManager = $envManager;
    }

    /**
     * Show the welcome/install page
     */
    public function index(Request $request)
    {
        // If already installed, show option to reinstall
        $isInstalled = $this->envManager->isInstalled();
        $reinstall = $request->query('reinstall') || $request->query('mode') === 'repair';

        if ($isInstalled && !$reinstall) {
            return redirect('/');
        }

        return view('install.welcome', [
            'isInstalled' => $isInstalled,
            'mode' => $request->query('mode', 'install'),
        ]);
    }

    /**
     * Show database configuration form
     */
    public function showDatabase()
    {
        return view('install.database');
    }

    /**
     * Save database configuration
     */
    public function saveDatabase(Request $request)
    {
        $request->validate([
            'db_type' => 'required|in:mysql,postgresql,sqlite,supabase',
            'db_host' => 'required_if:db_type,mysql,postgresql',
            'db_port' => 'required_if:db_type,mysql,postgresql',
            'db_database' => 'required_if:db_type,mysql,postgresql',
            'db_username' => 'required_if:db_type,mysql,postgresql',
            'supabase_url' => 'required_if:db_type,supabase',
            'supabase_anon_key' => 'required_if:db_type,supabase',
            'supabase_service_key' => 'required_if:db_type,supabase',
        ]);

        $data = [
            'DB_CONNECTION' => $request->input('db_type') === 'supabase' ? 'sqlite' : $request->input('db_type'),
            'APP_KEY' => $this->envManager->generateKey(),
            'APP_URL' => $request->input('app_url', 'http://localhost'),
            'APP_DEBUG' => 'true',
        ];

        // Add database credentials based on type
        if ($request->input('db_type') === 'sqlite') {
            $data['DB_CONNECTION'] = 'sqlite';
        } elseif ($request->input('db_type') === 'supabase') {
            $data['DB_CONNECTION'] = 'sqlite';
            $data['USE_SUPABASE'] = true;
            $data['SUPABASE_URL'] = $request->input('supabase_url');
            $data['SUPABASE_ANON_KEY'] = $request->input('supabase_anon_key');
            $data['SUPABASE_SERVICE_KEY'] = $request->input('supabase_service_key');
        } else {
            $data['DB_HOST'] = $request->input('db_host');
            $data['DB_PORT'] = $request->input('db_port');
            $data['DB_DATABASE'] = $request->input('db_database');
            $data['DB_USERNAME'] = $request->input('db_username');
            $data['DB_PASSWORD'] = $request->input('db_password', '');
        }

        // Test database connection first
        $testResult = $this->envManager->testDatabase(
            $data['DB_CONNECTION'],
            $data['DB_HOST'] ?? null,
            isset($data['DB_PORT']) ? (int) $data['DB_PORT'] : null,
            $data['DB_DATABASE'] ?? null,
            $data['DB_USERNAME'] ?? null,
            $data['DB_PASSWORD'] ?? null
        );

        if (!$testResult['success']) {
            return back()->with('error', 'Datenbank-Verbindung fehlgeschlagen: ' . $testResult['message'])->withInput();
        }

        // Write .env file
        if (!$this->envManager->writeEnv($data)) {
            return back()->with('error', 'Konfiguration konnte nicht gespeichert werden.')->withInput();
        }

        // Clear config cache
        Artisan::call('config:clear');

        return redirect()->route('install.admin');
    }

    /**
     * Test database connection (AJAX)
     */
    public function testConnection(Request $request)
    {
        $request->validate([
            'db_type' => 'required|in:mysql,postgresql,sqlite,supabase',
            'db_host' => 'required_if:db_type,mysql,postgresql',
            'db_port' => 'required_if:db_type,mysql,postgresql',
            'db_database' => 'required_if:db_type,mysql,postgresql',
            'db_username' => 'required_if:db_type,mysql,postgresql',
        ]);

        $result = $this->envManager->testDatabase(
            $request->input('db_type'),
            $request->input('db_host'),
            $request->input('db_port'),
            $request->input('db_database'),
            $request->input('db_username'),
            $request->input('db_password')
        );

        return response()->json($result);
    }

    /**
     * Show admin creation form
     */
    public function showAdmin()
    {
        return view('install.admin');
    }

    /**
     * Save admin user
     */
    public function saveAdmin(Request $request)
    {
        // Run migrations first (before validation since we need the tables)
        $migrationResult = $this->envManager->runMigrations();

        if (!$migrationResult['success']) {
            return back()->with('error', 'Migration fehlgeschlagen: ' . $migrationResult['message'])->withInput();
        }

        // Now validate
        $request->validate([
            'name' => 'required|string|max:255',
            'email' => 'required|email|unique:users,email',
            'password' => 'required|string|min:8|confirmed',
        ]);

        // Create admin user with owner role
        $user = \App\Models\User::create([
            'name' => $request->input('name'),
            'email' => $request->input('email'),
            'password' => Hash::make($request->input('password')),
            'role' => 'owner',
        ]);

        // Create default label
        $this->envManager->createDefaultLabel();

        // Create chat messages table
        $this->envManager->createChatTable();

        // Clear config cache again after migrations
        Artisan::call('config:clear');

        return redirect()->route('install.complete');
    }

    /**
     * Show completion page
     */
    public function complete()
    {
        return view('install.complete');
    }
}
