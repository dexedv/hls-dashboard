<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('invoices', function (Blueprint $table) {
            $table->boolean('is_recurring')->default(false)->after('notes');
            $table->string('recurring_interval')->nullable()->after('is_recurring'); // monthly, quarterly, yearly
            $table->date('recurring_next_date')->nullable()->after('recurring_interval');
            $table->date('recurring_end_date')->nullable()->after('recurring_next_date');
            $table->unsignedBigInteger('recurring_parent_id')->nullable()->after('recurring_end_date');
        });
    }

    public function down(): void
    {
        Schema::table('invoices', function (Blueprint $table) {
            $table->dropColumn(['is_recurring', 'recurring_interval', 'recurring_next_date', 'recurring_end_date', 'recurring_parent_id']);
        });
    }
};
