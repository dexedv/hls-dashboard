<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('labels', function (Blueprint $table) {
            $table->id();
            $table->string('name');
            $table->string('slug')->unique();
            $table->string('color')->default('#3b82f6');
            $table->text('description')->nullable();
            $table->timestamps();
        });

        Schema::create('user_labels', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained('users')->onDelete('cascade');
            $table->foreignId('label_id')->constrained('labels')->onDelete('cascade');
            $table->timestamps();

            $table->unique(['user_id', 'label_id']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('user_labels');
        Schema::dropIfExists('labels');
    }
};
