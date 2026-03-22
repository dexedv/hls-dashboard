<?php

namespace App\Http\Controllers;

use App\Models\Setting;
use App\Services\EnvManager;
use App\Services\LicenseService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Artisan;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\Rule;

class InstallController extends Controller
{
    private EnvManager $envManager;
    private LicenseService $licenseService;

    public function __construct(EnvManager $envManager, LicenseService $licenseService)
    {
        $this->envManager = $envManager;
        $this->licenseService = $licenseService;
    }

    /**
     * Show the welcome/install page
     */
    public function index(Request $request)
    {
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
     * Show EULA page
     */
    public function showEula()
    {
        return view('install.eula');
    }

    /**
     * Accept EULA
     */
    public function acceptEula(Request $request)
    {
        $request->validate([
            'accept_eula' => 'required|accepted',
        ], [
            'accept_eula.required' => 'Sie müssen die Nutzungsbedingungen akzeptieren.',
            'accept_eula.accepted' => 'Sie müssen die Nutzungsbedingungen akzeptieren.',
        ]);

        // Store acceptance in session for now; will be persisted after DB setup
        $request->session()->put('eula_accepted', true);

        return redirect()->route('install.license');
    }

    /**
     * Show license key input form
     */
    public function showLicense()
    {
        return view('install.license');
    }

    /**
     * Validate and save license key
     */
    public function saveLicense(Request $request)
    {
        $request->validate([
            'license_key' => 'required|string|min:10',
        ]);

        $licenseKey = trim($request->input('license_key'));

        // Validate RSA signature
        $payload = $this->licenseService->validateSignature($licenseKey);

        if ($payload === false) {
            return back()
                ->with('error', 'Ungültiger Lizenzschlüssel. Bitte überprüfen Sie Ihre Eingabe.')
                ->withInput();
        }

        // Store license key in .env
        $this->envManager->setEnvValue('LICENSE_KEY', $licenseKey);

        return redirect()->route('install.database');
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
            'DB_CONNECTION' => match ($request->input('db_type')) {
                'supabase' => 'sqlite',
                'postgresql' => 'pgsql',
                default => $request->input('db_type'),
            },
            'APP_KEY' => $this->envManager->generateKey(),
            'APP_URL' => $request->input('app_url', 'http://localhost'),
            'APP_DEBUG' => 'true',
        ];

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

        if (!$this->envManager->writeEnv($data)) {
            return back()->with('error', 'Konfiguration konnte nicht gespeichert werden.')->withInput();
        }

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
        $migrationResult = $this->envManager->runMigrations();

        if (!$migrationResult['success']) {
            return back()->with('error', 'Migration fehlgeschlagen: ' . $migrationResult['message'])->withInput();
        }

        $request->validate([
            'name' => 'required|string|max:255',
            'email' => 'required|email|unique:users,email',
            'password' => 'required|string|min:8|confirmed',
        ]);

        $user = \App\Models\User::create([
            'name' => $request->input('name'),
            'email' => $request->input('email'),
            'password' => Hash::make($request->input('password')),
            'role' => 'owner',
            'is_approved' => true,
        ]);

        $this->envManager->createDefaultLabel();
        $this->envManager->createChatTable();

        // Save EULA acceptance
        if ($request->session()->get('eula_accepted')) {
            Setting::set('eula_accepted_at', now()->toIso8601String());
        }

        // Activate license from .env if present
        $licenseKey = $this->envManager->getEnv('LICENSE_KEY');
        if ($licenseKey) {
            $this->licenseService->activate($licenseKey);
        }

        Artisan::call('config:clear');

        return redirect()->route('install.company');
    }

    /**
     * Show company configuration form
     */
    public function showCompany()
    {
        return view('install.company');
    }

    /**
     * Save company configuration
     */
    public function saveCompany(Request $request)
    {
        $request->validate([
            'company_name' => 'required|string|max:255',
            'app_logo' => 'nullable|file|max:2048|mimes:png,jpg,jpeg,svg',
            'primary_color' => 'nullable|string|max:7',
            'tax_rate' => 'nullable|numeric|min:0|max:100',
        ]);

        $settings = [
            'company_name' => $request->input('company_name'),
            'company_address' => $request->input('company_address'),
            'company_zip' => $request->input('company_zip'),
            'company_city' => $request->input('company_city'),
            'company_country' => $request->input('company_country', 'Deutschland'),
            'company_phone' => $request->input('company_phone'),
            'company_email' => $request->input('company_email'),
            'company_website' => $request->input('company_website'),
            'company_tax_id' => $request->input('company_tax_id'),
            'company_vat_id' => $request->input('company_vat_id'),
            'tax_rate' => $request->input('tax_rate', 19),
            'currency' => $request->input('currency', 'EUR'),
            'currency_symbol' => $request->input('currency', 'EUR'),
            'app_name' => $request->input('app_name', 'Dashboard'),
            'primary_color' => $request->input('primary_color', '#0284c7'),
        ];

        foreach ($settings as $key => $value) {
            if ($value !== null) {
                Setting::set($key, $value);
            }
        }

        // Handle logo upload
        if ($request->hasFile('app_logo')) {
            $path = $request->file('app_logo')->store('branding', 'public');
            Setting::set('app_logo', $path);
        }

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
