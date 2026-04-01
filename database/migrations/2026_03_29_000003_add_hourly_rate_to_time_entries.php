<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('time_entries', function (Blueprint $table) {
            if (!Schema::hasColumn('time_entries', 'hourly_rate')) {
                $table->decimal('hourly_rate', 10, 2)->nullable()->after('description');
            }
            if (!Schema::hasColumn('time_entries', 'billable')) {
                $table->boolean('billable')->default(false)->after('hourly_rate');
            }
        });
    }

    public function down(): void
    {
        Schema::table('time_entries', function (Blueprint $table) {
            $table->dropColumn(['hourly_rate', 'billable']);
        });
    }
};
