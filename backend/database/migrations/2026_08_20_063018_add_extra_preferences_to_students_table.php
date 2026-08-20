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
            $table->string('preferred_country_2')->nullable();
            $table->string('preferred_college_2')->nullable();
            $table->string('preferred_course_2')->nullable();
            $table->string('preferred_country_3')->nullable();
            $table->string('preferred_college_3')->nullable();
            $table->string('preferred_course_3')->nullable();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('students', function (Blueprint $table) {
            $table->dropColumn([
                'preferred_country_2', 'preferred_college_2', 'preferred_course_2',
                'preferred_country_3', 'preferred_college_3', 'preferred_course_3'
            ]);
        });
    }
};
