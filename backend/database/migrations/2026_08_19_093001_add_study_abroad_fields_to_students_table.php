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
        Schema::table('students', function (Blueprint $table) {
            // Personal Details
            $table->date('dob')->nullable();
            $table->string('passport_number')->nullable();
            $table->text('address')->nullable();
            
            // Education Details
            $table->string('highest_qualification')->nullable();
            $table->string('passing_year')->nullable();
            $table->string('grades_percentage')->nullable();
            $table->string('english_proficiency')->nullable();
            
            // Family Background
            $table->string('parents_occupation')->nullable();
            $table->string('family_annual_income')->nullable();
            
            // Finance Details
            $table->string('finance_source')->nullable();
            
            // Study Preferences
            $table->string('preferred_country')->nullable();
            $table->string('preferred_college')->nullable();
            $table->string('preferred_course')->nullable();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('students', function (Blueprint $table) {
            $table->dropColumn([
                'dob', 'passport_number', 'address',
                'highest_qualification', 'passing_year', 'grades_percentage', 'english_proficiency',
                'parents_occupation', 'family_annual_income',
                'finance_source',
                'preferred_country', 'preferred_college', 'preferred_course'
            ]);
        });
    }
};
