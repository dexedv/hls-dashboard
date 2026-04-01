<?php

namespace App\Http\Controllers;

use App\Models\Customer;
use App\Models\Project;
use App\Models\Task;
use App\Models\Invoice;
use App\Models\Ticket;
use App\Models\Inventory;
use Illuminate\Http\Request;

class SearchController extends Controller
{
    public function search(Request $request)
    {
        $q = trim($request->get('q', ''));
        if (strlen($q) < 2) {
            return response()->json([]);
        }

        $results = [];
        $search = "%{$q}%";

        // Customers - select only needed columns
        Customer::where('name', 'ilike', $search)
            ->orWhere('company', 'ilike', $search)
            ->orWhere('email', 'ilike', $search)
            ->select('id', 'name', 'company', 'email')
            ->limit(5)->get()
            ->each(function ($c) use (&$results) {
                $results[] = [
                    'type' => 'Kunde',
                    'id' => $c->id,
                    'title' => $c->name,
                    'subtitle' => $c->company ?? $c->email ?? '',
                    'url' => route('customers.show', $c->id),
                ];
            });

        // Projects
        Project::where('name', 'ilike', $search)
            ->select('id', 'name', 'status')
            ->limit(5)->get()
            ->each(function ($p) use (&$results) {
                $results[] = [
                    'type' => 'Projekt',
                    'id' => $p->id,
                    'title' => $p->name,
                    'subtitle' => $p->status ?? '',
                    'url' => route('projects.show', $p->id),
                ];
            });

        // Tasks
        Task::where('title', 'ilike', $search)
            ->select('id', 'title', 'status')
            ->limit(5)->get()
            ->each(function ($t) use (&$results) {
                $results[] = [
                    'type' => 'Aufgabe',
                    'id' => $t->id,
                    'title' => $t->title,
                    'subtitle' => $t->status ?? '',
                    'url' => route('tasks.show', $t->id),
                ];
            });

        // Invoices
        Invoice::where('number', 'ilike', $search)
            ->select('id', 'number', 'status')
            ->limit(5)->get()
            ->each(function ($i) use (&$results) {
                $results[] = [
                    'type' => 'Rechnung',
                    'id' => $i->id,
                    'title' => $i->number,
                    'subtitle' => $i->status ?? '',
                    'url' => route('invoices.show', $i->id),
                ];
            });

        // Tickets
        Ticket::where('title', 'ilike', $search)
            ->select('id', 'title', 'status')
            ->limit(5)->get()
            ->each(function ($t) use (&$results) {
                $results[] = [
                    'type' => 'Ticket',
                    'id' => $t->id,
                    'title' => $t->title,
                    'subtitle' => $t->status ?? '',
                    'url' => route('tickets.show', $t->id),
                ];
            });

        // Inventory
        Inventory::where(function ($query) use ($search) {
                $query->where('name', 'ilike', $search)
                    ->orWhere('sku', 'ilike', $search)
                    ->orWhere('barcode', 'ilike', $search);
            })
            ->select('id', 'name', 'sku')
            ->limit(5)->get()
            ->each(function ($item) use (&$results) {
                $results[] = [
                    'type' => 'Inventar',
                    'id' => $item->id,
                    'title' => $item->name,
                    'subtitle' => $item->sku ?? '',
                    'url' => route('inventory.show', $item->id),
                ];
            });

        return response()->json($results);
    }
}
