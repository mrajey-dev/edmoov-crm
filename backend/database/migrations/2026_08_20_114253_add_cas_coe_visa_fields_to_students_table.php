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
            $table->string('pref_1_cas_coe_number')->nullable();
            $table->date('pref_1_issue_date')->nullable();
            $table->string('pref_1_visa_status')->nullable();

            $table->string('pref_2_cas_coe_number')->nullable();
            $table->date('pref_2_issue_date')->nullable();
            $table->string('pref_2_visa_status')->nullable();

            $table->string('pref_3_cas_coe_number')->nullable();
            $table->date('pref_3_issue_date')->nullable();
            $table->string('pref_3_visa_status')->nullable();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('students', function (Blueprint $table) {
            $table->dropColumn([
                'pref_1_cas_coe_number', 'pref_1_issue_date', 'pref_1_visa_status',
                'pref_2_cas_coe_number', 'pref_2_issue_date', 'pref_2_visa_status',
                'pref_3_cas_coe_number', 'pref_3_issue_date', 'pref_3_visa_status',
            ]);
        });
    }
};
