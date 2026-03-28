<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    public function up(): void
    {
        if (!Schema::hasTable('project_user')) {
            Schema::create('project_user', function (Blueprint $table) {
                $table->id();
                $table->foreignId('project_id')->constrained()->onDelete('cascade');
                $table->foreignId('user_id')->constrained()->onDelete('cascade');
                $table->timestamps();
                $table->unique(['project_id', 'user_id']);
            });
        }

        if (!Schema::hasTable('task_user')) {
            Schema::create('task_user', function (Blueprint $table) {
                $table->id();
                $table->foreignId('task_id')->constrained()->onDelete('cascade');
                $table->foreignId('user_id')->constrained()->onDelete('cascade');
                $table->timestamps();
                $table->unique(['task_id', 'user_id']);
            });
        }

        if (!Schema::hasTable('ticket_user')) {
            Schema::create('ticket_user', function (Blueprint $table) {
                $table->id();
                $table->foreignId('ticket_id')->constrained()->onDelete('cascade');
                $table->foreignId('user_id')->constrained()->onDelete('cascade');
                $table->timestamps();
                $table->unique(['ticket_id', 'user_id']);
            });
        }

        if (!Schema::hasTable('note_user')) {
            Schema::create('note_user', function (Blueprint $table) {
                $table->id();
                $table->foreignId('note_id')->constrained()->onDelete('cascade');
                $table->foreignId('user_id')->constrained()->onDelete('cascade');
                $table->timestamps();
                $table->unique(['note_id', 'user_id']);
            });
        }

        // Migrate existing single-assignment data to pivot tables
        if (Schema::hasColumn('projects', 'assigned_to')) {
            DB::statement("INSERT INTO project_user (project_id, user_id, created_at, updated_at) SELECT id, assigned_to, NOW(), NOW() FROM projects WHERE assigned_to IS NOT NULL ON CONFLICT (project_id, user_id) DO NOTHING");
        }
        if (Schema::hasColumn('tasks', 'assigned_to')) {
            DB::statement("INSERT INTO task_user (task_id, user_id, created_at, updated_at) SELECT id, assigned_to, NOW(), NOW() FROM tasks WHERE assigned_to IS NOT NULL AND deleted_at IS NULL ON CONFLICT (task_id, user_id) DO NOTHING");
        }
        if (Schema::hasColumn('tickets', 'assigned_to')) {
            DB::statement("INSERT INTO ticket_user (ticket_id, user_id, created_at, updated_at) SELECT id, assigned_to, NOW(), NOW() FROM tickets WHERE assigned_to IS NOT NULL AND deleted_at IS NULL ON CONFLICT (ticket_id, user_id) DO NOTHING");
        }
        if (Schema::hasColumn('notes', 'assigned_to')) {
            DB::statement("INSERT INTO note_user (note_id, user_id, created_at, updated_at) SELECT id, assigned_to, NOW(), NOW() FROM notes WHERE assigned_to IS NOT NULL ON CONFLICT (note_id, user_id) DO NOTHING");
        }
    }

    public function down(): void
    {
        Schema::dropIfExists('project_user');
        Schema::dropIfExists('task_user');
        Schema::dropIfExists('ticket_user');
        Schema::dropIfExists('note_user');
    }
};
