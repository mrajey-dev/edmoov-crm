<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\RawLead;

class RawLeadController extends Controller
{
    public function index(Request $request)
    {
        $user = $request->user();
        $query = RawLead::with('user:id,name,username')->orderBy('id', 'desc');

        if ($user) {
            if (!$user->isSuperAdmin()) {
                $query->where('user_id', $user->id);
            } elseif ($request->filled('user_id')) {
                $query->where('user_id', $request->user_id);
            }
        }

        return response()->json($query->get());
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'name' => 'nullable|string',
            'email' => 'nullable|string',
            'phone' => 'nullable|string',
            'source' => 'nullable|string',
            'status' => 'nullable|string',
            'dateAdded' => 'nullable|string',
            'notes' => 'nullable|string',
            'user_id' => 'nullable|integer',
        ]);

        $user = $request->user();
        if ($user) {
            if ($user->isSuperAdmin() && $request->filled('user_id')) {
                $validated['user_id'] = $request->user_id;
            } else {
                $validated['user_id'] = $user->id;
            }
        }

        $rawLead = RawLead::create($validated);
        return response()->json($rawLead->load('user:id,name,username'), 201);
    }

    public function update(Request $request, $id)
    {
        $rawLead = RawLead::findOrFail($id);
        $user = $request->user();

        if ($user && !$user->isSuperAdmin() && $rawLead->user_id != $user->id) {
            return response()->json(['message' => 'Unauthorized to update this lead.'], 403);
        }

        $rawLead->update($request->all());
        return response()->json($rawLead->load('user:id,name,username'));
    }

    public function destroy(Request $request, $id)
    {
        $rawLead = RawLead::findOrFail($id);
        $user = $request->user();

        if ($user && !$user->isSuperAdmin() && $rawLead->user_id != $user->id) {
            return response()->json(['message' => 'Unauthorized to delete this lead.'], 403);
        }

        $rawLead->delete();
        return response()->json(null, 204);
    }

    public function bulkDestroy(Request $request)
    {
        $validated = $request->validate([
            'ids' => 'required|array',
            'ids.*' => 'integer|exists:raw_leads,id'
        ]);

        $user = $request->user();
        $query = RawLead::whereIn('id', $validated['ids']);

        if ($user && !$user->isSuperAdmin()) {
            $query->where('user_id', $user->id);
        }

        $deletedCount = $query->delete();

        return response()->json([
            'message' => 'Leads deleted successfully',
            'count' => $deletedCount
        ]);
    }
}
