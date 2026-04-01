<?php

namespace Database\Seeders;

use App\Models\Customer;
use App\Models\Expense;
use App\Models\Invoice;
use App\Models\Lead;
use App\Models\Note;
use App\Models\Project;
use App\Models\Quote;
use App\Models\Task;
use App\Models\Ticket;
use App\Models\TimeEntry;
use App\Models\User;
use App\Models\Setting;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;

class TestDataSeeder extends Seeder
{
    public function run(): void
    {
        $admin = User::where('role', 'owner')->first();
        $adminId = $admin?->id ?? 1;

        // ── 1. Labels ──────────────────────────────────────────────
        $labelColors = ['#ef4444','#f97316','#eab308','#22c55e','#3b82f6','#8b5cf6','#ec4899','#14b8a6'];
        $labelNames  = ['VIP','Neukunde','Stammkunde','Priorität','Intern','Extern','Support','Buchhaltung','Marketing','Technik'];
        $labelIds = [];
        foreach ($labelNames as $i => $name) {
            $slug = strtolower(str_replace(' ', '-', $name));
            DB::table('labels')->updateOrInsert(
                ['name' => $name],
                ['name' => $name, 'slug' => $slug, 'color' => $labelColors[$i % count($labelColors)], 'created_at' => now(), 'updated_at' => now()]
            );
            $row = DB::table('labels')->where('name', $name)->first();
            $labelIds[$name] = $row->id;
        }

        // ── 2. 30 Mitarbeiter ──────────────────────────────────────
        $roles = ['admin','manager','employee','employee','employee','viewer'];
        $employees = [
            ['name'=>'Anna Müller',     'role'=>'admin',    'email'=>'anna.mueller@hls-services.de'],
            ['name'=>'Ben Schmidt',     'role'=>'manager',  'email'=>'ben.schmidt@hls-services.de'],
            ['name'=>'Clara Weber',     'role'=>'manager',  'email'=>'clara.weber@hls-services.de'],
            ['name'=>'David Fischer',   'role'=>'employee', 'email'=>'david.fischer@hls-services.de'],
            ['name'=>'Eva Koch',        'role'=>'employee', 'email'=>'eva.koch@hls-services.de'],
            ['name'=>'Felix Wagner',    'role'=>'employee', 'email'=>'felix.wagner@hls-services.de'],
            ['name'=>'Gina Becker',     'role'=>'employee', 'email'=>'gina.becker@hls-services.de'],
            ['name'=>'Hans Schäfer',    'role'=>'employee', 'email'=>'hans.schaefer@hls-services.de'],
            ['name'=>'Iris Hoffmann',   'role'=>'employee', 'email'=>'iris.hoffmann@hls-services.de'],
            ['name'=>'Jonas Richter',   'role'=>'employee', 'email'=>'jonas.richter@hls-services.de'],
            ['name'=>'Karin Klein',     'role'=>'viewer',   'email'=>'karin.klein@hls-services.de'],
            ['name'=>'Lars Wolf',       'role'=>'employee', 'email'=>'lars.wolf@hls-services.de'],
            ['name'=>'Maria Braun',     'role'=>'employee', 'email'=>'maria.braun@hls-services.de'],
            ['name'=>'Nico Krause',     'role'=>'manager',  'email'=>'nico.krause@hls-services.de'],
            ['name'=>'Olivia Schulz',   'role'=>'employee', 'email'=>'olivia.schulz@hls-services.de'],
            ['name'=>'Peter Zimmermann','role'=>'employee', 'email'=>'peter.zimmermann@hls-services.de'],
            ['name'=>'Queenie Neumann', 'role'=>'employee', 'email'=>'queenie.neumann@hls-services.de'],
            ['name'=>'Ralf Schwarz',    'role'=>'employee', 'email'=>'ralf.schwarz@hls-services.de'],
            ['name'=>'Sandra Weiß',     'role'=>'employee', 'email'=>'sandra.weiss@hls-services.de'],
            ['name'=>'Tim Hartmann',    'role'=>'employee', 'email'=>'tim.hartmann@hls-services.de'],
            ['name'=>'Ute Lange',       'role'=>'viewer',   'email'=>'ute.lange@hls-services.de'],
            ['name'=>'Viktor Schmitt',  'role'=>'employee', 'email'=>'viktor.schmitt@hls-services.de'],
            ['name'=>'Wendy Bergmann',  'role'=>'employee', 'email'=>'wendy.bergmann@hls-services.de'],
            ['name'=>'Xaver Günther',   'role'=>'manager',  'email'=>'xaver.guenther@hls-services.de'],
            ['name'=>'Yvonne Kaiser',   'role'=>'employee', 'email'=>'yvonne.kaiser@hls-services.de'],
            ['name'=>'Zacharias Vogt',  'role'=>'employee', 'email'=>'zacharias.vogt@hls-services.de'],
            ['name'=>'Amelie Frank',    'role'=>'employee', 'email'=>'amelie.frank@hls-services.de'],
            ['name'=>'Björn Seidel',    'role'=>'employee', 'email'=>'bjoern.seidel@hls-services.de'],
            ['name'=>'Cora Arnold',     'role'=>'employee', 'email'=>'cora.arnold@hls-services.de'],
            ['name'=>'Dennis Kühn',     'role'=>'viewer',   'email'=>'dennis.kuehn@hls-services.de'],
        ];

        $userIds = [$adminId];
        $labelArr = array_values($labelIds);
        foreach ($employees as $i => $emp) {
            $user = User::firstOrCreate(
                ['email' => $emp['email']],
                [
                    'name'        => $emp['name'],
                    'password'    => Hash::make('Passwort123!'),
                    'role'        => $emp['role'],
                    'is_approved' => true,
                    'created_by'  => $adminId,
                ]
            );
            $userIds[] = $user->id;
            // 1-2 Labels pro Mitarbeiter zuweisen
            $assignLabels = array_slice($labelArr, $i % count($labelArr), 2);
            foreach ($assignLabels as $lid) {
                DB::table('user_labels')->updateOrInsert(
                    ['user_id' => $user->id, 'label_id' => $lid]
                );
            }
        }

        // ── 3. 15 Kunden ──────────────────────────────────────────
        $customers = [
            ['name'=>'Thomas Bauer',      'company'=>'Bauer GmbH',           'email'=>'t.bauer@bauer-gmbh.de',        'phone'=>'069-111001', 'industry'=>'Bau', 'category'=>'business'],
            ['name'=>'Sabine Richter',    'company'=>'Richter & Partner',     'email'=>'s.richter@richterpartner.de',  'phone'=>'069-111002', 'industry'=>'Recht', 'category'=>'business'],
            ['name'=>'Michael Schuster',  'company'=>'Schuster Elektro',      'email'=>'m.schuster@schuster-e.de',     'phone'=>'069-111003', 'industry'=>'Elektro', 'category'=>'business'],
            ['name'=>'Petra Hahn',        'company'=>'Hahn Logistik',         'email'=>'p.hahn@hahn-logistik.de',      'phone'=>'069-111004', 'industry'=>'Logistik', 'category'=>'business'],
            ['name'=>'Stefan Meier',      'company'=>'Meier IT Solutions',    'email'=>'s.meier@meier-it.de',          'phone'=>'069-111005', 'industry'=>'IT', 'category'=>'business'],
            ['name'=>'Julia Keller',      'company'=>'Keller Marketing',      'email'=>'j.keller@keller-marketing.de', 'phone'=>'069-111006', 'industry'=>'Marketing', 'category'=>'business'],
            ['name'=>'Andreas Brandt',    'company'=>'Brandt Consulting',     'email'=>'a.brandt@brandt-consult.de',   'phone'=>'069-111007', 'industry'=>'Beratung', 'category'=>'business'],
            ['name'=>'Monika Steiner',    'company'=>'Steiner Architekten',   'email'=>'m.steiner@steiner-arch.de',    'phone'=>'069-111008', 'industry'=>'Architektur', 'category'=>'business'],
            ['name'=>'Robert Lehmann',    'company'=>'Lehmann Druck',         'email'=>'r.lehmann@lehmann-druck.de',   'phone'=>'069-111009', 'industry'=>'Druck', 'category'=>'business'],
            ['name'=>'Christine Ziegler', 'company'=>'Ziegler Immobilien',    'email'=>'c.ziegler@ziegler-immo.de',   'phone'=>'069-111010', 'industry'=>'Immobilien', 'category'=>'business'],
            ['name'=>'Klaus Hoffmann',    'company'=>'',                      'email'=>'k.hoffmann@gmail.com',         'phone'=>'0171-200001', 'industry'=>'', 'category'=>'private'],
            ['name'=>'Heike Böhm',        'company'=>'Böhm Catering',         'email'=>'h.boehm@boehm-catering.de',   'phone'=>'069-111011', 'industry'=>'Gastronomie', 'category'=>'business'],
            ['name'=>'Frank Berger',      'company'=>'Berger Werkzeug',       'email'=>'f.berger@berger-werkzeug.de', 'phone'=>'069-111012', 'industry'=>'Werkzeug', 'category'=>'business'],
            ['name'=>'Nicole Kremer',     'company'=>'Kremer Pharma',         'email'=>'n.kremer@kremer-pharma.de',   'phone'=>'069-111013', 'industry'=>'Pharma', 'category'=>'business'],
            ['name'=>'Dirk Pohl',         'company'=>'',                      'email'=>'d.pohl@outlook.de',            'phone'=>'0172-300001', 'industry'=>'', 'category'=>'private'],
        ];

        $customerIds = [];
        foreach ($customers as $i => $c) {
            $customer = Customer::create([
                'name'       => $c['name'],
                'company'    => $c['company'],
                'email'      => $c['email'],
                'phone'      => $c['phone'],
                'address'    => 'Musterstraße ' . ($i + 1),
                'industry'   => $c['industry'],
                'category'   => $c['category'],
                'created_by' => $adminId,
            ]);
            $customerIds[] = $customer->id;
        }

        // ── 4. 8 Projekte ─────────────────────────────────────────
        $projects = [
            ['name'=>'Website-Relaunch Bauer GmbH',    'status'=>'active',    'priority'=>'high',   'budget'=>15000, 'customer_idx'=>0],
            ['name'=>'ERP-Einführung Meier IT',         'status'=>'active',    'priority'=>'high',   'budget'=>45000, 'customer_idx'=>4],
            ['name'=>'Marketingkampagne Q2',            'status'=>'active',    'priority'=>'medium', 'budget'=>8000,  'customer_idx'=>5],
            ['name'=>'Lageroptimierung Hahn Logistik',  'status'=>'planning',  'priority'=>'medium', 'budget'=>22000, 'customer_idx'=>3],
            ['name'=>'Sicherheitsaudit Kremer Pharma',  'status'=>'active',    'priority'=>'urgent', 'budget'=>12000, 'customer_idx'=>13],
            ['name'=>'Büro-Umbau Steiner Architekten',  'status'=>'completed', 'priority'=>'low',    'budget'=>35000, 'customer_idx'=>7],
            ['name'=>'App-Entwicklung intern',          'status'=>'active',    'priority'=>'high',   'budget'=>60000, 'customer_idx'=>null],
            ['name'=>'Schulungsprogramm 2026',          'status'=>'planning',  'priority'=>'medium', 'budget'=>5000,  'customer_idx'=>null],
        ];

        $projectIds = [];
        foreach ($projects as $p) {
            $project = Project::create([
                'name'        => $p['name'],
                'status'      => $p['status'],
                'priority'    => $p['priority'],
                'budget'      => $p['budget'],
                'progress'    => $p['status'] === 'completed' ? 100 : rand(10, 80),
                'start_date'  => now()->subDays(rand(10, 60))->toDateString(),
                'end_date'    => now()->addDays(rand(10, 90))->toDateString(),
                'customer_id' => $p['customer_idx'] !== null ? $customerIds[$p['customer_idx']] : null,
                'created_by'  => $adminId,
            ]);
            $projectIds[] = $project->id;

            // Mitarbeiter zuweisen
            $assignees = array_slice($userIds, rand(1, 5), rand(2, 5));
            foreach (array_unique($assignees) as $uid) {
                DB::table('project_user')->insertOrIgnore(['project_id' => $project->id, 'user_id' => $uid]);
            }
        }

        // ── 5. 25 Aufgaben ────────────────────────────────────────
        $taskTitles = [
            'Anforderungsanalyse durchführen', 'Designentwurf erstellen', 'Frontend entwickeln',
            'Backend-API implementieren', 'Datenbankschema entwerfen', 'Tests schreiben',
            'Code-Review durchführen', 'Deployment vorbereiten', 'Dokumentation aktualisieren',
            'Kundenpräsentation vorbereiten', 'Angebot erstellen', 'Rechnung ausstellen',
            'Meeting-Protokoll schreiben', 'Support-Anfrage bearbeiten', 'Bug-Fixing Sprint',
            'Performance-Optimierung', 'Security-Patch einspielen', 'Newsletter vorbereiten',
            'Social Media Planung', 'Monatsreport erstellen', 'Lagerbestand prüfen',
            'Lieferanten kontaktieren', 'Mitarbeitergespräch vorbereiten', 'Onboarding-Plan erstellen',
            'Schulungsunterlagen überarbeiten',
        ];
        $taskStatuses = ['todo', 'in_progress', 'done', 'todo', 'in_progress'];

        foreach ($taskTitles as $i => $title) {
            Task::create([
                'title'       => $title,
                'description' => 'Aufgabe: ' . $title . '. Bitte zeitnah bearbeiten.',
                'status'      => $taskStatuses[$i % count($taskStatuses)],
                'priority'    => ['low','medium','high','urgent'][$i % 4],
                'due_date'    => now()->addDays(rand(1, 30))->toDateString(),
                'project_id'  => $projectIds[$i % count($projectIds)],
                'assigned_to' => $userIds[($i + 1) % count($userIds)],
                'created_by'  => $adminId,
            ]);
        }

        // ── 6. 10 Leads ──────────────────────────────────────────
        $leads = [
            ['name'=>'Max Müller',     'company'=>'Müller Tech',    'value'=>8500,  'status'=>'new',        'source'=>'website'],
            ['name'=>'Lisa Braun',     'company'=>'Braun Design',   'value'=>3200,  'status'=>'contacted',  'source'=>'referral'],
            ['name'=>'Kai Schneider',  'company'=>'Schneider GmbH', 'value'=>22000, 'status'=>'qualified',  'source'=>'email'],
            ['name'=>'Sina Vogel',     'company'=>'Vogel AG',       'value'=>15000, 'status'=>'proposal',   'source'=>'phone'],
            ['name'=>'Jan Fuchs',      'company'=>'Fuchs & Co.',    'value'=>6700,  'status'=>'proposal',   'source'=>'linkedin'],
            ['name'=>'Petra Engel',    'company'=>'Engel Handels',  'value'=>4100,  'status'=>'new',        'source'=>'website'],
            ['name'=>'Lukas Stein',    'company'=>'Stein Bau',      'value'=>31000, 'status'=>'won',        'source'=>'referral'],
            ['name'=>'Hanna Roth',     'company'=>'Roth Media',     'value'=>9800,  'status'=>'lost',       'source'=>'email'],
            ['name'=>'Georg Kraft',    'company'=>'Kraft Systeme',  'value'=>18500, 'status'=>'qualified',  'source'=>'phone'],
            ['name'=>'Sarah Berg',     'company'=>'Berg Solutions', 'value'=>7300,  'status'=>'contacted',  'source'=>'website'],
        ];

        foreach ($leads as $l) {
            Lead::create([
                'name'       => $l['name'],
                'company'    => $l['company'],
                'email'      => strtolower(str_replace(' ', '.', $l['name'])) . '@example.de',
                'phone'      => '0170-' . rand(1000000, 9999999),
                'value'      => $l['value'],
                'status'     => $l['status'],
                'source'     => $l['source'],
                'created_by' => $adminId,
            ]);
        }

        // ── 7. 6 Angebote ────────────────────────────────────────
        $taxRate = (float) Setting::get('tax_rate', 19);
        $quoteItems = [
            [['Webdesign Konzept', 1, 2500], ['HTML/CSS Entwicklung', 40, 85], ['SEO-Optimierung', 1, 800]],
            [['ERP-Beratung', 20, 150], ['Systemkonfiguration', 1, 3500], ['Schulung Mitarbeiter', 8, 120]],
            [['Google Ads Kampagne', 1, 1200], ['Content-Erstellung', 10, 90], ['Social Media Management', 3, 400]],
            [['IT-Sicherheitsaudit', 1, 4500], ['Penetrationstest', 1, 2800], ['Abschlussbericht', 1, 600]],
            [['Lagersoftware Lizenz', 5, 299], ['Installation & Setup', 1, 800], ['Support 1 Jahr', 1, 1200]],
            [['Logo-Design', 1, 950], ['Visitenkarten', 500, 0.45], ['Briefpapier-Layout', 1, 350]],
        ];

        $quoteStatuses = ['draft', 'sent', 'accepted', 'declined', 'sent', 'accepted'];
        $year   = now()->format('Y');
        $month  = now()->format('m');

        $lastQuoteNum = Quote::where('number', 'like', "AG-{$year}-{$month}-%")
            ->orderByRaw("CAST(SUBSTRING(number FROM 'AG-\\d{4}-\\d{2}-(\\d+)') AS INTEGER) DESC NULLS LAST")
            ->value('number');
        $quoteOffset = $lastQuoteNum && preg_match('/AG-\d{4}-\d{2}-(\d+)/', $lastQuoteNum, $m) ? (int)$m[1] + 1 : 1;
        foreach ($quoteItems as $qi => $items) {
            $subtotal = 0;
            $lineItems = [];
            foreach ($items as $item) {
                $total = $item[1] * $item[2];
                $subtotal += $total;
                $lineItems[] = ['description' => $item[0], 'quantity' => $item[1], 'unit_price' => $item[2], 'total' => $total];
            }
            $tax   = $subtotal * ($taxRate / 100);
            $total = $subtotal + $tax;

            $quote = Quote::create([
                'number'      => "AG-{$year}-{$month}-" . str_pad($quoteOffset + $qi, 4, '0', STR_PAD_LEFT),
                'customer_id' => $customerIds[$qi % count($customerIds)],
                'project_id'  => $projectIds[$qi % count($projectIds)],
                'status'      => $quoteStatuses[$qi],
                'valid_until' => now()->addDays(30)->toDateString(),
                'subtotal'    => $subtotal,
                'tax'         => $tax,
                'total'       => $total,
                'notes'       => 'Angebot gültig für 30 Tage. Preise zzgl. MwSt.',
                'created_by'  => $adminId,
                'archived_at' => in_array($quoteStatuses[$qi], ['accepted','declined']) ? now() : null,
            ]);
            foreach ($lineItems as $li) {
                $quote->items()->create($li);
            }
        }

        // ── 8. 8 Rechnungen ─────────────────────────────────────
        $invoiceItems = [
            [['Webentwicklung März', 1, 8500]],
            [['IT-Beratung', 15, 150], ['Reisekosten', 1, 280]],
            [['Marketingpaket Q1', 1, 3600]],
            [['Softwarelizenz Annual', 3, 599]],
            [['Projektmanagement', 20, 120], ['Dokumentation', 5, 80]],
            [['Support-Paket Basis', 1, 990]],
            [['Grafikdesign', 1, 1850]],
            [['Schulung intern', 8, 95]],
        ];

        $invoiceStatuses = ['paid', 'sent', 'paid', 'overdue', 'draft', 'sent', 'paid', 'draft'];

        $lastInvoiceNum = Invoice::where('number', 'like', "RE-{$year}-{$month}-%")
            ->orderByRaw("CAST(SUBSTRING(number FROM 'RE-\\d{4}-\\d{2}-(\\d+)') AS INTEGER) DESC NULLS LAST")
            ->value('number');
        $invoiceOffset = $lastInvoiceNum && preg_match('/RE-\d{4}-\d{2}-(\d+)/', $lastInvoiceNum, $m) ? (int)$m[1] + 1 : 1;
        foreach ($invoiceItems as $ii => $items) {
            $subtotal = 0;
            $lineItems = [];
            foreach ($items as $item) {
                $total = $item[1] * $item[2];
                $subtotal += $total;
                $lineItems[] = ['description' => $item[0], 'quantity' => $item[1], 'unit_price' => $item[2], 'total' => $total];
            }
            $tax    = $subtotal * ($taxRate / 100);
            $total  = $subtotal + $tax;
            $status = $invoiceStatuses[$ii];

            $invoice = Invoice::create([
                'number'      => "RE-{$year}-{$month}-" . str_pad($invoiceOffset + $ii, 4, '0', STR_PAD_LEFT),
                'customer_id' => $customerIds[$ii % count($customerIds)],
                'project_id'  => $projectIds[$ii % count($projectIds)],
                'status'      => $status,
                'issue_date'  => now()->subDays(rand(5, 30))->toDateString(),
                'due_date'    => now()->addDays($status === 'overdue' ? -5 : 14)->toDateString(),
                'subtotal'    => $subtotal,
                'tax'         => $tax,
                'total'       => $total,
                'notes'       => 'Zahlbar innerhalb von 14 Tagen ohne Abzug.',
                'created_by'  => $adminId,
                'paid_at'     => $status === 'paid' ? now()->subDays(rand(1, 10)) : null,
                'sent_at'     => in_array($status, ['paid','sent','overdue']) ? now()->subDays(rand(3, 20)) : null,
                'archived_at' => in_array($status, ['paid','cancelled']) ? now() : null,
            ]);
            foreach ($lineItems as $li) {
                $invoice->items()->create($li);
            }
        }

        // ── 9. Zeiterfassung ─────────────────────────────────────
        $timeDescriptions = [
            'Frontend-Entwicklung', 'Backend-Implementierung', 'Kundengespräch', 'Debugging',
            'Code-Review', 'Dokumentation', 'Meeting', 'Testing', 'Deployment', 'Planung',
        ];

        foreach (range(1, 30) as $t) {
            $uid = $userIds[$t % count($userIds)];
            $pid = $projectIds[$t % count($projectIds)];
            $startHour = rand(7, 15);
            $duration  = rand(1, 5) * 60; // in minutes
            $date      = now()->subDays(rand(0, 14));
            TimeEntry::create([
                'user_id'     => $uid,
                'project_id'  => $pid,
                'description' => $timeDescriptions[$t % count($timeDescriptions)],
                'start_time'  => $date->copy()->setHour($startHour)->setMinute(0),
                'end_time'    => $date->copy()->setHour($startHour)->setMinute(0)->addMinutes($duration),
                'duration'    => $duration,
                'billable'    => $t % 3 !== 0,
            ]);
        }

        // ── 10. 8 Tickets ────────────────────────────────────────
        $tickets = [
            ['title'=>'Login funktioniert nicht',         'status'=>'open',        'priority'=>'high'],
            ['title'=>'PDF-Download schlägt fehl',        'status'=>'in_progress', 'priority'=>'medium'],
            ['title'=>'Dashboard lädt sehr langsam',      'status'=>'open',        'priority'=>'medium'],
            ['title'=>'E-Mail-Versand Fehler',            'status'=>'resolved',    'priority'=>'high'],
            ['title'=>'Falsche MwSt. in Rechnung',        'status'=>'open',        'priority'=>'urgent'],
            ['title'=>'Benutzer kann sich nicht anmelden','status'=>'closed',      'priority'=>'high'],
            ['title'=>'Exportfunktion fehlt',             'status'=>'open',        'priority'=>'low'],
            ['title'=>'Passwort-Reset E-Mail kommt nicht','status'=>'in_progress', 'priority'=>'medium'],
        ];

        foreach ($tickets as $i => $t) {
            Ticket::create([
                'title'       => $t['title'],
                'description' => 'Detailbeschreibung: ' . $t['title'] . '. Bitte umgehend prüfen.',
                'status'      => $t['status'],
                'priority'    => $t['priority'],
                'customer_id' => $customerIds[$i % count($customerIds)],
                'assigned_to' => $userIds[($i + 1) % count($userIds)],
                'created_by'  => $adminId,
            ]);
        }

        // ── 11. 6 Notizen ────────────────────────────────────────
        $noteContents = [
            'Kundengespräch mit Bauer GmbH: Website-Relaunch bis Ende April geplant. Budget freigegeben.',
            'Internes Meeting: Sprint-Planung für App-Entwicklung. Story Points vergeben.',
            'Anruf von Meier IT: Zusatzleistungen gewünscht. Angebot bis Freitag einreichen.',
            'Lieferanten-Verhandlung: Neue Konditionen ab Mai. 3% Rabatt vereinbart.',
            'Team-Jour fixe: Urlaubsplanung Q2 besprochen. Engpässe im Juni identifiziert.',
            'Buchhaltung: Offene Posten prüfen. 3 Rechnungen überfällig.',
        ];

        foreach ($noteContents as $i => $content) {
            Note::create([
                'title'      => 'Notiz ' . ($i + 1) . ' - ' . now()->subDays($i * 2)->format('d.m.Y'),
                'content'    => $content,
                'user_id'    => $userIds[$i % count($userIds)],
                'created_by' => $adminId,
            ]);
        }

        // ── 12. 6 Spesen ─────────────────────────────────────────
        $expenseData = [
            ['desc'=>'Flug Frankfurt-Berlin', 'amount'=>289.90, 'cat'=>'Reise'],
            ['desc'=>'Hotelübernachtung München', 'amount'=>142.00, 'cat'=>'Reise'],
            ['desc'=>'Fachliteratur Laravel', 'amount'=>49.99, 'cat'=>'Büromaterial'],
            ['desc'=>'Kundenessen Bauer GmbH', 'amount'=>187.50, 'cat'=>'Bewirtung'],
            ['desc'=>'Softwarelizenz Adobe', 'amount'=>599.00, 'cat'=>'Software'],
            ['desc'=>'Bürobedarf Papier/Stifte', 'amount'=>34.80, 'cat'=>'Büromaterial'],
        ];

        foreach ($expenseData as $i => $e) {
            Expense::create([
                'description' => $e['desc'],
                'amount'      => $e['amount'],
                'category'    => $e['cat'],
                'date'        => now()->subDays(rand(0, 30))->toDateString(),
                'status'      => ['pending','approved','rejected'][$i % 3],
                'user_id'     => $userIds[($i + 1) % count($userIds)],
                'created_by'  => $adminId,
            ]);
        }

        $this->command->info('✅ TestDataSeeder abgeschlossen:');
        $this->command->info('   - 30 Mitarbeiter (admin, manager, employee, viewer)');
        $this->command->info('   - 15 Kunden mit Labels');
        $this->command->info('   - 8 Projekte mit Teammitgliedern');
        $this->command->info('   - 25 Aufgaben');
        $this->command->info('   - 10 Leads');
        $this->command->info('   - 6 Angebote');
        $this->command->info('   - 8 Rechnungen');
        $this->command->info('   - 30 Zeiterfassungs-Einträge');
        $this->command->info('   - 8 Tickets');
        $this->command->info('   - 6 Notizen');
        $this->command->info('   - 6 Spesen');
    }
}
