<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('customers', function (Blueprint $table) {
            $table->string('industry')->nullable()->after('company');
            $table->string('tax_number')->nullable()->after('industry');
            $table->string('vat_id')->nullable()->after('tax_number');
            $table->string('postal_code')->nullable()->after('address');
            $table->string('city')->nullable()->after('postal_code');
            $table->string('country')->default('DE')->after('city');
        });
    }

    public function down(): void
    {
        Schema::table('customers', function (Blueprint $table) {
            $table->dropColumn(['industry', 'tax_number', 'vat_id', 'postal_code', 'city', 'country']);
        });
    }
};
