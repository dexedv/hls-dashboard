<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('customers', function (Blueprint $table) {
            $table->index('name');
            $table->index('email');
            $table->index('company');
        });

        Schema::table('projects', function (Blueprint $table) {
            $table->index('name');
            $table->index('status');
            $table->index('customer_id');
        });

        Schema::table('tasks', function (Blueprint $table) {
            $table->index('title');
            $table->index('status');
            $table->index('project_id');
            $table->index('assigned_to');
        });

        Schema::table('invoices', function (Blueprint $table) {
            $table->index('number');
            $table->index('status');
            $table->index('customer_id');
        });

        Schema::table('inventories', function (Blueprint $table) {
            $table->index('name');
            $table->index('sku');
            $table->index('barcode');
        });

        Schema::table('tickets', function (Blueprint $table) {
            $table->index('title');
            $table->index('status');
        });
    }

    public function down(): void
    {
        Schema::table('customers', function (Blueprint $table) {
            $table->dropIndex(['name']);
            $table->dropIndex(['email']);
            $table->dropIndex(['company']);
        });

        Schema::table('projects', function (Blueprint $table) {
            $table->dropIndex(['name']);
            $table->dropIndex(['status']);
            $table->dropIndex(['customer_id']);
        });

        Schema::table('tasks', function (Blueprint $table) {
            $table->dropIndex(['title']);
            $table->dropIndex(['status']);
            $table->dropIndex(['project_id']);
            $table->dropIndex(['assigned_to']);
        });

        Schema::table('invoices', function (Blueprint $table) {
            $table->dropIndex(['number']);
            $table->dropIndex(['status']);
            $table->dropIndex(['customer_id']);
        });

        Schema::table('inventories', function (Blueprint $table) {
            $table->dropIndex(['name']);
            $table->dropIndex(['sku']);
            $table->dropIndex(['barcode']);
        });

        Schema::table('tickets', function (Blueprint $table) {
            $table->dropIndex(['title']);
            $table->dropIndex(['status']);
        });
    }
};
