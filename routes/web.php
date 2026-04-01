<?php

use App\Http\Controllers\ProfileController;
use App\Http\Controllers\MyAssignmentsController;
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
use App\Http\Controllers\NotificationController;
use App\Http\Controllers\SearchController;
use App\Http\Controllers\ExportController;
use App\Http\Controllers\ImportController;
use App\Http\Controllers\ProductController;
use App\Http\Controllers\AttachmentController;
use App\Http\Controllers\DocumentFolderController;
use App\Http\Controllers\ExpenseController;
use App\Http\Controllers\ContractController;
use App\Http\Controllers\KnowledgeBaseController;
use App\Http\Controllers\HoursReportController;
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


Route::get('/dashboard', [DashboardController::class, 'index'])
    ->middleware(['auth', 'verified', 'installed', 'license'])
    ->name('dashboard');

Route::middleware(['auth', 'verified', 'installed', 'license'])->group(function () {
    Route::get('my-assignments', [MyAssignmentsController::class, 'index'])->name('my-assignments.index');

    Route::get('/profile', [ProfileController::class, 'edit'])->name('profile.edit');
    Route::patch('/profile', [ProfileController::class, 'update'])->name('profile.update');
    Route::delete('/profile', [ProfileController::class, 'destroy'])->name('profile.destroy');

    // Dashboard Modules with permission middleware
    // Projects - view for index/show, create for store, edit for update, delete for destroy
    Route::get('projects', [ProjectController::class, 'index'])->name('projects.index')->middleware('permission:projects.view');
    Route::get('projects/create', [ProjectController::class, 'create'])->name('projects.create')->middleware('permission:projects.create');
    Route::post('projects', [ProjectController::class, 'store'])->name('projects.store')->middleware('permission:projects.create');
    Route::post('projects/bulk-archive', [ProjectController::class, 'bulkArchive'])->name('projects.bulkArchive')->middleware('permission:projects.edit');
    Route::post('projects/{project}/archive', [ProjectController::class, 'archive'])->name('projects.archive')->middleware('permission:projects.edit');
    Route::post('projects/{project}/restore', [ProjectController::class, 'restore'])->name('projects.restore')->middleware('permission:projects.edit');
    Route::get('projects/{project}', [ProjectController::class, 'show'])->name('projects.show')->middleware('permission:projects.view');
    Route::get('projects/{project}/edit', [ProjectController::class, 'edit'])->name('projects.edit')->middleware('permission:projects.edit');
    Route::put('projects/{project}', [ProjectController::class, 'update'])->name('projects.update')->middleware('permission:projects.edit');
    Route::patch('projects/{project}/status', [ProjectController::class, 'updateStatus'])->name('projects.updateStatus')->middleware('permission:projects.edit');
    Route::delete('projects/{project}', [ProjectController::class, 'destroy'])->name('projects.destroy')->middleware('permission:projects.delete');

    // Tasks
    Route::get('tasks', [TaskController::class, 'index'])->name('tasks.index')->middleware('permission:tasks.view');
    Route::get('tasks/create', [TaskController::class, 'create'])->name('tasks.create')->middleware('permission:tasks.create');
    Route::post('tasks', [TaskController::class, 'store'])->name('tasks.store')->middleware('permission:tasks.create');
    Route::get('tasks/{task}', [TaskController::class, 'show'])->name('tasks.show')->middleware('permission:tasks.view');
    Route::get('tasks/{task}/edit', [TaskController::class, 'edit'])->name('tasks.edit')->middleware('permission:tasks.edit');
    Route::put('tasks/{task}', [TaskController::class, 'update'])->name('tasks.update')->middleware('permission:tasks.edit');
    Route::patch('tasks/{task}/status', [TaskController::class, 'updateStatus'])->name('tasks.updateStatus')->middleware('permission:tasks.edit');
    Route::delete('tasks/{task}', [TaskController::class, 'destroy'])->name('tasks.destroy')->middleware('permission:tasks.delete');
    Route::post('tasks/bulk-delete', [TaskController::class, 'bulkDelete'])->name('tasks.bulkDelete')->middleware('permission:tasks.delete');
    Route::post('tasks/bulk-status', [TaskController::class, 'bulkUpdateStatus'])->name('tasks.bulkUpdateStatus')->middleware('permission:tasks.edit');
    Route::post('tasks/bulk-archive', [TaskController::class, 'bulkArchive'])->name('tasks.bulkArchive')->middleware('permission:tasks.edit');
    Route::post('tasks/{task}/archive', [TaskController::class, 'archive'])->name('tasks.archive')->middleware('permission:tasks.edit');
    Route::post('tasks/{task}/restore', [TaskController::class, 'restore'])->name('tasks.restore')->middleware('permission:tasks.edit');

    // Customers (CRM)
    Route::get('customers', [CustomerController::class, 'index'])->name('customers.index')->middleware('permission:crm.view');
    Route::get('customers/create', [CustomerController::class, 'create'])->name('customers.create')->middleware('permission:crm.create');
    Route::post('customers', [CustomerController::class, 'store'])->name('customers.store')->middleware('permission:crm.create');
    Route::get('customers/{customer}', [CustomerController::class, 'show'])->name('customers.show')->middleware('permission:crm.view');
    Route::get('customers/{customer}/edit', [CustomerController::class, 'edit'])->name('customers.edit')->middleware('permission:crm.edit');
    Route::put('customers/{customer}', [CustomerController::class, 'update'])->name('customers.update')->middleware('permission:crm.edit');
    Route::delete('customers/{customer}', [CustomerController::class, 'destroy'])->name('customers.destroy')->middleware('permission:crm.delete');
    Route::post('customers/bulk-delete', [CustomerController::class, 'bulkDelete'])->name('customers.bulkDelete')->middleware('permission:crm.delete');

    // Leads
    Route::get('leads', [LeadController::class, 'index'])->name('leads.index')->middleware('permission:leads.view');
    Route::get('leads/create', [LeadController::class, 'create'])->name('leads.create')->middleware('permission:leads.create');
    Route::post('leads', [LeadController::class, 'store'])->name('leads.store')->middleware('permission:leads.create');
    Route::get('leads/{lead}', [LeadController::class, 'show'])->name('leads.show')->middleware('permission:leads.view');
    Route::get('leads/{lead}/edit', [LeadController::class, 'edit'])->name('leads.edit')->middleware('permission:leads.edit');
    Route::put('leads/{lead}', [LeadController::class, 'update'])->name('leads.update')->middleware('permission:leads.edit');
    Route::delete('leads/{lead}', [LeadController::class, 'destroy'])->name('leads.destroy')->middleware('permission:leads.delete');
    Route::post('leads/{lead}/convert', [LeadController::class, 'convert'])->name('leads.convert')->middleware('permission:leads.convert');

    // Calendar
    Route::get('calendar', [EventController::class, 'index'])->name('calendar.index')->middleware('permission:calendar.view');
    Route::get('calendar/create', [EventController::class, 'create'])->name('calendar.create')->middleware('permission:calendar.create');
    Route::post('calendar', [EventController::class, 'store'])->name('calendar.store')->middleware('permission:calendar.create');
    Route::get('calendar/{calendar}', [EventController::class, 'show'])->name('calendar.show')->middleware('permission:calendar.view');
    Route::get('calendar/{calendar}/edit', [EventController::class, 'edit'])->name('calendar.edit')->middleware('permission:calendar.edit');
    Route::put('calendar/{calendar}', [EventController::class, 'update'])->name('calendar.update')->middleware('permission:calendar.edit');
    Route::delete('calendar/{calendar}', [EventController::class, 'destroy'])->name('calendar.destroy')->middleware('permission:calendar.delete');

    // Invoices
    Route::get('invoices', [InvoiceController::class, 'index'])->name('invoices.index')->middleware('permission:invoices.view');
    Route::get('invoices/create', [InvoiceController::class, 'create'])->name('invoices.create')->middleware('permission:invoices.create');
    Route::post('invoices', [InvoiceController::class, 'store'])->name('invoices.store')->middleware('permission:invoices.create');
    Route::post('invoices/bulk-status', [InvoiceController::class, 'bulkUpdateStatus'])->name('invoices.bulkUpdateStatus')->middleware('permission:invoices.edit');
    Route::post('invoices/bulk-archive', [InvoiceController::class, 'bulkArchive'])->name('invoices.bulkArchive')->middleware('permission:invoices.edit');
    Route::post('invoices/{invoice}/archive', [InvoiceController::class, 'archive'])->name('invoices.archive')->middleware('permission:invoices.edit');
    Route::post('invoices/{invoice}/restore', [InvoiceController::class, 'restore'])->name('invoices.restore')->middleware('permission:invoices.edit');
    Route::get('invoices/{invoice}', [InvoiceController::class, 'show'])->name('invoices.show')->middleware('permission:invoices.view');
    Route::get('invoices/{invoice}/edit', [InvoiceController::class, 'edit'])->name('invoices.edit')->middleware('permission:invoices.edit');
    Route::put('invoices/{invoice}', [InvoiceController::class, 'update'])->name('invoices.update')->middleware('permission:invoices.edit');
    Route::delete('invoices/{invoice}', [InvoiceController::class, 'destroy'])->name('invoices.destroy')->middleware('permission:invoices.delete');
    Route::get('invoices/{invoice}/pdf', [InvoiceController::class, 'pdf'])->name('invoices.pdf')->middleware(['permission:invoices.view', 'throttle:exports']);
    Route::post('invoices/{invoice}/send-email', [InvoiceController::class, 'sendEmail'])->name('invoices.sendEmail')->middleware('permission:invoices.send');
    Route::post('invoices/{invoice}/mark-paid', [InvoiceController::class, 'markPaid'])->name('invoices.markPaid')->middleware('permission:invoices.mark_paid');

    // Quotes (Angebote)
    Route::get('quotes', [QuoteController::class, 'index'])->name('quotes.index')->middleware('permission:quotes.view');
    Route::get('quotes/create', [QuoteController::class, 'create'])->name('quotes.create')->middleware('permission:quotes.create');
    Route::post('quotes', [QuoteController::class, 'store'])->name('quotes.store')->middleware('permission:quotes.create');
    Route::post('quotes/bulk-archive', [QuoteController::class, 'bulkArchive'])->name('quotes.bulkArchive')->middleware('permission:quotes.edit');
    Route::post('quotes/{quote}/archive', [QuoteController::class, 'archive'])->name('quotes.archive')->middleware('permission:quotes.edit');
    Route::post('quotes/{quote}/restore', [QuoteController::class, 'restore'])->name('quotes.restore')->middleware('permission:quotes.edit');
    Route::get('quotes/{quote}', [QuoteController::class, 'show'])->name('quotes.show')->middleware('permission:quotes.view');
    Route::get('quotes/{quote}/edit', [QuoteController::class, 'edit'])->name('quotes.edit')->middleware('permission:quotes.edit');
    Route::put('quotes/{quote}', [QuoteController::class, 'update'])->name('quotes.update')->middleware('permission:quotes.edit');
    Route::delete('quotes/{quote}', [QuoteController::class, 'destroy'])->name('quotes.destroy')->middleware('permission:quotes.delete');
    Route::get('quotes/{quote}/pdf', [QuoteController::class, 'pdf'])->name('quotes.pdf')->middleware(['permission:quotes.view', 'throttle:exports']);
    Route::post('quotes/{quote}/send-email', [QuoteController::class, 'sendEmail'])->name('quotes.sendEmail')->middleware('permission:quotes.edit');
    Route::post('quotes/{quote}/convert-to-invoice', [QuoteController::class, 'convertToInvoice'])->name('quotes.convertToInvoice')->middleware('permission:quotes.convert_to_invoice');

    // Time Tracking
    Route::get('time-tracking', [TimeEntryController::class, 'index'])->name('time-tracking.index')->middleware('permission:time_tracking.view');
    Route::get('time-tracking/create', [TimeEntryController::class, 'create'])->name('time-tracking.create')->middleware('permission:time_tracking.create');
    Route::post('time-tracking', [TimeEntryController::class, 'store'])->name('time-tracking.store')->middleware('permission:time_tracking.create');
    Route::get('time-tracking/{time_tracking}', [TimeEntryController::class, 'show'])->name('time-tracking.show')->middleware('permission:time_tracking.view');
    Route::get('time-tracking/{time_tracking}/edit', [TimeEntryController::class, 'edit'])->name('time-tracking.edit')->middleware('permission:time_tracking.edit');
    Route::put('time-tracking/{time_tracking}', [TimeEntryController::class, 'update'])->name('time-tracking.update')->middleware('permission:time_tracking.edit');
    Route::delete('time-tracking/{time_tracking}', [TimeEntryController::class, 'destroy'])->name('time-tracking.destroy')->middleware('permission:time_tracking.delete');
    Route::post('time-tracking/start', [TimeEntryController::class, 'start'])->name('time-tracking.start')->middleware('permission:time_tracking.create');
    Route::post('time-tracking/{timeEntry}/stop', [TimeEntryController::class, 'stop'])->name('time-tracking.stop')->middleware('permission:time_tracking.create');

    // Team
    Route::get('team', [TeamController::class, 'index'])->name('team.index')->middleware('permission:team.view');
    Route::get('team/create', [TeamController::class, 'create'])->name('team.create')->middleware('permission:team.create');
    Route::post('team', [TeamController::class, 'store'])->name('team.store')->middleware('permission:team.create');
    Route::get('team/{team}', [TeamController::class, 'show'])->name('team.show')->middleware('permission:team.view');
    Route::get('team/{team}/edit', [TeamController::class, 'edit'])->name('team.edit')->middleware('permission:team.edit');
    Route::put('team/{team}', [TeamController::class, 'update'])->name('team.update')->middleware('permission:team.edit');
    Route::delete('team/{team}', [TeamController::class, 'destroy'])->name('team.destroy')->middleware('permission:team.delete');

    // Vacation / Leave
    Route::get('vacation', [LeaveRequestController::class, 'index'])->name('vacation.index')->middleware('permission:leave.view');
    Route::get('vacation/create', [LeaveRequestController::class, 'create'])->name('vacation.create')->middleware('permission:leave.create');
    Route::post('vacation', [LeaveRequestController::class, 'store'])->name('vacation.store')->middleware('permission:leave.create');
    Route::get('vacation/{leaveRequest}', [LeaveRequestController::class, 'show'])->name('vacation.show')->middleware('permission:leave.view');
    Route::get('vacation/{leaveRequest}/edit', [LeaveRequestController::class, 'edit'])->name('vacation.edit')->middleware('permission:leave.edit');
    Route::put('vacation/{leaveRequest}', [LeaveRequestController::class, 'update'])->name('vacation.update')->middleware('permission:leave.edit');
    Route::delete('vacation/{leaveRequest}', [LeaveRequestController::class, 'destroy'])->name('vacation.destroy')->middleware('permission:leave.delete');
    Route::post('vacation/{leaveRequest}/approve', [LeaveRequestController::class, 'approve'])->name('vacation.approve')->middleware('permission:leave.approve');
    Route::post('vacation/{leaveRequest}/reject', [LeaveRequestController::class, 'reject'])->name('vacation.reject')->middleware('permission:leave.approve');

    // Notes
    Route::get('notes', [NoteController::class, 'index'])->name('notes.index')->middleware('permission:notes.view');
    Route::get('notes/create', [NoteController::class, 'create'])->name('notes.create')->middleware('permission:notes.create');
    Route::post('notes', [NoteController::class, 'store'])->name('notes.store')->middleware('permission:notes.create');
    Route::post('notes/bulk-archive', [NoteController::class, 'bulkArchive'])->name('notes.bulkArchive')->middleware('permission:notes.edit');
    Route::get('notes/{note}', [NoteController::class, 'show'])->name('notes.show')->middleware('permission:notes.view');
    Route::get('notes/{note}/edit', [NoteController::class, 'edit'])->name('notes.edit')->middleware('permission:notes.edit');
    Route::put('notes/{note}', [NoteController::class, 'update'])->name('notes.update')->middleware('permission:notes.edit');
    Route::delete('notes/{note}', [NoteController::class, 'destroy'])->name('notes.destroy')->middleware('permission:notes.delete');
    Route::post('notes/{note}/toggle-pin', [NoteController::class, 'togglePin'])->name('notes.togglePin')->middleware('permission:notes.edit');
    Route::post('notes/{note}/archive', [NoteController::class, 'archive'])->name('notes.archive')->middleware('permission:notes.edit');
    Route::post('notes/{note}/restore', [NoteController::class, 'restore'])->name('notes.restore')->middleware('permission:notes.edit');

    // Inventory
    Route::get('inventory', [InventoryController::class, 'index'])->name('inventory.index')->middleware('permission:inventory.view');
    Route::get('inventory/create', [InventoryController::class, 'create'])->name('inventory.create')->middleware('permission:inventory.create');
    Route::post('inventory', [InventoryController::class, 'store'])->name('inventory.store')->middleware('permission:inventory.create');
    Route::get('inventory/{item}', [InventoryController::class, 'show'])->name('inventory.show')->middleware('permission:inventory.view');
    Route::get('inventory/{item}/edit', [InventoryController::class, 'edit'])->name('inventory.edit')->middleware('permission:inventory.edit');
    Route::put('inventory/{item}', [InventoryController::class, 'update'])->name('inventory.update')->middleware('permission:inventory.edit');
    Route::delete('inventory/{item}', [InventoryController::class, 'destroy'])->name('inventory.destroy')->middleware('permission:inventory.delete');
    Route::post('inventory/{item}/movement', [InventoryController::class, 'recordMovement'])->name('inventory.movement')->middleware('permission:inventory.edit');
    Route::post('inventory/bulk-delete', [InventoryController::class, 'bulkDelete'])->name('inventory.bulkDelete')->middleware('permission:inventory.delete');

    // Tickets
    Route::get('tickets', [TicketController::class, 'index'])->name('tickets.index')->middleware('permission:tickets.view');
    Route::get('tickets/create', [TicketController::class, 'create'])->name('tickets.create')->middleware('permission:tickets.create');
    Route::post('tickets', [TicketController::class, 'store'])->name('tickets.store')->middleware('permission:tickets.create');
    Route::post('tickets/bulk-archive', [TicketController::class, 'bulkArchive'])->name('tickets.bulkArchive')->middleware('permission:tickets.edit');
    Route::post('tickets/{ticket}/archive', [TicketController::class, 'archive'])->name('tickets.archive')->middleware('permission:tickets.edit');
    Route::post('tickets/{ticket}/restore', [TicketController::class, 'restore'])->name('tickets.restore')->middleware('permission:tickets.edit');
    Route::get('tickets/{ticket}', [TicketController::class, 'show'])->name('tickets.show')->middleware('permission:tickets.view');
    Route::get('tickets/{ticket}/edit', [TicketController::class, 'edit'])->name('tickets.edit')->middleware('permission:tickets.edit');
    Route::put('tickets/{ticket}', [TicketController::class, 'update'])->name('tickets.update')->middleware('permission:tickets.edit');
    Route::patch('tickets/{ticket}/status', [TicketController::class, 'updateStatus'])->name('tickets.updateStatus')->middleware('permission:tickets.edit');
    Route::delete('tickets/{ticket}', [TicketController::class, 'destroy'])->name('tickets.destroy')->middleware('permission:tickets.delete');
    Route::post('tickets/{ticket}/comment', [TicketController::class, 'addComment'])->name('tickets.comment')->middleware('permission:tickets.create');

    // New modules
    Route::get('finances', [FinanceController::class, 'index'])->name('finances.index')->middleware('permission:finances.view');
    Route::get('warehouse', [WarehouseController::class, 'index'])->name('warehouse.index')->middleware('permission:wms.view');
    Route::post('warehouse', [WarehouseController::class, 'store'])->name('warehouse.store')->middleware('permission:wms.create');
    Route::get('barcode', [BarcodeController::class, 'index'])->name('barcode.index')->middleware('permission:barcode.view');
    Route::post('barcode', [BarcodeController::class, 'store'])->name('barcode.store')->middleware('permission:barcode.create');
    Route::get('statistics', [StatisticsController::class, 'index'])->name('statistics.index')->middleware('permission:statistics.view');

    // Email Routes
    Route::get('email', [EmailController::class, 'index'])->name('email.index')->middleware('permission:email.view');
    Route::get('email/settings', [EmailController::class, 'settings'])->name('email.settings')->middleware('permission:email.view');
    Route::post('email/settings', [EmailController::class, 'saveSettings'])->name('email.settings.save')->middleware('permission:email.view');
    Route::post('email/sync', [EmailController::class, 'sync'])->name('email.sync')->middleware('permission:email.view');
    Route::get('email/folder/{folderId}', [EmailController::class, 'folder'])->name('email.folder')->middleware('permission:email.view');
    Route::get('email/{emailId}', [EmailController::class, 'show'])->name('email.show')->middleware('permission:email.view');
    Route::post('email/{emailId}/read', [EmailController::class, 'toggleRead'])->name('email.toggleRead')->middleware('permission:email.view');
    Route::post('email/{emailId}/star', [EmailController::class, 'toggleStar'])->name('email.toggleStar')->middleware('permission:email.view');
    Route::delete('email/{emailId}', [EmailController::class, 'destroy'])->name('email.destroy')->middleware('permission:email.delete');

    // Settings - accessible to all authenticated users (controller checks admin role for sensitive tabs)
    Route::get('settings', [SettingsController::class, 'index'])->name('settings.index');
    // Admin-only settings endpoints (protected by ensureAdmin() in controller)
    Route::post('settings/tax-rate', [SettingsController::class, 'saveTaxRate'])->name('settings.saveTaxRate');
    Route::post('settings/general', [SettingsController::class, 'saveGeneral'])->name('settings.saveGeneral');
    Route::post('settings/company', [SettingsController::class, 'saveCompany'])->name('settings.saveCompany');
    Route::post('settings/branding', [SettingsController::class, 'saveBranding'])->name('settings.saveBranding');
    Route::post('settings/license', [SettingsController::class, 'activateLicense'])->name('settings.activateLicense');

    // Two-Factor Authentication
    Route::post('two-factor/enable', [\App\Http\Controllers\TwoFactorController::class, 'enable'])->name('two-factor.enable');
    Route::post('two-factor/confirm', [\App\Http\Controllers\TwoFactorController::class, 'confirm'])->name('two-factor.confirm');
    Route::post('two-factor/disable', [\App\Http\Controllers\TwoFactorController::class, 'disable'])->name('two-factor.disable');
    Route::get('users', [UserController::class, 'index'])->name('users.index')->middleware('permission:users.view');
    Route::put('users/{id}', [UserController::class, 'update'])->name('users.update')->middleware('permission:users.edit');
    Route::post('users/{id}/approve', [UserController::class, 'approve'])->name('users.approve')->middleware('permission:users.edit');
    Route::post('users/{id}/disapprove', [UserController::class, 'disapprove'])->name('users.disapprove')->middleware('permission:users.edit');
    Route::get('roles', [RoleController::class, 'index'])->name('roles.index')->middleware('permission:roles.view');
    Route::post('roles/permissions', [RoleController::class, 'updatePermissions'])->name('roles.updatePermissions')->middleware('permission:permissions.manage');
    Route::post('roles/reset', [RoleController::class, 'resetRole'])->name('roles.reset')->middleware('permission:permissions.manage');
    Route::get('labels', [LabelController::class, 'index'])->name('labels.index')->middleware('permission:labels.view');
    Route::post('labels', [LabelController::class, 'store'])->name('labels.store')->middleware('permission:labels.create');
    Route::put('labels/{id}', [LabelController::class, 'update'])->name('labels.update')->middleware('permission:labels.edit');
    Route::delete('labels/{id}', [LabelController::class, 'destroy'])->name('labels.destroy')->middleware('permission:labels.delete');
    Route::get('audit-logs', [AuditLogController::class, 'index'])->name('audit_logs.index')->middleware('permission:audit_logs.view');
    Route::get('permissions', [RoleController::class, 'permissions'])->name('permissions.index')->middleware('permission:permissions.view');
    Route::get('integrations', [SettingsController::class, 'integrations'])->name('integrations.index')->middleware('permission:integrations.view');
    Route::post('integrations/api-keys', [SettingsController::class, 'createApiKey'])->name('integrations.createApiKey')->middleware('permission:integrations.manage');
    Route::get('database', [SettingsController::class, 'database'])->name('database.index')->middleware('permission:database.access');
    Route::post('database/clear-cache', [SettingsController::class, 'clearCache'])->name('database.clearCache')->middleware('permission:database.access');
    Route::post('database/optimize', [SettingsController::class, 'optimizeDatabase'])->name('database.optimize')->middleware('permission:database.access');
    Route::post('database/backup', [SettingsController::class, 'createBackup'])->name('database.backup')->middleware('permission:database.access');

    // Settings: Backup Management
    Route::get('settings/backups', [SettingsController::class, 'listBackups'])->name('settings.listBackups');
    Route::post('settings/backups/restore', [SettingsController::class, 'restoreBackup'])->name('settings.restoreBackup');
    Route::post('settings/backups/delete', [SettingsController::class, 'deleteBackup'])->name('settings.deleteBackup');
    Route::get('settings/backups/download/{filename}', [SettingsController::class, 'downloadBackup'])->name('settings.downloadBackup');

    // Settings: Email SMTP
    Route::post('settings/email', [SettingsController::class, 'saveEmail'])->name('settings.saveEmail');
    Route::post('settings/email/test', [SettingsController::class, 'testEmail'])->name('settings.testEmail');

    // Settings: Document Design
    Route::post('settings/document-design', [SettingsController::class, 'saveDocumentDesign'])->name('settings.saveDocumentDesign');

    // Settings: Logs
    Route::get('settings/logs', [SettingsController::class, 'logs'])->name('settings.logs');
    Route::post('settings/logs/clear', [SettingsController::class, 'clearLogs'])->name('settings.clearLogs');

    // Settings: Update Check
    Route::get('settings/check-update', [SettingsController::class, 'checkUpdate'])->name('settings.checkUpdate');

    // Settings: Password Reset (admin)
    Route::post('settings/reset-password', [SettingsController::class, 'resetUserPassword'])->name('settings.resetPassword');

    // Notifications (all authenticated users)
    Route::get('notifications', [NotificationController::class, 'index'])->name('notifications.index');
    Route::post('notifications/{id}/read', [NotificationController::class, 'markRead'])->name('notifications.markRead');
    Route::post('notifications/mark-all-read', [NotificationController::class, 'markAllRead'])->name('notifications.markAllRead');

    // Global Search (all authenticated users)
    Route::get('search', [SearchController::class, 'search'])->name('search')->middleware('throttle:search');

    // CSV Export (with permissions + rate limiting)
    Route::get('export/customers', [ExportController::class, 'exportCustomers'])->name('export.customers')->middleware(['permission:crm.export', 'throttle:exports']);
    Route::get('export/inventory', [ExportController::class, 'exportInventory'])->name('export.inventory')->middleware(['permission:inventory.export', 'throttle:exports']);
    Route::get('export/invoices', [ExportController::class, 'exportInvoices'])->name('export.invoices')->middleware(['permission:invoices.export', 'throttle:exports']);

    // CSV Import (with permissions)
    Route::post('import/customers', [ImportController::class, 'importCustomers'])->name('import.customers')->middleware('permission:crm.create');
    Route::post('import/inventory', [ImportController::class, 'importInventory'])->name('import.inventory')->middleware('permission:inventory.create');

    // Products (Produktkatalog)
    Route::get('products', [ProductController::class, 'index'])->name('products.index')->middleware('permission:products.view');
    Route::post('products/sync-inventory', [ProductController::class, 'syncFromInventory'])->name('products.syncInventory')->middleware('permission:products.create');
    Route::get('products/create', [ProductController::class, 'create'])->name('products.create')->middleware('permission:products.create');
    Route::post('products', [ProductController::class, 'store'])->name('products.store')->middleware('permission:products.create');
    Route::get('products/{product}', [ProductController::class, 'show'])->name('products.show')->middleware('permission:products.view');
    Route::get('products/{product}/edit', [ProductController::class, 'edit'])->name('products.edit')->middleware('permission:products.edit');
    Route::put('products/{product}', [ProductController::class, 'update'])->name('products.update')->middleware('permission:products.edit');
    Route::delete('products/{product}', [ProductController::class, 'destroy'])->name('products.destroy')->middleware('permission:products.delete');

    // Attachments
    Route::post('attachments', [AttachmentController::class, 'store'])->name('attachments.store');
    Route::get('attachments/{attachment}/preview', [AttachmentController::class, 'preview'])->name('attachments.preview');
    Route::get('attachments/{attachment}/download', [AttachmentController::class, 'download'])->name('attachments.download');
    Route::delete('attachments/{attachment}', [AttachmentController::class, 'destroy'])->name('attachments.destroy');

    // Document Folders
    Route::post('document-folders', [DocumentFolderController::class, 'store'])->name('document-folders.store');
    Route::delete('document-folders/{documentFolder}', [DocumentFolderController::class, 'destroy'])->name('document-folders.destroy');

    // Expenses (Spesen)
    Route::get('expenses', [ExpenseController::class, 'index'])->name('expenses.index')->middleware('permission:expenses.view');
    Route::get('expenses/create', [ExpenseController::class, 'create'])->name('expenses.create')->middleware('permission:expenses.create');
    Route::post('expenses', [ExpenseController::class, 'store'])->name('expenses.store')->middleware('permission:expenses.create');
    Route::get('expenses/{expense}', [ExpenseController::class, 'show'])->name('expenses.show')->middleware('permission:expenses.view');
    Route::get('expenses/{expense}/edit', [ExpenseController::class, 'edit'])->name('expenses.edit')->middleware('permission:expenses.edit');
    Route::put('expenses/{expense}', [ExpenseController::class, 'update'])->name('expenses.update')->middleware('permission:expenses.edit');
    Route::post('expenses/{expense}/approve', [ExpenseController::class, 'approve'])->name('expenses.approve')->middleware('permission:expenses.approve');
    Route::post('expenses/{expense}/reject', [ExpenseController::class, 'reject'])->name('expenses.reject')->middleware('permission:expenses.approve');
    Route::delete('expenses/{expense}', [ExpenseController::class, 'destroy'])->name('expenses.destroy')->middleware('permission:expenses.delete');

    // Contracts (Verträge)
    Route::get('contracts', [ContractController::class, 'index'])->name('contracts.index')->middleware('permission:contracts.view');
    Route::get('contracts/create', [ContractController::class, 'create'])->name('contracts.create')->middleware('permission:contracts.create');
    Route::post('contracts', [ContractController::class, 'store'])->name('contracts.store')->middleware('permission:contracts.create');
    Route::get('contracts/{contract}', [ContractController::class, 'show'])->name('contracts.show')->middleware('permission:contracts.view');
    Route::get('contracts/{contract}/edit', [ContractController::class, 'edit'])->name('contracts.edit')->middleware('permission:contracts.edit');
    Route::put('contracts/{contract}', [ContractController::class, 'update'])->name('contracts.update')->middleware('permission:contracts.edit');
    Route::delete('contracts/{contract}', [ContractController::class, 'destroy'])->name('contracts.destroy')->middleware('permission:contracts.delete');

    // Knowledge Base (Wissensdatenbank)
    Route::get('knowledge-base', [KnowledgeBaseController::class, 'index'])->name('knowledge-base.index')->middleware('permission:kb.view');
    Route::get('knowledge-base/create', [KnowledgeBaseController::class, 'create'])->name('knowledge-base.create')->middleware('permission:kb.create');
    Route::post('knowledge-base', [KnowledgeBaseController::class, 'store'])->name('knowledge-base.store')->middleware('permission:kb.create');
    Route::get('knowledge-base/{knowledgeBase}', [KnowledgeBaseController::class, 'show'])->name('knowledge-base.show')->middleware('permission:kb.view');
    Route::get('knowledge-base/{knowledgeBase}/edit', [KnowledgeBaseController::class, 'edit'])->name('knowledge-base.edit')->middleware('permission:kb.edit');
    Route::put('knowledge-base/{knowledgeBase}', [KnowledgeBaseController::class, 'update'])->name('knowledge-base.update')->middleware('permission:kb.edit');
    Route::delete('knowledge-base/{knowledgeBase}', [KnowledgeBaseController::class, 'destroy'])->name('knowledge-base.destroy')->middleware('permission:kb.delete');

    // Hours Report (Stundenauswertung)
    Route::get('hours-report', [HoursReportController::class, 'index'])->name('hours-report.index')->middleware('permission:time_tracking.view');

    // Chat routes (all authenticated users)
    Route::get('/chat', [ChatController::class, 'index'])->name('chat.index');
    Route::get('/chat/users', [ChatController::class, 'users'])->name('chat.users');
    Route::get('/chat/conversation/{userId}', [ChatController::class, 'conversation'])->name('chat.conversation');
    Route::post('/chat/send', [ChatController::class, 'send'])->name('chat.send');
    Route::get('/chat/unread', [ChatController::class, 'unread'])->name('chat.unread');
    Route::get('/chat/setup', [ChatController::class, 'setup'])->name('chat.setup');

    // Lexware Integration Routes (with permissions)
    Route::prefix('lexware')->middleware('permission:integrations.manage')->group(function () {
        Route::get('test', [LexwareController::class, 'testConnection'])->name('lexware.test');
        Route::post('save-api-key', [LexwareController::class, 'saveApiKey'])->name('lexware.saveApiKey');

        Route::post('customers/sync-all', [LexwareController::class, 'syncAllCustomers'])->name('lexware.customers.syncAll');
        Route::post('customers/import', [LexwareController::class, 'importCustomers'])->name('lexware.customers.import');
        Route::post('customers/{customer}/sync', [LexwareController::class, 'syncCustomer'])->name('lexware.customers.sync');

        Route::post('invoices/sync-all', [LexwareController::class, 'syncAllInvoices'])->name('lexware.invoices.syncAll');
        Route::post('invoices/import', [LexwareController::class, 'importInvoices'])->name('lexware.invoices.import');
        Route::post('invoices/{invoice}/sync', [LexwareController::class, 'syncInvoice'])->name('lexware.invoices.sync');

        Route::post('quotes/sync-all', [LexwareController::class, 'syncAllQuotes'])->name('lexware.quotes.syncAll');
        Route::post('quotes/{quote}/sync', [LexwareController::class, 'syncQuote'])->name('lexware.quotes.sync');
    });
});

// Health Check (no auth, for external monitoring)
Route::get('/api/health', [SettingsController::class, 'healthCheck'])->name('health.check');

// Two-Factor Challenge (outside auth middleware - user is not yet fully authenticated)
Route::get('two-factor/challenge', [\App\Http\Controllers\TwoFactorController::class, 'showChallenge'])->name('two-factor.challenge');
Route::post('two-factor/verify', [\App\Http\Controllers\TwoFactorController::class, 'verifyChallenge'])->name('two-factor.verify');

require __DIR__.'/auth.php';
