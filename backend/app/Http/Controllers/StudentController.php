<?php

namespace App\Http\Controllers;

use App\Models\Student;
use App\Models\Lead;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;

class StudentController extends Controller
{
    public function index(Request $request)
    {
        $user = $request->user();
        $query = Student::with(['documents', 'user:id,name,username'])->orderBy('id', 'desc');

        if ($user) {
            if (!$user->isSuperAdmin()) {
                $query->where('user_id', $user->id);
            } elseif ($request->filled('user_id')) {
                $query->where('user_id', $request->user_id);
            }
        }

        $students = $query->get();
        $emails = $students->pluck('email')->filter()->toArray();

        $leadsQuery = Lead::whereIn('email', $emails);
        if ($user && !$user->isSuperAdmin()) {
            $leadsQuery->where('user_id', $user->id);
        }
        $leads = $leadsQuery->get()->keyBy('email');

        $students->each(function($student) use ($leads) {
            $student->lead_type = isset($leads[$student->email]) ? $leads[$student->email]->type : null;
        });

        return response()->json($students);
    }

    public function applications(Request $request)
    {
        $user = $request->user();
        $leadsQuery = Lead::where('type', 'approved');

        if ($user) {
            if (!$user->isSuperAdmin()) {
                $leadsQuery->where('user_id', $user->id);
            } elseif ($request->filled('user_id')) {
                $leadsQuery->where('user_id', $request->user_id);
            }
        }

        $approvedLeads = $leadsQuery->get();
        $emails = $approvedLeads->pluck('email')->filter()->toArray();
        $phones = $approvedLeads->pluck('phone')->filter()->toArray();

        $studentsQuery = Student::with(['documents', 'user:id,name,username'])
            ->where(function($q) use ($emails, $phones) {
                $q->whereIn('email', $emails)
                  ->orWhereIn('phone', $phones);
            })
            ->orderBy('id', 'desc');

        if ($user) {
            if (!$user->isSuperAdmin()) {
                $studentsQuery->where('user_id', $user->id);
            } elseif ($request->filled('user_id')) {
                $studentsQuery->where('user_id', $request->user_id);
            }
        }

        $students = $studentsQuery->get();

        $students->each(function($student) {
            $student->lead_type = 'approved';
        });

        return response()->json($students);
    }

    public function store(Request $request)
    {
        $data = $request->except(['documents', 'document_names', '_method', 'lead_type']);
        $user = $request->user();

        if ($user) {
            if ($user->isSuperAdmin() && $request->filled('user_id')) {
                $data['user_id'] = $request->user_id;
            } else {
                $data['user_id'] = $user->id;
            }
        }

        $student = Student::create($data);
        $this->handleDocuments($request, $student);
        return response()->json($student->load(['documents', 'user:id,name,username']), 201);
    }

    public function show(Request $request, Student $student)
    {
        $user = $request->user();
        if ($user && !$user->isSuperAdmin() && $student->user_id != $user->id) {
            return response()->json(['message' => 'Unauthorized to view this student.'], 403);
        }

        return response()->json($student->load(['documents', 'user:id,name,username']));
    }

    public function update(Request $request, Student $student)
    {
        $user = $request->user();
        if ($user && !$user->isSuperAdmin() && $student->user_id != $user->id) {
            return response()->json(['message' => 'Unauthorized to update this student.'], 403);
        }

        $data = $request->except(['documents', 'document_names', '_method', 'lead_type']);
        $student->update($data);
        $this->handleDocuments($request, $student);
        return response()->json($student->load(['documents', 'user:id,name,username']));
    }

    public function destroy(Request $request, Student $student)
    {
        $user = $request->user();
        if ($user && !$user->isSuperAdmin() && $student->user_id != $user->id) {
            return response()->json(['message' => 'Unauthorized to delete this student.'], 403);
        }

        foreach ($student->documents as $doc) {
            Storage::disk('public')->delete($doc->file_path);
        }
        $student->delete();
        return response()->json(['message' => 'Deleted']);
    }

    public function deleteDocument(Request $request, Student $student, $documentId)
    {
        $user = $request->user();
        if ($user && !$user->isSuperAdmin() && $student->user_id != $user->id) {
            return response()->json(['message' => 'Unauthorized.'], 403);
        }

        $doc = $student->documents()->find($documentId);
        if ($doc) {
            Storage::disk('public')->delete($doc->file_path);
            $doc->delete();
            return response()->json(['message' => 'Document deleted']);
        }
        return response()->json(['message' => 'Document not found'], 404);
    }

    private function handleDocuments(Request $request, Student $student)
    {
        if ($request->hasFile('documents')) {
            $files = $request->file('documents');
            $names = $request->input('document_names', []);

            foreach ($files as $index => $file) {
                $path = $file->store('documents', 'public');
                $name = $names[$index] ?? $file->getClientOriginalName();

                $student->documents()->create([
                    'document_name' => $name,
                    'file_path' => $path
                ]);
            }
        }
    }
}
