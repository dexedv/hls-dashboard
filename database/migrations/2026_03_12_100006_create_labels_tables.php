<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('labels', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->string('name');
            $table->string('slug')->unique();
            $table->string('color')->default('#3b82f6');
            $table->text('description')->nullable();
            $table->timestamps();
        });

        Schema::create('user_labels', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->uuid('user_id');
            $table->uuid('label_id');
            $table->timestamps();

            $table->foreign('user_id')->references('id')->on('users')->onDelete('cascade');
            $table->foreign('label_id')->references('id')->on('labels')->onDelete('cascade');
            $table->unique(['user_id', 'label_id']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('user_labels');
        Schema::dropIfExists('labels');
    }
};
