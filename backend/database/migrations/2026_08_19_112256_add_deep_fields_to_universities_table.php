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
        Schema::table('universities', function (Blueprint $table) {
            $table->string('city')->nullable();
            $table->string('established_year')->nullable();
            $table->string('acceptance_rate')->nullable();
            $table->string('international_students')->nullable();
            $table->string('campus_facilities')->nullable();
            $table->text('description')->nullable();
            $table->string('website')->nullable();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('universities', function (Blueprint $table) {
            $table->dropColumn([
                'city',
                'established_year',
                'acceptance_rate',
                'international_students',
                'campus_facilities',
                'description',
                'website'
            ]);
        });
    }
};
