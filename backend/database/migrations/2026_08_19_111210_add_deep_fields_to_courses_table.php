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
        Schema::table('courses', function (Blueprint $table) {
            $table->text('description')->nullable();
            $table->string('intake_months')->nullable();
            $table->string('application_fee')->nullable();
            $table->string('currency')->default('₹');
            $table->string('min_gpa_percentage')->nullable();
            $table->string('english_req')->nullable();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('courses', function (Blueprint $table) {
            $table->dropColumn([
                'description',
                'intake_months',
                'application_fee',
                'currency',
                'min_gpa_percentage',
                'english_req'
            ]);
        });
    }
};
