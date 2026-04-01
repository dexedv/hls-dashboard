<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('contracts', function (Blueprint $table) {
            $table->id();
            $table->string('title');
            $table->string('number')->nullable()->unique();
            $table->text('description')->nullable();
            $table->string('status')->default('draft'); // draft, active, expired, terminated
            $table->string('type')->nullable(); // service, nda, purchase, rental, other
            $table->date('start_date')->nullable();
            $table->date('end_date')->nullable();
            $table->decimal('value', 12, 2)->nullable();
            $table->string('currency')->default('EUR');
            $table->text('notes')->nullable();
            $table->foreignId('customer_id')->nullable()->constrained()->nullOnDelete();
            $table->foreignId('project_id')->nullable()->constrained()->nullOnDelete();
            $table->foreignId('created_by')->nullable()->constrained('users')->nullOnDelete();
            $table->timestamps();
            $table->softDeletes();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('contracts');
    }
};
