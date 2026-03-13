<?php

namespace App\Http\Controllers;

use App\Models\Label;
use App\Repositories\SupabaseRepository;
use App\Helpers\SupabaseHelper;
use Illuminate\Http\Request;
use Inertia\Inertia;

class LabelController extends Controller
{
    public function index()
    {
        $useSupabase = SupabaseHelper::useSupabase();

        if ($useSupabase) {
            try {
                $labels = SupabaseRepository::labels()->get()->toArray();
            } catch (\Exception $e) {
                $labels = [];
            }
        } else {
            $labels = Label::all()->toArray();
        }

        // Fallback to default labels if empty
        if (empty($labels)) {
            $labels = [
                ['id' => 1, 'name' => 'Außendienst', 'color' => '#3b82f6', 'slug' => 'aussendienst'],
                ['id' => 2, 'name' => 'Innendienst', 'color' => '#10b981', 'slug' => 'innendienst'],
                ['id' => 3, 'name' => 'Produktion', 'color' => '#f59e0b', 'slug' => 'produktion'],
                ['id' => 4, 'name' => 'Support', 'color' => '#8b5cf6', 'slug' => 'support'],
                ['id' => 5, 'name' => 'Buchhaltung', 'color' => '#ec4899', 'slug' => 'buchhaltung'],
                ['id' => 6, 'name' => 'Vertrieb', 'color' => '#ef4444', 'slug' => 'vertrieb'],
            ];
        }

        return Inertia::render('Labels/Index', [
            'labels' => $labels,
        ]);
    }

    /**
     * Store a newly created label.
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'slug' => 'required|string|max:255|unique:labels,slug',
            'color' => 'required|string|max:20',
        ]);

        if (SupabaseHelper::useSupabase()) {
            try {
                SupabaseRepository::labels()->create($validated);
            } catch (\Exception $e) {
                return redirect()->back()->with('error', 'Fehler beim Erstellen des Labels: ' . $e->getMessage());
            }
        } else {
            Label::create($validated);
        }

        return redirect()->route('labels.index')
            ->with('success', 'Label erfolgreich erstellt.');
    }

    /**
     * Update the specified label.
     */
    public function update(Request $request, $id)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'slug' => 'required|string|max:255|unique:labels,slug,' . $id,
            'color' => 'required|string|max:20',
        ]);

        if (SupabaseHelper::useSupabase()) {
            try {
                SupabaseRepository::labels()->update($id, $validated);
            } catch (\Exception $e) {
                return redirect()->back()->with('error', 'Fehler beim Aktualisieren des Labels: ' . $e->getMessage());
            }
        } else {
            Label::findOrFail($id)->update($validated);
        }

        return redirect()->route('labels.index')
            ->with('success', 'Label erfolgreich aktualisiert.');
    }

    /**
     * Remove the specified label.
     */
    public function destroy($id)
    {
        if (SupabaseHelper::useSupabase()) {
            try {
                SupabaseRepository::labels()->delete($id);
            } catch (\Exception $e) {
                return redirect()->back()->with('error', 'Fehler beim Löschen des Labels: ' . $e->getMessage());
            }
        } else {
            Label::findOrFail($id)->delete();
        }

        return redirect()->route('labels.index')
            ->with('success', 'Label erfolgreich gelöscht.');
    }
}
