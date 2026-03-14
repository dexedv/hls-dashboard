<?php

use App\Http\Controllers\ProfileController;
use App\Http\Controllers\ProjectController;
use App\Http\Controllers\TaskController;
use App\Http\Controllers\CustomerController;
use App\Http\Controllers\LeadController;
use App\Http\Controllers\EventController;
use App\Http\Controllers\DashboardController;
use App\Http\Controllers\InvoiceController;
use App\Http\Controllers\QuoteController;
use App\Http\Controllers\TimeEntryController;
use App\Http\Controllers\TeamController;
use App\Http\Controllers\LeaveRequestController;
use App\Http\Controllers\NoteController;
use App\Http\Controllers\InventoryController;
use App\Http\Controllers\TicketController;
use App\Http\Controllers\FinanceController;
use App\Http\Controllers\WarehouseController;
use App\Http\Controllers\BarcodeController;
use App\Http\Controllers\StatisticsController;
use App\Http\Controllers\EmailController;
use App\Http\Controllers\SettingsController;
use App\Http\Controllers\UserController;
use App\Http\Controllers\RoleController;
use App\Http\Controllers\LabelController;
use App\Http\Controllers\AuditLogController;
use App\Http\Controllers\LexwareController;
use App\Http\Controllers\ChatController;
use Illuminate\Foundation\Application;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;

// Include install routes
require __DIR__.'/install.php';

Route::get('/', function () {
    // If not installed, redirect to installer
    $envManager = new \App\Services\EnvManager();
    if (!$envManager->isInstalled()) {
        return redirect()->route('install.index');
    }

    return Inertia::render('Welcome', [
        'canLogin' => Route::has('login'),
        'canRegister' => Route::has('register'),
        'laravelVersion' => Application::VERSION,
        'phpVersion' => PHP_VERSION,
    ]);
});

// Test Supabase connection
Route::get('/test-supabase', function () {
    try {
        $response = \Illuminate\Support\Facades\Http::withHeaders([
            'apikey' => config('services.supabase.anon_key'),
            'Authorization' => 'Bearer ' . config('services.supabase.anon_key'),
        ])->withOptions(['verify' => false])->get(config('services.supabase.url') . '/rest/v1/users', [
            'select' => 'count',
            'limit' => 1,
        ]);

        return response()->json([
            'status' => $response->successful() ? 'connected' : 'error',
            'code' => $response->status(),
            'tables' => 'OK',
        ]);
    } catch (\Exception $e) {
        return response()->json([
            'status' => 'error',
            'message' => $e->getMessage(),
        ]);
    }
});

Route::get('/dashboard', [DashboardController::class, 'index'])
    ->middleware(['auth', 'verified', 'installed'])
    ->name('dashboard');

Route::middleware(['auth', 'verified', 'installed'])->group(function () {
    Route::get('/profile', [ProfileController::class, 'edit'])->name('profile.edit');
    Route::patch('/profile', [ProfileController::class, 'update'])->name('profile.update');
    Route::delete('/profile', [ProfileController::class, 'destroy'])->name('profile.destroy');

    // Dashboard Modules
    Route::resource('projects', ProjectController::class)->only(['index', 'store', 'update', 'destroy', 'show', 'create', 'edit']);
    Route::resource('tasks', TaskController::class)->only(['index', 'store', 'update', 'destroy', 'show', 'create', 'edit']);
    Route::resource('customers', CustomerController::class)->only(['index', 'store', 'update', 'destroy', 'show', 'create', 'edit']);
    Route::resource('leads', LeadController::class)->only(['index', 'store', 'update', 'destroy', 'show', 'create', 'edit']);
    Route::post('leads/{lead}/convert', [LeadController::class, 'convert'])->name('leads.convert');
    Route::resource('calendar', EventController::class)->only(['index', 'store', 'update', 'destroy', 'show', 'create', 'edit']);
    Route::resource('invoices', InvoiceController::class)->only(['index', 'store', 'update', 'destroy', 'show', 'create', 'edit']);
    Route::resource('quotes', QuoteController::class)->only(['index', 'store', 'update', 'destroy', 'show', 'create', 'edit']);
    Route::resource('time-tracking', TimeEntryController::class)->only(['index', 'store', 'update', 'destroy', 'show', 'create', 'edit']);
    Route::resource('team', TeamController::class)->only(['index', 'store', 'update', 'destroy', 'show', 'create', 'edit']);
    Route::resource('vacation', LeaveRequestController::class)->only(['index', 'store', 'update', 'destroy', 'show', 'create', 'edit']);
    Route::post('vacation/{leaveRequest}/approve', [LeaveRequestController::class, 'approve'])->name('vacation.approve');
    Route::post('vacation/{leaveRequest}/reject', [LeaveRequestController::class, 'reject'])->name('vacation.reject');
    Route::resource('notes', NoteController::class)->only(['index', 'store', 'update', 'destroy', 'show', 'create', 'edit']);
    Route::post('notes/{note}/toggle-pin', [NoteController::class, 'togglePin'])->name('notes.togglePin');
    Route::resource('inventory', InventoryController::class)->only(['index', 'store', 'update', 'destroy', 'show', 'create', 'edit']);
    Route::post('inventory/{item}/movement', [InventoryController::class, 'recordMovement'])->name('inventory.movement');
    Route::resource('tickets', TicketController::class)->only(['index', 'store', 'update', 'destroy', 'show', 'create', 'edit']);
    Route::post('tickets/{ticket}/comment', [TicketController::class, 'addComment'])->name('tickets.comment');

    // New modules
    Route::get('finances', [FinanceController::class, 'index'])->name('finances.index');
    Route::get('warehouse', [WarehouseController::class, 'index'])->name('warehouse.index');
    Route::resource('warehouse', WarehouseController::class)->only(['store']);
    Route::get('barcode', [BarcodeController::class, 'index'])->name('barcode.index');
    Route::resource('barcode', BarcodeController::class)->only(['store']);
    Route::get('statistics', [StatisticsController::class, 'index'])->name('statistics.index');
    // Email Routes - User isolated (specific routes before dynamic routes)
    Route::get('email', [EmailController::class, 'index'])->name('email.index');
    Route::get('email/settings', [EmailController::class, 'settings'])->name('email.settings');
    Route::post('email/settings', [EmailController::class, 'saveSettings'])->name('email.settings.save');
    Route::post('email/sync', [EmailController::class, 'sync'])->name('email.sync');
    Route::get('email/folder/{folderId}', [EmailController::class, 'folder'])->name('email.folder');
    Route::get('email/{emailId}', [EmailController::class, 'show'])->name('email.show');
    Route::post('email/{emailId}/read', [EmailController::class, 'toggleRead'])->name('email.toggleRead');
    Route::post('email/{emailId}/star', [EmailController::class, 'toggleStar'])->name('email.toggleStar');
    Route::delete('email/{emailId}', [EmailController::class, 'destroy'])->name('email.destroy');
    Route::get('settings', [SettingsController::class, 'index'])->name('settings.index');
    Route::get('users', [UserController::class, 'index'])->name('users.index');
    Route::post('users/{id}/approve', [UserController::class, 'approve'])->name('users.approve');
    Route::post('users/{id}/disapprove', [UserController::class, 'disapprove'])->name('users.disapprove');
    Route::get('roles', [RoleController::class, 'index'])->name('roles.index');
    Route::post('roles/permissions', [RoleController::class, 'updatePermissions'])->name('roles.updatePermissions')->withoutMiddleware('csrf');
    Route::post('roles/reset', [RoleController::class, 'resetRole'])->name('roles.reset')->withoutMiddleware('csrf');
    Route::get('labels', [LabelController::class, 'index'])->name('labels.index');
    Route::post('labels', [LabelController::class, 'store'])->name('labels.store');
    Route::put('labels/{id}', [LabelController::class, 'update'])->name('labels.update');
    Route::delete('labels/{id}', [LabelController::class, 'destroy'])->name('labels.destroy');
    Route::get('audit-logs', [AuditLogController::class, 'index'])->name('audit_logs.index');
    Route::get('permissions', [RoleController::class, 'permissions'])->name('permissions.index');
    Route::get('integrations', [SettingsController::class, 'integrations'])->name('integrations.index');
    Route::get('database', [SettingsController::class, 'database'])->name('database.index');
    Route::post('database/execute', [SettingsController::class, 'executeSql'])->name('database.execute')->withoutMiddleware('csrf');
    Route::post('database/clear-cache', [SettingsController::class, 'clearCache'])->name('database.clearCache')->withoutMiddleware('csrf');
    Route::post('database/optimize', [SettingsController::class, 'optimizeDatabase'])->name('database.optimize')->withoutMiddleware('csrf');
    Route::post('database/backup', [SettingsController::class, 'createBackup'])->name('database.backup')->withoutMiddleware('csrf');

    // Chat routes - outside lexware prefix for simpler URLs
    Route::get('/chat', [ChatController::class, 'index'])->name('chat.index');
    Route::get('/chat/users', [ChatController::class, 'users'])->name('chat.users');
    Route::get('/chat/conversation/{userId}', [ChatController::class, 'conversation'])->name('chat.conversation');
    Route::post('/chat/send', [ChatController::class, 'send'])->name('chat.send');
    Route::get('/chat/unread', [ChatController::class, 'unread'])->name('chat.unread');
    Route::get('/chat/setup', [ChatController::class, 'setup'])->name('chat.setup');

    // Lexware Integration Routes
    Route::prefix('lexware')->group(function () {
        Route::get('test', [LexwareController::class, 'testConnection'])->name('lexware.test');
        Route::post('save-api-key', [LexwareController::class, 'saveApiKey'])->name('lexware.saveApiKey');

        // Customer sync
        Route::post('customers/sync-all', [LexwareController::class, 'syncAllCustomers'])->name('lexware.customers.syncAll');
        Route::post('customers/import', [LexwareController::class, 'importCustomers'])->name('lexware.customers.import');
        Route::post('customers/{customer}/sync', [LexwareController::class, 'syncCustomer'])->name('lexware.customers.sync');

        // Invoice sync
        Route::post('invoices/sync-all', [LexwareController::class, 'syncAllInvoices'])->name('lexware.invoices.syncAll');
        Route::post('invoices/import', [LexwareController::class, 'importInvoices'])->name('lexware.invoices.import');
        Route::post('invoices/{invoice}/sync', [LexwareController::class, 'syncInvoice'])->name('lexware.invoices.sync');

        // Quote sync
        Route::post('quotes/sync-all', [LexwareController::class, 'syncAllQuotes'])->name('lexware.quotes.syncAll');
        Route::post('quotes/{quote}/sync', [LexwareController::class, 'syncQuote'])->name('lexware.quotes.sync');
    });
});

require __DIR__.'/auth.php';
