<?php
require __DIR__.'/vendor/autoload.php';

$app = require_once __DIR__.'/bootstrap/app.php';
$kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);
$kernel->bootstrap();

use App\Models\User;
use App\Models\Customer;
use App\Models\Lead;
use App\Models\Project;
use App\Models\Task;
use App\Models\Note;
use App\Models\Ticket;
use Illuminate\Support\Facades\Hash;

echo "Creating company simulation...\n\n";

// Create admin user
$admin = User::firstOrCreate(
    ['email' => 'admin@hls-test.de'],
    [
        'name' => 'Admin User',
        'password' => Hash::make('password'),
        'role' => 'owner',
    ]
);
echo "Created admin user: admin@hls-test.de (password: password)\n";

// Create 20 employees
$employees = [];
$firstNames = ['Max', 'Anna', 'Lena', 'Tom', 'Sarah', 'Jan', 'Lisa', 'Peter', 'Julia', 'Michael',
               'Sandra', 'Thomas', 'Nicole', 'Stefan', 'Daniela', 'Andreas', 'Claudia', 'Patrick', 'Sabrina', 'Marco'];

for ($i = 0; $i < 20; $i++) {
    $user = User::firstOrCreate(
        ['email' => 'mitarbeiter' . ($i+1) . '@hls-test.de'],
        [
            'name' => $firstNames[$i] . ' Müller',
            'password' => Hash::make('password'),
            'role' => 'employee',
        ]
    );
    $employees[] = $user;
}
echo "Created 20 employees\n";

// Skip team members for now (no TeamMember model)
/*
foreach ($employees as $employee) {
    \App\Models\TeamMember::firstOrCreate(
        ['user_id' => $employee->id],
        [
            'role' => 'Mitarbeiter',
            'department' => ['Vertrieb', 'Entwicklung', 'Support', 'Buchhaltung', 'Marketing'][array_rand(['Vertrieb', 'Entwicklung', 'Support', 'Buchhaltung', 'Marketing'])],
            'phone' => '+49 ' . rand(100, 999) . ' ' . rand(1000000, 9999999),
        ]
    );
}
echo "Created team members\n";
*/

// Create customers
$companies = ['ABC GmbH', 'XYZ AG', 'Tech Solutions', 'Digital Services', 'Innovation Corp',
              'Global Trade', 'Premium Products', 'Smart Systems', 'Data Solutions', 'Cloud Services',
              'Future Tech', 'MegaCorp', 'StartUp Ltd', 'Enterprise Group', 'Digital Dreams'];

for ($i = 0; $i < 15; $i++) {
    Customer::firstOrCreate(
        ['email' => 'kunde' . ($i+1) . '@beispiel.de'],
        [
            'name' => $companies[$i],
            'phone' => '+49 ' . rand(100, 999) . ' ' . rand(1000000, 9999999),
            'address' => 'Straße ' . rand(1, 100) . ', ' . rand(10000, 99999) . ' Stadt',
            'created_by' => $admin->id,
        ]
    );
}
echo "Created 15 customers\n";

// Create leads
$leadSources = ['Website', 'Telefon', 'Messe', 'Empfehlung', 'Social Media'];
$leadStatuses = ['new', 'contacted', 'qualified', 'proposal', 'won'];

for ($i = 0; $i < 25; $i++) {
    Lead::firstOrCreate(
        ['email' => 'lead' . ($i+1) . '@test.de'],
        [
            'name' => 'Lead ' . ($i+1),
            'phone' => '+49 ' . rand(100, 999) . ' ' . rand(1000000, 9999999),
            'company' => 'Firma ' . ($i+1),
            'status' => $leadStatuses[array_rand($leadStatuses)],
            'source' => $leadSources[array_rand($leadSources)],
            'value' => rand(1000, 50000),
            'created_by' => $employees[array_rand($employees)]->id,
        ]
    );
}
echo "Created 25 leads\n";

// Create projects
$projectNames = ['Website Relaunch', 'App Entwicklung', 'Marketing Kampagne', 'IT Infrastruktur',
                 'Datenschutz Audit', 'Cloud Migration', 'CRM Implementierung', 'Shop System',
                 'Mobile App', 'E-Learning Plattform'];
$statuses = ['planning', 'active', 'completed', 'on_hold'];

for ($i = 0; $i < 10; $i++) {
    $customer = Customer::inRandomOrder()->first();
    $creator = !empty($employees) ? $employees[array_rand($employees)] : $admin;
    Project::firstOrCreate(
        ['name' => $projectNames[$i]],
        [
            'description' => 'Projektbeschreibung für ' . $projectNames[$i],
            'customer_id' => $customer?->id,
            'status' => $statuses[array_rand($statuses)],
            'budget' => rand(5000, 50000),
            'start_date' => now()->subDays(rand(1, 30)),
            'end_date' => now()->addDays(rand(30, 90)),
            'created_by' => $creator->id,
        ]
    );
}
echo "Created 10 projects\n";

// Create tasks
$taskTitles = ['Design erstellen', 'Code review', 'Meeting abhalten', 'Dokumentation schreiben',
               'Tests durchführen', 'Kunde kontaktieren', 'Rechnung erstellen', 'Backup machen'];

for ($i = 0; $i < 30; $i++) {
    $project = Project::inRandomOrder()->first();
    Task::firstOrCreate(
        ['title' => $taskTitles[array_rand($taskTitles)] . ' ' . ($i+1)],
        [
            'description' => 'Aufgabenbeschreibung ' . ($i+1),
            'project_id' => $project?->id,
            'assigned_to' => $employees[array_rand($employees)]->id,
            'status' => ['todo', 'in_progress', 'review', 'done'][array_rand(['todo', 'in_progress', 'review', 'done'])],
            'priority' => ['low', 'medium', 'high', 'urgent'][array_rand(['low', 'medium', 'high', 'urgent'])],
            'due_date' => now()->addDays(rand(1, 14)),
            'created_by' => $admin->id,
        ]
    );
}
echo "Created 30 tasks\n";

// Create notes
for ($i = 0; $i < 15; $i++) {
    $project = Project::inRandomOrder()->first();
    $customer = Customer::inRandomOrder()->first();
    Note::firstOrCreate(
        ['title' => 'Notiz ' . ($i+1)],
        [
            'content' => 'Inhalt der Notiz ' . ($i+1) . '. Wichtige Informationen...',
            'project_id' => $project?->id,
            'customer_id' => $customer?->id,
            'created_by' => $employees[array_rand($employees)]->id,
            'pinned' => rand(0, 1) === 1,
        ]
    );
}
echo "Created 15 notes\n";

// Create tickets
for ($i = 0; $i < 20; $i++) {
    $customer = Customer::inRandomOrder()->first();
    $project = Project::inRandomOrder()->first();
    Ticket::firstOrCreate(
        ['title' => 'Ticket ' . ($i+1)],
        [
            'description' => 'Problem: ' . substr('Lorem ipsum dolor sit amet...', 0, rand(50, 200)),
            'customer_id' => $customer?->id,
            'project_id' => $project?->id,
            'assigned_to' => $employees[array_rand($employees)]->id,
            'status' => ['open', 'in_progress', 'pending', 'resolved', 'closed'][array_rand(['open', 'in_progress', 'pending', 'resolved', 'closed'])],
            'priority' => ['low', 'medium', 'high', 'urgent'][array_rand(['low', 'medium', 'high', 'urgent'])],
            'created_by' => $admin->id,
        ]
    );
}
echo "Created 20 tickets\n";

echo "\n✅ Company simulation complete!\n";
echo "Admin login: admin@hls-test.de / password\n";
