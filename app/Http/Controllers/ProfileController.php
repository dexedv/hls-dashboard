<?php

namespace App\Http\Controllers;

use App\Http\Requests\ProfileUpdateRequest;
use App\Models\Event;
use Illuminate\Contracts\Auth\MustVerifyEmail;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Redirect;
use Inertia\Inertia;
use Inertia\Response;

class ProfileController extends Controller
{
    /**
     * Display the user's profile form.
     */
    public function edit(Request $request): Response
    {
        $user = $request->user();

        $myEvents = Event::with(['project', 'customer', 'assignees'])
            ->whereHas('assignees', fn($q) => $q->where('users.id', $user->id))
            ->where('start', '>=', now())
            ->orderBy('start', 'asc')
            ->limit(10)
            ->get()
            ->map(fn($e) => [
                'id'            => $e->id,
                'title'         => $e->title,
                'event_type'    => $e->event_type,
                'start'         => $e->start?->toISOString(),
                'end'           => $e->end?->toISOString(),
                'all_day'       => $e->all_day,
                'project_name'  => $e->project?->name,
                'customer_name' => $e->customer?->name,
                'tags'          => $e->tags ?? [],
                'assignees'     => $e->assignees->map(fn($a) => ['id' => $a->id, 'name' => $a->name])->values(),
            ]);

        return Inertia::render('Profile/Edit', [
            'mustVerifyEmail' => $user instanceof MustVerifyEmail,
            'status'          => session('status'),
            'myEvents'        => $myEvents,
        ]);
    }

    /**
     * Update the user's profile information.
     */
    public function update(ProfileUpdateRequest $request): RedirectResponse
    {
        $request->user()->fill($request->validated());

        if ($request->user()->isDirty('email')) {
            $request->user()->email_verified_at = null;
        }

        $request->user()->save();

        return Redirect::route('profile.edit');
    }

    /**
     * Delete the user's account.
     */
    public function destroy(Request $request): RedirectResponse
    {
        $request->validate([
            'password' => ['required', 'current_password'],
        ]);

        $user = $request->user();

        Auth::logout();

        $user->delete();

        $request->session()->invalidate();
        $request->session()->regenerateToken();

        return Redirect::to('/');
    }
}
