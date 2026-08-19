<?php
use Illuminate\Support\Facades\DB;

DB::statement('SET FOREIGN_KEY_CHECKS=0;');
App\Models\StudentDocument::truncate();
App\Models\Student::truncate();
DB::statement('SET FOREIGN_KEY_CHECKS=1;');

$leads = App\Models\Lead::all();
foreach($leads as $lead) {
    App\Models\Student::create([
        'name' => $lead->name,
        'email' => $lead->email,
        'phone' => $lead->phone,
        'program' => $lead->location,
        'status' => 'Active'
    ]);
}
echo "Synced successfully\n";
