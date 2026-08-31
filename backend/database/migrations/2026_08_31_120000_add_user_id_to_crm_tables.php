<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        $tables = ['leads', 'raw_leads', 'students', 'courses', 'universities'];

        foreach ($tables as $tableName) {
            if (Schema::hasTable($tableName) && !Schema::hasColumn($tableName, 'user_id')) {
                Schema::table($tableName, function (Blueprint $table) {
                    $table->unsignedBigInteger('user_id')->nullable()->after('id');
                    $table->foreign('user_id')->references('id')->on('users')->nullOnDelete();
                });
            }
        }

        // Find primary admin/super_admin user id
        $superAdmin = DB::table('users')->where('username', 'admin')->first()
            ?? DB::table('users')->orderBy('id', 'asc')->first();

        if ($superAdmin) {
            foreach ($tables as $tableName) {
                if (Schema::hasTable($tableName)) {
                    DB::table($tableName)->whereNull('user_id')->update(['user_id' => $superAdmin->id]);
                }
            }
        }
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        $tables = ['leads', 'raw_leads', 'students', 'courses', 'universities'];

        foreach ($tables as $tableName) {
            if (Schema::hasTable($tableName) && Schema::hasColumn($tableName, 'user_id')) {
                Schema::table($tableName, function (Blueprint $table) use ($tableName) {
                    $table->dropForeign([$tableName . '_user_id_foreign']);
                    $table->dropColumn('user_id');
                });
            }
        }
    }
};
