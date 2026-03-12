<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        // Add Lexware fields to customers table
        Schema::table('customers', function (Blueprint $table) {
            $table->string('lexware_id')->nullable()->after('created_by');
            $table->enum('sync_status', ['synced', 'pending', 'error'])->default('pending')->after('lexware_id');
            $table->timestamp('last_synced_at')->nullable()->after('sync_status');
        });

        // Add Lexware fields to invoices table
        Schema::table('invoices', function (Blueprint $table) {
            $table->string('lexware_id')->nullable()->after('created_by');
            $table->string('lexware_status')->nullable()->after('lexware_id');
            $table->timestamp('last_synced_at')->nullable()->after('lexware_status');
        });

        // Add Lexware fields to quotes table
        Schema::table('quotes', function (Blueprint $table) {
            $table->string('lexware_id')->nullable()->after('created_by');
            $table->string('lexware_status')->nullable()->after('lexware_id');
            $table->timestamp('last_synced_at')->nullable()->after('lexware_status');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('customers', function (Blueprint $table) {
            $table->dropColumn(['lexware_id', 'sync_status', 'last_synced_at']);
        });

        Schema::table('invoices', function (Blueprint $table) {
            $table->dropColumn(['lexware_id', 'lexware_status', 'last_synced_at']);
        });

        Schema::table('quotes', function (Blueprint $table) {
            $table->dropColumn(['lexware_id', 'lexware_status', 'last_synced_at']);
        });
    }
};
