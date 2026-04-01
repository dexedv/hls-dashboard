<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        // Email accounts (one per user)
        Schema::create('email_accounts', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->onDelete('cascade');
            $table->string('email');
            $table->string('imap_host');
            $table->integer('imap_port')->default(993);
            $table->string('imap_encryption')->default('ssl');
            $table->string('smtp_host');
            $table->integer('smtp_port')->default(465);
            $table->string('smtp_encryption')->default('ssl');
            $table->string('username');
            $table->string('password'); // encrypted
            $table->boolean('is_active')->default(true);
            $table->timestamp('last_synced_at')->nullable();
            $table->timestamps();
        });

        // Email folders (per account)
        Schema::create('email_folders', function (Blueprint $table) {
            $table->id();
            $table->foreignId('email_account_id')->constrained()->onDelete('cascade');
            $table->string('name');
            $table->string('imap_folder'); // z.B. INBOX, Sent, Trash
            $table->integer('unread_count')->default(0);
            $table->timestamps();
        });

        // Email messages
        Schema::create('emails', function (Blueprint $table) {
            $table->id();
            $table->foreignId('email_account_id')->constrained()->onDelete('cascade');
            $table->foreignId('folder_id')->nullable()->constrained('email_folders')->onDelete('set null');
            $table->string('message_id')->nullable()->unique();
            $table->string('subject')->nullable();
            $table->text('from');
            $table->text('to');
            $table->text('cc')->nullable();
            $table->text('bcc')->nullable();
            $table->text('body_text')->nullable();
            $table->text('body_html')->nullable();
            $table->boolean('is_read')->default(false);
            $table->boolean('is_starred')->default(false);
            $table->boolean('is_draft')->default(false);
            $table->timestamp('received_at')->nullable();
            $table->timestamps();
        });

        // Email attachments
        Schema::create('email_attachments', function (Blueprint $table) {
            $table->id();
            $table->foreignId('email_id')->constrained()->onDelete('cascade');
            $table->string('filename');
            $table->string('mime_type');
            $table->integer('size');
            $table->string('file_path');
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('email_attachments');
        Schema::dropIfExists('emails');
        Schema::dropIfExists('email_folders');
        Schema::dropIfExists('email_accounts');
    }
};
