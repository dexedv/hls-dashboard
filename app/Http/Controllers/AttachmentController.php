<?php

namespace App\Http\Controllers;

use App\Models\Attachment;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;

class AttachmentController extends Controller
{
    public function store(Request $request)
    {
        $request->validate([
            'file'            => 'nullable|file|max:51200',
            'files'           => 'nullable|array',
            'files.*'         => 'file|max:51200',
            'attachable_type' => 'required|string',
            'attachable_id'   => 'required|integer',
            'folder_id'       => 'nullable|exists:document_folders,id',
        ]);

        $files = $request->hasFile('files')
            ? $request->file('files')
            : array_filter([$request->file('file')]);

        foreach ($files as $file) {
            $filename = Str::uuid() . '.' . $file->getClientOriginalExtension();
            $file->storeAs('attachments', $filename, 'local');

            Attachment::create([
                'folder_id'       => $request->folder_id,
                'attachable_type' => $request->attachable_type,
                'attachable_id'   => $request->attachable_id,
                'filename'        => $filename,
                'original_name'   => $file->getClientOriginalName(),
                'mime_type'       => $file->getMimeType(),
                'size'            => $file->getSize(),
                'uploaded_by'     => auth()->id(),
            ]);
        }

        return redirect()->back()->with('success', count($files) . ' Datei(en) hochgeladen.');
    }

    public function download(Attachment $attachment)
    {
        $path = storage_path('app/attachments/' . $attachment->filename);
        if (!file_exists($path)) {
            abort(404);
        }

        return response()->download($path, $attachment->original_name, [
            'Content-Type' => $attachment->mime_type,
        ]);
    }

    public function preview(Attachment $attachment)
    {
        $path = storage_path('app/attachments/' . $attachment->filename);
        if (!file_exists($path)) {
            abort(404);
        }

        return response()->file($path, [
            'Content-Type'        => $attachment->mime_type ?? 'application/octet-stream',
            'Content-Disposition' => 'inline; filename="' . rawurlencode($attachment->original_name) . '"',
        ]);
    }

    public function destroy(Attachment $attachment)
    {
        Storage::disk('local')->delete('attachments/' . $attachment->filename);
        $attachment->delete();

        return redirect()->back()->with('success', 'Datei gelöscht.');
    }
}
