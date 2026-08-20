<?php
$courses = [
    [
        'name' => 'BBA',
        'fee' => '500,000',
        'currency' => '₹',
        'university' => 'Oxford University',
        'level' => 'Bachelors',
        'duration' => '3 Years',
        'status' => 'Active',
        'description' => 'Business Admin degree.',
        'intake_months' => 'Sep',
        'application_fee' => '5000',
        'min_gpa_percentage' => '80%',
        'english_req' => 'IELTS 7.0'
    ],
    [
        'name' => 'PhD in AI',
        'fee' => '1,200,000',
        'currency' => '₹',
        'university' => 'University of Toronto',
        'level' => 'PhD',
        'duration' => '4 Years',
        'status' => 'Active',
        'description' => 'Advanced AI research.',
        'intake_months' => 'Jan',
        'application_fee' => '10000',
        'min_gpa_percentage' => '90%',
        'english_req' => 'PTE 80'
    ],
    [
        'name' => 'MSc Civil Engineering',
        'fee' => '800,000',
        'currency' => '₹',
        'university' => 'University of Melbourne',
        'level' => 'Masters',
        'duration' => '2 Years',
        'status' => 'Active',
        'description' => 'Civil engineering specialization.',
        'intake_months' => 'Sep',
        'application_fee' => '8000',
        'min_gpa_percentage' => '75%',
        'english_req' => 'IELTS 6.5'
    ],
    [
        'name' => 'BA History',
        'fee' => '400,000',
        'currency' => '₹',
        'university' => 'University of Edinburgh',
        'level' => 'Bachelors',
        'duration' => '3 Years',
        'status' => 'Active',
        'description' => 'History degree.',
        'intake_months' => 'Sep',
        'application_fee' => '3000',
        'min_gpa_percentage' => '80%',
        'english_req' => 'Native'
    ]
];

foreach ($courses as $c) {
    App\Models\Course::firstOrCreate(['name' => $c['name']], $c);
}

// Update the existing MSc Computer Science to have an INR fee matching a realistic amount so it works in calculations easily
$msc = App\Models\Course::where('name', 'MSc Computer Science')->first();
if ($msc) {
    $msc->fee = '900,000';
    $msc->currency = '₹';
    $msc->save();
}

echo "Courses synced!\n";
