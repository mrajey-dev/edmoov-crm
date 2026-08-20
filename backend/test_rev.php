<?php
$studentsWithCourses = App\Models\Student::all();
$allLeadsByEmail = App\Models\Lead::all()->keyBy('email');
$allCoursesByName = App\Models\Course::all()->keyBy('name');

foreach ($studentsWithCourses as $student) {
    $lead = $allLeadsByEmail->get($student->email);
    $course = $allCoursesByName->get($student->preferred_course);
    echo 'Student: '.$student->email.' | Lead: '.($lead ? $lead->type : 'null').' | Course: '.($course ? $course->name : 'null')." | Fee: ".($course ? $course->fee : 'null')."\n";
}
