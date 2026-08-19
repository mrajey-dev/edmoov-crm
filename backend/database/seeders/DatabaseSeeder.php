<?php

namespace Database\Seeders;

use App\Models\Lead;
use App\Models\Student;
use App\Models\Course;
use App\Models\University;
use Illuminate\Database\Seeder;
use Carbon\Carbon;

class DatabaseSeeder extends Seeder
{
    /**
     * Seed the application's database.
     */
    public function run(): void
    {
        // Helper to get random date in last 6 months
        $getRandomDate = function() {
            return Carbon::now()->subDays(rand(0, 180));
        };

        // Universities
        $universities = [
            ['name' => 'Harvard University', 'country' => 'USA', 'rank' => '#1', 'status' => 'Active'],
            ['name' => 'Oxford University', 'country' => 'UK', 'rank' => '#2', 'status' => 'Active'],
            ['name' => 'University of Toronto', 'country' => 'Canada', 'rank' => '#21', 'status' => 'Pending'],
            ['name' => 'University of Melbourne', 'country' => 'Australia', 'rank' => '#33', 'status' => 'Inactive'],
            ['name' => 'Stanford University', 'country' => 'USA', 'rank' => '#3', 'status' => 'Active'],
        ];
        foreach ($universities as $uni) {
            $uni['created_at'] = $getRandomDate();
            University::create($uni);
        }

        // Courses
        $courses = [
            ['name' => 'Computer Science', 'university' => 'Harvard University', 'level' => 'Undergrad', 'duration' => '4 Years', 'fee' => '₹50,00,000/yr', 'status' => 'Active'],
            ['name' => 'Data Science', 'university' => 'Oxford University', 'level' => 'Masters', 'duration' => '1 Year', 'fee' => '₹30,00,000/yr', 'status' => 'Active'],
            ['name' => 'Artificial Intelligence', 'university' => 'University of Toronto', 'level' => 'PhD', 'duration' => '4 Years', 'fee' => '₹20,00,000/yr', 'status' => 'Active'],
            ['name' => 'Business Administration', 'university' => 'University of Melbourne', 'level' => 'Undergrad', 'duration' => '3 Years', 'fee' => '₹40,00,000/yr', 'status' => 'Inactive'],
            ['name' => 'Software Engineering', 'university' => 'Stanford University', 'level' => 'Masters', 'duration' => '2 Years', 'fee' => '₹55,00,000/yr', 'status' => 'Active'],
        ];
        foreach ($courses as $course) {
            $course['created_at'] = $getRandomDate();
            Course::create($course);
        }

        // Students (Generate more to make charts look good)
        $studentNames = ['Ruben Philips', 'Emery Donin', 'Charlie Korsgaard', 'Ryan Vaccaro', 'Aisha Khan', 'John Doe', 'Jane Smith', 'Alice Cooper', 'Bob Marley', 'Eve Adams', 'Mallory Brooks', 'Trent Reznor', 'Peggy Carter', 'Victor Stone', 'Walter White'];
        $countries = ['USA', 'UK', 'Canada', 'Australia', 'Germany'];
        $courses = ['Computer Science', 'Business Administration', 'Data Science', 'Nursing', 'Engineering'];
        
        foreach ($studentNames as $name) {
            $country = $countries[rand(0, 4)];
            $course = $courses[rand(0, 4)];
            Student::create([
                'name' => $name,
                'email' => strtolower(str_replace(' ', '.', $name)) . '@example.com',
                'phone' => '+1 ' . rand(100, 999) . ' ' . rand(1000, 9999),
                'program' => ['Undergrad', 'Masters', 'PhD'][rand(0, 2)] . ' - ' . $country,
                'status' => ['Active', 'Pending', 'Graduated'][rand(0, 2)],
                
                // New Fields
                'dob' => Carbon::now()->subYears(rand(18, 30))->subDays(rand(1, 365))->format('Y-m-d'),
                'passport_number' => strtoupper(substr(md5($name), 0, 8)),
                'address' => rand(100, 9999) . ' Example St, City, State',
                'highest_qualification' => ['High School', 'Bachelor\'s Degree', 'Master\'s Degree'][rand(0, 2)],
                'passing_year' => rand(2020, 2026),
                'grades_percentage' => rand(65, 99) . '%',
                'english_proficiency' => ['IELTS ' . (rand(60, 90)/10), 'TOEFL ' . rand(80, 115), 'PTE ' . rand(50, 80)][rand(0, 2)],
                'parents_occupation' => ['Business', 'Engineer', 'Teacher', 'Doctor', 'Retired'][rand(0, 4)],
                'family_annual_income' => '₹' . rand(3, 15) . ',00,000',
                'finance_source' => ['Self-funded', 'Education Loan', 'Sponsorship'][rand(0, 2)],
                'preferred_country' => $country,
                'preferred_college' => $country . ' State University',
                'preferred_course' => $course,
                
                'created_at' => $getRandomDate()
            ]);
        }

        // Leads (Follow Ups)
        $leadNames = ['Ruben Philips', 'Alice Smith', 'Emery Donin', 'John Doe', 'Charlie Korsgaard', 'Sarah Lee', 'Ryan Vaccaro', 'Mike Tyson', 'Serena Williams', 'LeBron James', 'Tom Brady', 'Lionel Messi', 'Cristiano Ronaldo', 'Kobe Bryant', 'Tiger Woods'];
        $types = ['hot', 'warm', 'cold', 'dead', 'approved', 'hot', 'warm', 'hot'];
        foreach ($leadNames as $name) {
            Lead::create([
                'name' => $name,
                'email' => strtolower(str_replace(' ', '.', $name)) . '@example.com',
                'phone' => '+1 ' . rand(100, 999) . ' ' . rand(1000, 9999),
                'location' => ['Undergrad - USA', 'Masters - UK', 'PhD - Canada', 'Undergrad - Australia'][rand(0, 3)],
                'type' => $types[rand(0, 7)],
                'status' => 'Active',
                'notes' => '[]',
                'created_at' => $getRandomDate()
            ]);
        }
    }
}
