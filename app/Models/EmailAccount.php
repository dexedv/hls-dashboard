<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Support\Facades\Crypt;

class EmailAccount extends Model
{
    use HasFactory;

    protected $fillable = [
        'user_id',
        'email',
        'imap_host',
        'imap_port',
        'imap_encryption',
        'smtp_host',
        'smtp_port',
        'smtp_encryption',
        'username',
        'password',
        'is_active',
        'last_synced_at',
    ];

    protected $hidden = [
        'password',
    ];

    protected $casts = [
        'is_active' => 'boolean',
        'last_synced_at' => 'datetime',
    ];

    // Password encryption
    public function setPasswordAttribute($value)
    {
        $this->attributes['password'] = Crypt::encryptString($value);
    }

    public function getDecryptedPassword(): string
    {
        return Crypt::decryptString($this->password);
    }

    /**
     * Get the user that owns this email account
     */
    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    /**
     * Get folders for this account
     */
    public function folders(): HasMany
    {
        return $this->hasMany(EmailFolder::class);
    }

    /**
     * Get emails for this account
     */
    public function emails(): HasMany
    {
        return $this->hasMany(Email::class);
    }
}

class EmailFolder extends Model
{
    use HasFactory;

    protected $fillable = [
        'email_account_id',
        'name',
        'imap_folder',
        'unread_count',
    ];

    protected $casts = [
        'unread_count' => 'integer',
    ];

    public function account(): BelongsTo
    {
        return $this->belongsTo(EmailAccount::class, 'email_account_id');
    }

    public function emails(): HasMany
    {
        return $this->hasMany(Email::class, 'folder_id');
    }
}

class Email extends Model
{
    use HasFactory;

    protected $fillable = [
        'email_account_id',
        'folder_id',
        'message_id',
        'subject',
        'from',
        'to',
        'cc',
        'bcc',
        'body_text',
        'body_html',
        'is_read',
        'is_starred',
        'is_draft',
        'received_at',
    ];

    protected $casts = [
        'is_read' => 'boolean',
        'is_starred' => 'boolean',
        'is_draft' => 'boolean',
        'received_at' => 'datetime',
    ];

    public function account(): BelongsTo
    {
        return $this->belongsTo(EmailAccount::class, 'email_account_id');
    }

    public function folder(): BelongsTo
    {
        return $this->belongsTo(EmailFolder::class, 'folder_id');
    }

    public function attachments(): HasMany
    {
        return $this->hasMany(EmailAttachment::class);
    }

    // Parse from address
    public function getFromArray(): array
    {
        return $this->parseEmailList($this->from);
    }

    // Parse to address
    public function getToArray(): array
    {
        return $this->parseEmailList($this->to);
    }

    private function parseEmailList(string $list): array
    {
        $emails = [];
        preg_match_all('/([^<]+)<([^>]+)>/', $list, $matches);
        foreach ($matches[0] as $i => $match) {
            $emails[] = [
                'name' => trim($matches[1][$i] ?? ''),
                'email' => trim($matches[2][$i] ?? $match),
            ];
        }
        return $emails;
    }
}

class EmailAttachment extends Model
{
    use HasFactory;

    protected $fillable = [
        'email_id',
        'filename',
        'mime_type',
        'size',
        'file_path',
    ];

    protected $casts = [
        'size' => 'integer',
    ];

    public function email(): BelongsTo
    {
        return $this->belongsTo(Email::class);
    }
}
