<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\LeadController;
use App\Http\Controllers\StudentController;
use App\Http\Controllers\CourseController;
use App\Http\Controllers\UniversityController;
use App\Http\Controllers\DashboardController;
use App\Http\Controllers\AuthController;
use App\Http\Controllers\RawLeadController;
use App\Http\Controllers\AdminUserController;

Route::post('/login', [AuthController::class, 'login']);

Route::middleware('auth:sanctum')->group(function () {
    Route::post('/logout', [AuthController::class, 'logout']);
    Route::get('/user', function (Request $request) {
        return $request->user();
    });

    // Admin Management (Super Admin only)
    Route::get('/admin/users', [AdminUserController::class, 'index']);
    Route::get('/admin/users-list', [AdminUserController::class, 'listSimple']);
    Route::post('/admin/users', [AdminUserController::class, 'store']);
    Route::put('/admin/users/{user}', [AdminUserController::class, 'update']);
    Route::delete('/admin/users/{user}', [AdminUserController::class, 'destroy']);

    // CRM Resources
    Route::apiResource('leads', LeadController::class);
    Route::post('raw-leads/bulk-delete', [RawLeadController::class, 'bulkDestroy']);
    Route::apiResource('raw-leads', RawLeadController::class);
    Route::apiResource('students', StudentController::class);
    Route::delete('students/{student}/documents/{document}', [StudentController::class, 'deleteDocument']);
    Route::get('applications', [StudentController::class, 'applications']);
    Route::apiResource('courses', CourseController::class);
    Route::apiResource('universities', UniversityController::class);

    // Dashboard
    Route::get('dashboard/stats', [DashboardController::class, 'getStats']);
    Route::get('dashboard/enrollments', [DashboardController::class, 'getEnrollments']);
});
