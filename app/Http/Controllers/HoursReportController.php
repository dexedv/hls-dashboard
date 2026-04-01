<?php

namespace App\Http\Controllers;

use App\Models\TimeEntry;
use App\Models\User;
use App\Models\Project;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;

class HoursReportController extends Controller
{
    public function index(Request $request)
    {
        $from = $request->from ?? now()->startOfMonth()->toDateString();
        $to = $request->to ?? now()->endOfMonth()->toDateString();
        $userId = $request->user_id;
        $projectId = $request->project_id;

        $query = TimeEntry::with(['user', 'project', 'task'])
            ->whereBetween(DB::raw('DATE(start_time)'), [$from, $to]);

        if ($userId) {
            $query->where('user_id', $userId);
        }

        if ($projectId) {
            $query->where('project_id', $projectId);
        }

        $entries = $query->orderBy('start_time', 'desc')->get();

        // Aggregate by user
        $byUser = $entries->groupBy('user_id')->map(function ($userEntries) {
            $user = $userEntries->first()->user;
            return [
                'user' => $user ? ['id' => $user->id, 'name' => $user->name] : null,
                'total_minutes' => $userEntries->sum('duration'),
                'billable_minutes' => $userEntries->where('billable', true)->sum('duration'),
                'entries_count' => $userEntries->count(),
            ];
        })->values();

        // Aggregate by project
        $byProject = $entries->groupBy('project_id')->map(function ($projectEntries) {
            $project = $projectEntries->first()->project;
            return [
                'project' => $project ? ['id' => $project->id, 'name' => $project->name] : ['id' => null, 'name' => 'Kein Projekt'],
                'total_minutes' => $projectEntries->sum('duration'),
                'billable_minutes' => $projectEntries->where('billable', true)->sum('duration'),
                'entries_count' => $projectEntries->count(),
            ];
        })->values();

        $users = User::orderBy('name')->get(['id', 'name']);
        $projects = Project::orderBy('name')->get(['id', 'name']);

        return Inertia::render('HoursReport/Index', [
            'entries' => $entries,
            'byUser' => $byUser,
            'byProject' => $byProject,
            'users' => $users,
            'projects' => $projects,
            'filters' => (object) compact('from', 'to', 'userId', 'projectId'),
            'totalMinutes' => $entries->sum('duration'),
            'billableMinutes' => $entries->where('billable', true)->sum('duration'),
        ]);
    }
}
