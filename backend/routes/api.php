<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\LeadController;
use App\Http\Controllers\StudentController;
use App\Http\Controllers\CourseController;
use App\Http\Controllers\UniversityController;
use App\Http\Controllers\DashboardController;
use App\Http\Controllers\AuthController;

Route::post('/login', [AuthController::class, 'login']);
Route::middleware('auth:sanctum')->post('/logout', [AuthController::class, 'logout']);

Route::get('/user', function (Request $request) {
    return $request->user();
})->middleware('auth:sanctum');

use App\Http\Controllers\RawLeadController;

Route::apiResource('leads', LeadController::class);
Route::post('raw-leads/bulk-delete', [RawLeadController::class, 'bulkDestroy']);
Route::apiResource('raw-leads', RawLeadController::class);
Route::apiResource('students', StudentController::class);
Route::delete('students/{student}/documents/{document}', [StudentController::class, 'deleteDocument']);
Route::get('applications', [StudentController::class, 'applications']);
Route::apiResource('courses', CourseController::class);
Route::apiResource('universities', UniversityController::class);

Route::get('dashboard/stats', [DashboardController::class, 'getStats']);
Route::get('dashboard/enrollments', [DashboardController::class, 'getEnrollments']);
