<?php

namespace App\Http\Controllers;

use App\Models\Expense;
use App\Models\Customer;
use App\Models\Project;
use Illuminate\Http\Request;
use Inertia\Inertia;

class ExpenseController extends Controller
{
    public function index(Request $request)
    {
        $query = Expense::with(['creator', 'project', 'customer']);

        if ($request->search) {
            $query->where(function ($q) use ($request) {
                $q->where('title', 'ilike', "%{$request->search}%")
                  ->orWhere('category', 'ilike', "%{$request->search}%");
            });
        }

        if ($request->status) {
            $query->where('status', $request->status);
        }

        if ($request->category) {
            $query->where('category', $request->category);
        }

        $sort = $request->sort ?? 'date_desc';
        match ($sort) {
            'amount_desc' => $query->orderBy('amount', 'desc'),
            'amount_asc' => $query->orderBy('amount', 'asc'),
            'date_asc' => $query->orderBy('expense_date', 'asc'),
            default => $query->orderBy('expense_date', 'desc'),
        };

        $expenses = $query->paginate(15)->withQueryString();
        $categories = Expense::distinct()->whereNotNull('category')->pluck('category')->sort()->values();
        $customers = Customer::orderBy('name')->get(['id', 'name']);
        $projects = Project::orderBy('name')->get(['id', 'name']);

        $totalPending = Expense::where('status', 'pending')->sum('amount');
        $totalApproved = Expense::where('status', 'approved')->sum('amount');

        return Inertia::render('Expenses/Index', [
            'expenses' => $expenses,
            'categories' => $categories,
            'customers' => $customers,
            'projects' => $projects,
            'filters' => (object) $request->only(['search', 'status', 'category', 'sort']),
            'totalPending' => $totalPending,
            'totalApproved' => $totalApproved,
        ]);
    }

    public function create()
    {
        $customers = Customer::orderBy('name')->get(['id', 'name']);
        $projects = Project::orderBy('name')->get(['id', 'name']);
        $categories = Expense::distinct()->whereNotNull('category')->pluck('category')->sort()->values();

        return Inertia::render('Expenses/Create', [
            'customers' => $customers,
            'projects' => $projects,
            'categories' => $categories,
        ]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'title' => 'required|string|max:255',
            'description' => 'nullable|string',
            'category' => 'nullable|string|max:100',
            'amount' => 'required|numeric|min:0',
            'currency' => 'nullable|string|max:3',
            'expense_date' => 'required|date',
            'status' => 'nullable|in:pending,approved,rejected,reimbursed',
            'project_id' => 'nullable|exists:projects,id',
            'customer_id' => 'nullable|exists:customers,id',
        ]);

        $validated['created_by'] = auth()->id();
        $validated['status'] = $validated['status'] ?? 'pending';
        $validated['currency'] = $validated['currency'] ?? 'EUR';

        Expense::create($validated);

        return redirect()->route('expenses.index')->with('success', 'Ausgabe erfolgreich erfasst.');
    }

    public function show(Expense $expense)
    {
        $expense->load(['creator', 'approver', 'project', 'customer']);
        return Inertia::render('Expenses/Show', ['expense' => $expense]);
    }

    public function edit(Expense $expense)
    {
        $customers = Customer::orderBy('name')->get(['id', 'name']);
        $projects = Project::orderBy('name')->get(['id', 'name']);
        $categories = Expense::distinct()->whereNotNull('category')->pluck('category')->sort()->values();

        return Inertia::render('Expenses/Edit', [
            'expense' => $expense,
            'customers' => $customers,
            'projects' => $projects,
            'categories' => $categories,
        ]);
    }

    public function update(Request $request, Expense $expense)
    {
        $validated = $request->validate([
            'title' => 'required|string|max:255',
            'description' => 'nullable|string',
            'category' => 'nullable|string|max:100',
            'amount' => 'required|numeric|min:0',
            'currency' => 'nullable|string|max:3',
            'expense_date' => 'required|date',
            'status' => 'nullable|in:pending,approved,rejected,reimbursed',
            'project_id' => 'nullable|exists:projects,id',
            'customer_id' => 'nullable|exists:customers,id',
        ]);

        $expense->update($validated);

        return redirect()->route('expenses.show', $expense->id)->with('success', 'Ausgabe aktualisiert.');
    }

    public function approve(Expense $expense)
    {
        $expense->update([
            'status' => 'approved',
            'approved_by' => auth()->id(),
            'approved_at' => now(),
        ]);

        return redirect()->back()->with('success', 'Ausgabe genehmigt.');
    }

    public function reject(Expense $expense)
    {
        $expense->update(['status' => 'rejected']);
        return redirect()->back()->with('success', 'Ausgabe abgelehnt.');
    }

    public function destroy(Expense $expense)
    {
        $expense->delete();
        return redirect()->route('expenses.index')->with('success', 'Ausgabe gelöscht.');
    }
}
