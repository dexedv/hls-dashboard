<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('licenses', function (Blueprint $table) {
            $table->id();
            $table->text('license_key');
            $table->string('licensed_to');
            $table->string('licensed_email');
            $table->string('plan')->default('starter'); // starter, professional, enterprise
            $table->integer('max_users')->default(5);
            $table->json('features')->nullable();
            $table->date('valid_until')->nullable(); // null = lifetime
            $table->timestamp('activated_at')->nullable();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('licenses');
    }
};
