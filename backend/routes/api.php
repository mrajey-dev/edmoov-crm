<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\LeadController;
use App\Http\Controllers\StudentController;
use App\Http\Controllers\CourseController;
use App\Http\Controllers\UniversityController;
use App\Http\Controllers\DashboardController;

Route::get('/user', function (Request $request) {
    return $request->user();
})->middleware('auth:sanctum');

Route::apiResource('leads', LeadController::class);
Route::apiResource('students', StudentController::class);
Route::delete('students/{student}/documents/{document}', [StudentController::class, 'deleteDocument']);
Route::get('applications', [StudentController::class, 'applications']);
Route::apiResource('courses', CourseController::class);
Route::apiResource('universities', UniversityController::class);

Route::get('dashboard/stats', [DashboardController::class, 'getStats']);
Route::get('dashboard/enrollments', [DashboardController::class, 'getEnrollments']);
