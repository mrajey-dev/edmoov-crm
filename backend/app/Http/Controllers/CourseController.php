<?php
namespace App\Http\Controllers;
use App\Models\Course;
use Illuminate\Http\Request;

class CourseController extends Controller
{
    public function index() { return Course::orderBy('id', 'desc')->get(); }
    public function store(Request $request) { return Course::create($request->all()); }
    public function show(Course $course) { return $course; }
    public function update(Request $request, Course $course) { $course->update($request->all()); return $course; }
    public function destroy(Course $course) { $course->delete(); return response()->json(['message' => 'Deleted']); }
}
