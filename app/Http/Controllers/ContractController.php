<?php

namespace App\Http\Controllers;

use App\Models\Contract;
use App\Models\Customer;
use App\Models\Project;
use Illuminate\Http\Request;
use Inertia\Inertia;

class ContractController extends Controller
{
    public function index(Request $request)
    {
        $query = Contract::with(['customer', 'creator']);

        if ($request->search) {
            $query->where(function ($q) use ($request) {
                $q->where('title', 'ilike', "%{$request->search}%")
                  ->orWhere('number', 'ilike', "%{$request->search}%");
            });
        }

        if ($request->status) {
            $query->where('status', $request->status);
        }

        if ($request->type) {
            $query->where('type', $request->type);
        }

        $contracts = $query->orderBy('created_at', 'desc')->paginate(15)->withQueryString();

        $expiringCount = Contract::where('status', 'active')
            ->where('end_date', '<=', now()->addDays(30))
            ->where('end_date', '>=', now())
            ->count();

        return Inertia::render('Contracts/Index', [
            'contracts' => $contracts,
            'filters' => (object) $request->only(['search', 'status', 'type']),
            'expiringCount' => $expiringCount,
        ]);
    }

    public function create()
    {
        $customers = Customer::orderBy('name')->get(['id', 'name']);
        $projects = Project::orderBy('name')->get(['id', 'name']);
        return Inertia::render('Contracts/Create', [
            'customers' => $customers,
            'projects' => $projects,
        ]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'title' => 'required|string|max:255',
            'number' => 'nullable|string|unique:contracts,number',
            'description' => 'nullable|string',
            'status' => 'nullable|in:draft,active,expired,terminated',
            'type' => 'nullable|in:service,nda,purchase,rental,other',
            'start_date' => 'nullable|date',
            'end_date' => 'nullable|date|after_or_equal:start_date',
            'value' => 'nullable|numeric|min:0',
            'currency' => 'nullable|string|max:3',
            'notes' => 'nullable|string',
            'customer_id' => 'nullable|exists:customers,id',
            'project_id' => 'nullable|exists:projects,id',
        ]);

        if (empty($validated['number'])) {
            $year = now()->format('Y');
            $last = Contract::where('number', 'like', "VT-{$year}-%")->count();
            $validated['number'] = "VT-{$year}-" . str_pad($last + 1, 4, '0', STR_PAD_LEFT);
        }

        $validated['created_by'] = auth()->id();
        $validated['status'] = $validated['status'] ?? 'draft';
        $validated['currency'] = $validated['currency'] ?? 'EUR';

        $contract = Contract::create($validated);

        return redirect()->route('contracts.show', $contract->id)->with('success', 'Vertrag erstellt.');
    }

    public function show(Contract $contract)
    {
        $contract->load(['customer', 'project', 'creator', 'attachments.uploader']);
        return Inertia::render('Contracts/Show', ['contract' => $contract]);
    }

    public function edit(Contract $contract)
    {
        $customers = Customer::orderBy('name')->get(['id', 'name']);
        $projects = Project::orderBy('name')->get(['id', 'name']);
        return Inertia::render('Contracts/Edit', [
            'contract' => $contract,
            'customers' => $customers,
            'projects' => $projects,
        ]);
    }

    public function update(Request $request, Contract $contract)
    {
        $validated = $request->validate([
            'title' => 'required|string|max:255',
            'number' => 'nullable|string|unique:contracts,number,' . $contract->id,
            'description' => 'nullable|string',
            'status' => 'nullable|in:draft,active,expired,terminated',
            'type' => 'nullable|in:service,nda,purchase,rental,other',
            'start_date' => 'nullable|date',
            'end_date' => 'nullable|date',
            'value' => 'nullable|numeric|min:0',
            'currency' => 'nullable|string|max:3',
            'notes' => 'nullable|string',
            'customer_id' => 'nullable|exists:customers,id',
            'project_id' => 'nullable|exists:projects,id',
        ]);

        $contract->update($validated);

        return redirect()->route('contracts.show', $contract->id)->with('success', 'Vertrag aktualisiert.');
    }

    public function destroy(Contract $contract)
    {
        $contract->delete();
        return redirect()->route('contracts.index')->with('success', 'Vertrag gelöscht.');
    }
}
