<?php

namespace App\Http\Controllers;

use App\Models\DocumentFolder;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;

class DocumentFolderController extends Controller
{
    public function store(Request $request)
    {
        $request->validate([
            'name'            => 'required|string|max:255',
            'folderable_type' => 'required|in:App\Models\Project,App\Models\Task',
            'folderable_id'   => 'required|integer',
        ]);

        DocumentFolder::create([
            'name'            => $request->name,
            'folderable_type' => $request->folderable_type,
            'folderable_id'   => $request->folderable_id,
            'created_by'      => auth()->id(),
        ]);

        return redirect()->back()->with('success', 'Ordner erstellt.');
    }

    public function destroy(DocumentFolder $documentFolder)
    {
        foreach ($documentFolder->attachments as $attachment) {
            Storage::disk('local')->delete('attachments/' . $attachment->filename);
        }

        $documentFolder->delete();

        return redirect()->back()->with('success', 'Ordner gelöscht.');
    }
}
