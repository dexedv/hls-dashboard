<?php

namespace App\Http\Controllers;

use App\Models\LeaveRequest;
use App\Models\User;
use App\Helpers\StatusHelper;
use App\Services\NotificationService;
use Illuminate\Http\Request;
use Inertia\Inertia;

class LeaveRequestController extends Controller
{
    /**
     * Display a listing of leave requests.
     */
    public function index(Request $request)
    {
        $query = LeaveRequest::query()->with(['user', 'approver']);

        // Filter by status
        if ($request->status) {
            $query->where('status', $request->status);
        }

        $leaveRequests = $query->orderBy('created_at', 'desc')
            ->paginate(10)
            ->withQueryString();

        $users = User::orderBy('name')->get(['id', 'name']);

        return Inertia::render('Vacation/Index', [
            'leaveRequests' => $leaveRequests,
            'users' => $users,
            'filters' => $request->only(['status']),
            'statuses' => StatusHelper::vacationStatuses(),
        ]);
    }

    /**
     * Show the form for creating a new leave request.
     */
    public function create()
    {
        return Inertia::render('Vacation/Create');
    }

    /**
     * Store a newly created leave request.
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'type' => 'required|in:vacation,sick,other',
            'start_date' => 'required|date',
            'end_date' => 'required|date|after_or_equal:start_date',
            'notes' => 'nullable|string',
        ]);

        $validated['user_id'] = auth()->id();

        // Calculate days
        $start = \Carbon\Carbon::parse($validated['start_date']);
        $end = \Carbon\Carbon::parse($validated['end_date']);
        $validated['days'] = $end->diffInDays($start) + 1;

        LeaveRequest::create($validated);

        return redirect()->route('vacation.index')
            ->with('success', 'Urlaubsantrag erfolgreich erstellt.');
    }

    /**
     * Display the specified leave request.
     */
    public function show(LeaveRequest $leaveRequest)
    {
        $leaveRequest->load(['user', 'approver']);

        return Inertia::render('Vacation/Show', [
            'leaveRequest' => $leaveRequest,
        ]);
    }

    /**
     * Show the form for editing the specified leave request.
     */
    public function edit(LeaveRequest $leaveRequest)
    {
        return Inertia::render('Vacation/Edit', [
            'leaveRequest' => $leaveRequest,
        ]);
    }

    /**
     * Update the specified leave request.
     */
    public function update(Request $request, LeaveRequest $leaveRequest)
    {
        $validated = $request->validate([
            'type' => 'required|in:vacation,sick,other',
            'start_date' => 'required|date',
            'end_date' => 'required|date|after_or_equal:start_date',
            'notes' => 'nullable|string',
        ]);

        // Recalculate days
        $start = \Carbon\Carbon::parse($validated['start_date']);
        $end = \Carbon\Carbon::parse($validated['end_date']);
        $validated['days'] = $end->diffInDays($start) + 1;

        $leaveRequest->update($validated);

        return redirect()->route('vacation.index')
            ->with('success', 'Urlaubsantrag erfolgreich aktualisiert.');
    }

    /**
     * Approve the leave request.
     */
    public function approve(LeaveRequest $leaveRequest)
    {
        $leaveRequest->update([
            'status' => 'approved',
            'approved_by' => auth()->id(),
            'approved_at' => now(),
        ]);

        NotificationService::notifyUser(
            $leaveRequest->user_id,
            'Urlaubsantrag genehmigt',
            'Ihr Urlaubsantrag wurde genehmigt.',
            'success',
            route('vacation.show', $leaveRequest->id)
        );

        return redirect()->back()
            ->with('success', 'Urlaubsantrag genehmigt.');
    }

    /**
     * Reject the leave request.
     */
    public function reject(Request $request, LeaveRequest $leaveRequest)
    {
        $validated = $request->validate([
            'rejection_reason' => 'required|string',
        ]);

        $leaveRequest->update([
            'status' => 'rejected',
            'approved_by' => auth()->id(),
            'approved_at' => now(),
            'rejection_reason' => $validated['rejection_reason'],
        ]);

        NotificationService::notifyUser(
            $leaveRequest->user_id,
            'Urlaubsantrag abgelehnt',
            'Ihr Urlaubsantrag wurde leider abgelehnt.',
            'warning',
            route('vacation.show', $leaveRequest->id)
        );

        return redirect()->back()
            ->with('success', 'Urlaubsantrag abgelehnt.');
    }

    /**
     * Remove the specified leave request.
     */
    public function destroy(LeaveRequest $leaveRequest)
    {
        $leaveRequest->delete();

        return redirect()->route('vacation.index')
            ->with('success', 'Urlaubsantrag erfolgreich gelöscht.');
    }
}
