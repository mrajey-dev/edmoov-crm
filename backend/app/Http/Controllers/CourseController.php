<?php

namespace App\Http\Controllers;

use App\Models\Course;
use Illuminate\Http\Request;

class CourseController extends Controller
{
    public function index(Request $request)
    {
        return Course::with('user:id,name,username')->orderBy('id', 'desc')->get();
    }

    public function store(Request $request)
    {
        $data = $request->all();
        $user = $request->user();
        if ($user) {
            $data['user_id'] = ($user->isSuperAdmin() && $request->filled('user_id'))
                ? $request->user_id
                : $user->id;
        }

        $course = Course::create($data);
        return response()->json($course->load('user:id,name,username'), 201);
    }

    public function show(Course $course)
    {
        return response()->json($course->load('user:id,name,username'));
    }

    public function update(Request $request, Course $course)
    {
        $user = $request->user();
        if ($user && !$user->isSuperAdmin() && $course->user_id && $course->user_id != $user->id) {
            return response()->json(['message' => 'Unauthorized to update this course.'], 403);
        }

        $course->update($request->all());
        return response()->json($course->load('user:id,name,username'));
    }

    public function destroy(Request $request, Course $course)
    {
        $user = $request->user();
        if ($user && !$user->isSuperAdmin() && $course->user_id && $course->user_id != $user->id) {
            return response()->json(['message' => 'Unauthorized to delete this course.'], 403);
        }

        $course->delete();
        return response()->json(['message' => 'Deleted']);
    }
}
