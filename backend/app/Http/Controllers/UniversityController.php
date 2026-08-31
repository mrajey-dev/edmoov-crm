<?php

namespace App\Http\Controllers;

use App\Models\University;
use Illuminate\Http\Request;

class UniversityController extends Controller
{
    public function index(Request $request)
    {
        return University::with('user:id,name,username')->orderBy('id', 'desc')->get();
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

        $university = University::create($data);
        return response()->json($university->load('user:id,name,username'), 201);
    }

    public function show(University $university)
    {
        return response()->json($university->load('user:id,name,username'));
    }

    public function update(Request $request, University $university)
    {
        $user = $request->user();
        if ($user && !$user->isSuperAdmin() && $university->user_id && $university->user_id != $user->id) {
            return response()->json(['message' => 'Unauthorized to update this university.'], 403);
        }

        $university->update($request->all());
        return response()->json($university->load('user:id,name,username'));
    }

    public function destroy(Request $request, University $university)
    {
        $user = $request->user();
        if ($user && !$user->isSuperAdmin() && $university->user_id && $university->user_id != $user->id) {
            return response()->json(['message' => 'Unauthorized to delete this university.'], 403);
        }

        $university->delete();
        return response()->json(['message' => 'Deleted']);
    }
}
