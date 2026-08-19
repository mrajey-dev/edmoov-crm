<?php
App\Models\Student::truncate();
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
