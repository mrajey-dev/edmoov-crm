<?php
use Illuminate\Support\Facades\DB;
use App\Models\Lead;
use App\Models\Student;
use App\Models\StudentDocument;

DB::statement('SET FOREIGN_KEY_CHECKS=0;');
StudentDocument::truncate();
Student::truncate();
Lead::truncate();
DB::statement('SET FOREIGN_KEY_CHECKS=1;');

$mockData = [
    [
        'name' => 'Alice Johnson',
        'email' => 'alice.johnson@example.com',
        'phone' => '+1 415 555 0198',
        'program' => 'Masters - Computer Science',
        'lead_type' => 'hot',
        
        'dob' => '1998-05-14',
        'passport_number' => 'A12345678',
        'address' => '123 Tech Blvd, San Francisco, CA, USA',
        'highest_qualification' => 'Bachelor of Engineering',
        'passing_year' => '2020',
        'grades_percentage' => '88%',
        'english_proficiency' => 'IELTS 7.5',
        'parents_occupation' => 'Software Engineer',
        'family_annual_income' => '₹12,00,000',
        'finance_source' => 'Education Loan',
        'preferred_country' => 'United States',
        'preferred_college' => 'Stanford University',
        'preferred_course' => 'MSc Computer Science',
        'status' => 'Active',
    ],
    [
        'name' => 'Rahul Sharma',
        'email' => 'rahul.sharma@example.com',
        'phone' => '+91 98765 43210',
        'program' => 'Undergrad - Business',
        'lead_type' => 'warm',
        
        'dob' => '2004-11-20',
        'passport_number' => 'Z98765432',
        'address' => '45 MG Road, Bangalore, Karnataka, India',
        'highest_qualification' => 'High School',
        'passing_year' => '2022',
        'grades_percentage' => '92%',
        'english_proficiency' => 'TOEFL 95',
        'parents_occupation' => 'Business Owner',
        'family_annual_income' => '₹25,00,000',
        'finance_source' => 'Self-funded',
        'preferred_country' => 'United Kingdom',
        'preferred_college' => 'Oxford University',
        'preferred_course' => 'BBA',
        'status' => 'Pending',
    ],
    [
        'name' => 'Maria Garcia',
        'email' => 'maria.garcia@example.com',
        'phone' => '+34 600 123 456',
        'program' => 'PhD - Data Science',
        'lead_type' => 'approved',
        
        'dob' => '1995-02-10',
        'passport_number' => 'E45678912',
        'address' => 'Calle Mayor 10, Madrid, Spain',
        'highest_qualification' => 'Master of Science',
        'passing_year' => '2019',
        'grades_percentage' => '95%',
        'english_proficiency' => 'PTE 80',
        'parents_occupation' => 'Teacher',
        'family_annual_income' => '₹8,00,000',
        'finance_source' => 'Sponsorship',
        'preferred_country' => 'Canada',
        'preferred_college' => 'University of Toronto',
        'preferred_course' => 'PhD in AI',
        'status' => 'Active',
    ],
    [
        'name' => 'Wei Chen',
        'email' => 'wei.chen@example.com',
        'phone' => '+86 139 1234 5678',
        'program' => 'Masters - Engineering',
        'lead_type' => 'cold',
        
        'dob' => '1999-09-30',
        'passport_number' => 'C34567890',
        'address' => '10 Nanjing Road, Shanghai, China',
        'highest_qualification' => 'Bachelor of Technology',
        'passing_year' => '2021',
        'grades_percentage' => '78%',
        'english_proficiency' => 'IELTS 6.5',
        'parents_occupation' => 'Architect',
        'family_annual_income' => '₹15,00,000',
        'finance_source' => 'Education Loan',
        'preferred_country' => 'Australia',
        'preferred_college' => 'University of Melbourne',
        'preferred_course' => 'MSc Civil Engineering',
        'status' => 'Graduated',
    ],
    [
        'name' => 'Sarah O\'Connor',
        'email' => 'sarah.oconnor@example.com',
        'phone' => '+353 87 654 3210',
        'program' => 'Undergrad - Arts',
        'lead_type' => 'dead',
        
        'dob' => '2005-07-22',
        'passport_number' => 'P76543210',
        'address' => '15 Grafton Street, Dublin, Ireland',
        'highest_qualification' => 'High School',
        'passing_year' => '2023',
        'grades_percentage' => '85%',
        'english_proficiency' => 'Native',
        'parents_occupation' => 'Journalist',
        'family_annual_income' => '₹10,00,000',
        'finance_source' => 'Self-funded',
        'preferred_country' => 'United Kingdom',
        'preferred_college' => 'University of Edinburgh',
        'preferred_course' => 'BA History',
        'status' => 'Inactive',
    ]
];

foreach ($mockData as $data) {
    // Create Lead
    Lead::create([
        'name' => $data['name'],
        'email' => $data['email'],
        'phone' => $data['phone'],
        'location' => $data['program'],
        'type' => $data['lead_type'],
        'status' => 'Active',
        'notes' => '[]'
    ]);

    // Create matching Student with full details
    Student::create([
        'name' => $data['name'],
        'email' => $data['email'],
        'phone' => $data['phone'],
        'program' => $data['program'],
        
        'dob' => $data['dob'],
        'passport_number' => $data['passport_number'],
        'address' => $data['address'],
        'highest_qualification' => $data['highest_qualification'],
        'passing_year' => $data['passing_year'],
        'grades_percentage' => $data['grades_percentage'],
        'english_proficiency' => $data['english_proficiency'],
        'parents_occupation' => $data['parents_occupation'],
        'family_annual_income' => $data['family_annual_income'],
        'finance_source' => $data['finance_source'],
        'preferred_country' => $data['preferred_country'],
        'preferred_college' => $data['preferred_college'],
        'preferred_course' => $data['preferred_course'],
        'status' => $data['status'],
    ]);
}

echo "Seeded database with rich matched mock data.\n";
