<?php

namespace App\Http\Controllers;

use App\Models\EmailAccount;
use App\Models\EmailFolder;
use App\Models\Email;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;

class EmailController extends Controller
{
    /**
     * Ensure user can only access their own emails
     */
    private function getUserEmailAccount()
    {
        $userId = Auth::id();
        return EmailAccount::where('user_id', $userId)
            ->where('is_active', true)
            ->first();
    }

    /**
     * Show email dashboard
     */
    public function index(Request $request)
    {
        $account = $this->getUserEmailAccount();

        return Inertia::render('Email/Index', [
            'account' => $account ? [
                'id' => $account->id,
                'email' => $account->email,
                'is_active' => $account->is_active,
                'last_synced_at' => $account->last_synced_at,
            ] : null,
            'folders' => $account ? $account->folders()->orderBy('name')->get() : [],
        ]);
    }

    /**
     * Show emails for a specific folder
     */
    public function folder(Request $request, string $folderId)
    {
        $account = $this->getUserEmailAccount();

        if (!$account) {
            return redirect()->route('email.index')->with('error', 'Kein E-Mail-Konto konfiguriert');
        }

        // Verify folder belongs to user
        $folder = EmailFolder::where('id', (int)$folderId)
            ->where('email_account_id', $account->id)
            ->firstOrFail();

        $emails = Email::where('email_account_id', $account->id)
            ->where('folder_id', $folderId)
            ->orderBy('received_at', 'desc')
            ->paginate(20);

        return Inertia::render('Email/Index', [
            'account' => [
                'id' => $account->id,
                'email' => $account->email,
            ],
            'currentFolder' => $folder,
            'emails' => $emails,
        ]);
    }

    /**
     * Show single email
     */
    public function show(Request $request, string $emailId)
    {
        $account = $this->getUserEmailAccount();

        if (!$account) {
            return redirect()->route('email.index');
        }

        $email = Email::where('id', (int)$emailId)
            ->where('email_account_id', $account->id)
            ->firstOrFail();

        // Mark as read
        if (!$email->is_read) {
            $email->update(['is_read' => true]);
        }

        return Inertia::render('Email/Show', [
            'email' => [
                'id' => $email->id,
                'subject' => $email->subject,
                'from' => $email->from,
                'to' => $email->to,
                'cc' => $email->cc,
                'body_text' => $email->body_text,
                'body_html' => $email->body_html,
                'is_read' => $email->is_read,
                'is_starred' => $email->is_starred,
                'received_at' => $email->received_at,
                'attachments' => $email->attachments,
            ],
        ]);
    }

    /**
     * Get email settings
     */
    public function settings(Request $request)
    {
        $account = $this->getUserEmailAccount();

        return Inertia::render('Email/Settings', [
            'account' => $account ? [
                'id' => $account->id,
                'email' => $account->email,
                'imap_host' => $account->imap_host,
                'imap_port' => $account->imap_port,
                'imap_encryption' => $account->imap_encryption,
                'smtp_host' => $account->smtp_host,
                'smtp_port' => $account->smtp_port,
                'smtp_encryption' => $account->smtp_encryption,
                'username' => $account->username,
                'is_active' => $account->is_active,
            ] : null,
        ]);
    }

    /**
     * Save email account settings
     */
    public function saveSettings(Request $request)
    {
        $validated = $request->validate([
            'email' => 'required|email',
            'imap_host' => 'required|string',
            'imap_port' => 'required|integer',
            'imap_encryption' => 'required|string',
            'smtp_host' => 'required|string',
            'smtp_port' => 'required|integer',
            'smtp_encryption' => 'required|string',
            'username' => 'required|string',
            'password' => 'required|string',
        ]);

        $userId = Auth::id();

        // Find or create account for user
        $account = EmailAccount::updateOrCreate(
            ['user_id' => $userId],
            [
                'email' => $validated['email'],
                'imap_host' => $validated['imap_host'],
                'imap_port' => $validated['imap_port'],
                'imap_encryption' => $validated['imap_encryption'],
                'smtp_host' => $validated['smtp_host'],
                'smtp_port' => $validated['smtp_port'],
                'smtp_encryption' => $validated['smtp_encryption'],
                'username' => $validated['username'],
                'password' => $validated['password'],
                'is_active' => true,
            ]
        );

        // Create default folders
        $this->createDefaultFolders($account);

        return redirect()->route('email.index')->with('success', 'E-Mail-Konto gespeichert');
    }

    /**
     * Create default IMAP folders
     */
    private function createDefaultFolders(EmailAccount $account): void
    {
        $defaultFolders = [
            'INBOX' => 'Posteingang',
            'Sent' => 'Gesendet',
            'Trash' => 'Papierkorb',
            'Drafts' => 'Entwürfe',
        ];

        foreach ($defaultFolders as $imapName => $displayName) {
            EmailFolder::updateOrCreate(
                [
                    'email_account_id' => $account->id,
                    'imap_folder' => $imapName,
                ],
                [
                    'name' => $displayName,
                ]
            );
        }
    }

    /**
     * Mark email as read/unread
     */
    public function toggleRead(Request $request, string $emailId)
    {
        $account = $this->getUserEmailAccount();

        $email = Email::where('id', (int)$emailId)
            ->where('email_account_id', $account?->id)
            ->firstOrFail();

        $email->update(['is_read' => !$email->is_read]);

        return response()->json(['success' => true]);
    }

    /**
     * Star/unstar email
     */
    public function toggleStar(Request $request, string $emailId)
    {
        $account = $this->getUserEmailAccount();

        $email = Email::where('id', (int)$emailId)
            ->where('email_account_id', $account?->id)
            ->firstOrFail();

        $email->update(['is_starred' => !$email->is_starred]);

        return response()->json(['success' => true]);
    }

    /**
     * Delete email (move to trash)
     */
    public function destroy(Request $request, string $emailId)
    {
        $account = $this->getUserEmailAccount();

        $email = Email::where('id', (int)$emailId)
            ->where('email_account_id', $account?->id)
            ->firstOrFail();

        // Find trash folder
        $trash = EmailFolder::where('email_account_id', $account->id)
            ->where('imap_folder', 'Trash')
            ->first();

        if ($trash) {
            $email->update(['folder_id' => $trash->id]);
        } else {
            $email->delete();
        }

        return response()->json(['success' => true]);
    }

    /**
     * Sync emails from IMAP
     */
    public function sync(Request $request)
    {
        $account = $this->getUserEmailAccount();

        if (!$account) {
            return response()->json(['error' => 'Kein Konto konfiguriert'], 400);
        }

        // This would integrate with a real IMAP library
        // For now, just update the sync timestamp
        $account->update(['last_synced_at' => now()]);

        return response()->json(['success' => true, 'synced_at' => now()]);
    }
}
