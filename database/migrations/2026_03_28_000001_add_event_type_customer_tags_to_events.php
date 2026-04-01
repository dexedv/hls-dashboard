<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('events', function (Blueprint $table) {
            $table->string('event_type')->default('meeting')->after('title');
            $table->foreignId('customer_id')->nullable()->constrained()->nullOnDelete()->after('project_id');
            $table->json('tags')->nullable()->after('customer_id');
        });

        Schema::create('event_user', function (Blueprint $table) {
            $table->id();
            $table->foreignId('event_id')->constrained()->cascadeOnDelete();
            $table->foreignId('user_id')->constrained()->cascadeOnDelete();
            $table->timestamps();
            $table->unique(['event_id', 'user_id']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('event_user');
        Schema::table('events', function (Blueprint $table) {
            $table->dropForeign(['customer_id']);
            $table->dropColumn(['event_type', 'customer_id', 'tags']);
        });
    }
};
