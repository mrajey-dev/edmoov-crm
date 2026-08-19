<?php
namespace App\Http\Controllers;
use App\Models\University;
use Illuminate\Http\Request;

class UniversityController extends Controller
{
    public function index() { return University::orderBy('id', 'desc')->get(); }
    public function store(Request $request) { return University::create($request->all()); }
    public function show(University $university) { return $university; }
    public function update(Request $request, University $university) { $university->update($request->all()); return $university; }
    public function destroy(University $university) { $university->delete(); return response()->json(['message' => 'Deleted']); }
}
