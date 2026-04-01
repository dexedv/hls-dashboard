<?php

namespace App\Http\Controllers;

use App\Models\KbArticle;
use App\Models\KbCategory;
use Illuminate\Http\Request;
use Illuminate\Support\Str;
use Inertia\Inertia;

class KnowledgeBaseController extends Controller
{
    public function index(Request $request)
    {
        $query = KbArticle::with(['category', 'creator']);

        if ($request->search) {
            $query->where(function ($q) use ($request) {
                $q->where('title', 'ilike', "%{$request->search}%")
                  ->orWhere('content', 'ilike', "%{$request->search}%");
            });
        }

        if ($request->category_id) {
            $query->where('category_id', $request->category_id);
        }

        if ($request->status) {
            $query->where('status', $request->status);
        } else {
            $query->where('status', 'published');
        }

        $articles = $query->orderByDesc('is_pinned')->orderBy('title')->paginate(20)->withQueryString();
        $categories = KbCategory::withCount(['articles' => fn($q) => $q->where('status', 'published')])->orderBy('sort_order')->get();

        return Inertia::render('KnowledgeBase/Index', [
            'articles' => $articles,
            'categories' => $categories,
            'filters' => (object) $request->only(['search', 'category_id', 'status']),
        ]);
    }

    public function create()
    {
        $categories = KbCategory::orderBy('sort_order')->get(['id', 'name']);
        return Inertia::render('KnowledgeBase/Create', ['categories' => $categories]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'title' => 'required|string|max:255',
            'content' => 'required|string',
            'category_id' => 'nullable|exists:kb_categories,id',
            'status' => 'nullable|in:draft,published',
            'is_pinned' => 'boolean',
        ]);

        $validated['slug'] = Str::slug($validated['title']) . '-' . Str::random(6);
        $validated['created_by'] = auth()->id();
        $validated['updated_by'] = auth()->id();
        $validated['status'] = $validated['status'] ?? 'draft';

        $article = KbArticle::create($validated);

        return redirect()->route('knowledge-base.show', $article->id)->with('success', 'Artikel erstellt.');
    }

    public function show(KbArticle $knowledgeBase)
    {
        $knowledgeBase->increment('views');
        $knowledgeBase->load(['category', 'creator', 'updater']);
        return Inertia::render('KnowledgeBase/Show', ['article' => $knowledgeBase]);
    }

    public function edit(KbArticle $knowledgeBase)
    {
        $categories = KbCategory::orderBy('sort_order')->get(['id', 'name']);
        return Inertia::render('KnowledgeBase/Edit', [
            'article' => $knowledgeBase,
            'categories' => $categories,
        ]);
    }

    public function update(Request $request, KbArticle $knowledgeBase)
    {
        $validated = $request->validate([
            'title' => 'required|string|max:255',
            'content' => 'required|string',
            'category_id' => 'nullable|exists:kb_categories,id',
            'status' => 'nullable|in:draft,published',
            'is_pinned' => 'boolean',
        ]);

        $validated['updated_by'] = auth()->id();
        $knowledgeBase->update($validated);

        return redirect()->route('knowledge-base.show', $knowledgeBase->id)->with('success', 'Artikel aktualisiert.');
    }

    public function destroy(KbArticle $knowledgeBase)
    {
        $knowledgeBase->delete();
        return redirect()->route('knowledge-base.index')->with('success', 'Artikel gelöscht.');
    }
}
