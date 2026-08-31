<?php

namespace App\Http\Controllers;

use App\Models\Lead;
use App\Models\Student;
use Illuminate\Http\Request;

class LeadController extends Controller
{
    public function index(Request $request)
    {
        $user = $request->user();
        $query = Lead::with('user:id,name,username')->orderBy('id', 'desc');

        if ($user) {
            if (!$user->isSuperAdmin()) {
                $query->where('user_id', $user->id);
            } elseif ($request->filled('user_id')) {
                $query->where('user_id', $request->user_id);
            }
        }

        $leads = $query->get();
        $emails = $leads->pluck('email')->filter()->toArray();
        $students = Student::whereIn('email', $emails)->get()->keyBy('email');

        foreach ($leads as $lead) {
            $lead->student = $students->get($lead->email);
        }

        return response()->json($leads);
    }

    public function store(Request $request)
    {
        $data = $request->all();

        if (isset($data['notes']) && is_array($data['notes'])) {
            $data['notes'] = json_encode($data['notes']);
        }

        $user = $request->user();
        if ($user) {
            if ($user->isSuperAdmin() && $request->filled('user_id')) {
                $data['user_id'] = $request->user_id;
            } else {
                $data['user_id'] = $user->id;
            }
        }

        $lead = Lead::create($data);
        return response()->json($lead->load('user:id,name,username'), 201);
    }

    public function show(Request $request, Lead $lead)
    {
        $user = $request->user();
        if ($user && !$user->isSuperAdmin() && $lead->user_id != $user->id) {
            return response()->json(['message' => 'Unauthorized to view this lead.'], 403);
        }

        return response()->json($lead->load('user:id,name,username'));
    }

    public function update(Request $request, Lead $lead)
    {
        $user = $request->user();
        if ($user && !$user->isSuperAdmin() && $lead->user_id != $user->id) {
            return response()->json(['message' => 'Unauthorized to update this lead.'], 403);
        }

        $data = $request->all();
        if (isset($data['notes']) && is_array($data['notes'])) {
            $data['notes'] = json_encode($data['notes']);
        }

        $lead->update($data);
        return response()->json($lead->load('user:id,name,username'));
    }

    public function destroy(Request $request, Lead $lead)
    {
        $user = $request->user();
        if ($user && !$user->isSuperAdmin() && $lead->user_id != $user->id) {
            return response()->json(['message' => 'Unauthorized to delete this lead.'], 403);
        }

        $lead->delete();
        return response()->json(['message' => 'Deleted']);
    }
}
