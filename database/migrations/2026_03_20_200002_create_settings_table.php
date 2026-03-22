<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        // Table already exists from 2026_03_12_100005_create_notifications_tables
        // This migration is kept for reference only
    }

    public function down(): void
    {
        Schema::dropIfExists('settings');
    }
};
