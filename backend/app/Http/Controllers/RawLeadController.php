<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;

use App\Models\RawLead;

class RawLeadController extends Controller
{
    public function index()
    {
        return response()->json(RawLead::all());
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
        ]);

        $rawLead = RawLead::create($validated);
        return response()->json($rawLead, 201);
    }

    public function update(Request $request, $id)
    {
        $rawLead = RawLead::findOrFail($id);
        $rawLead->update($request->all());
        return response()->json($rawLead);
    }

    public function destroy($id)
    {
        $rawLead = RawLead::findOrFail($id);
        $rawLead->delete();
        return response()->json(null, 204);
    }
}
