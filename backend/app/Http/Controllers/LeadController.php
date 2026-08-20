<?php
namespace App\Http\Controllers;
use App\Models\Lead;
use Illuminate\Http\Request;

class LeadController extends Controller
{
    public function index() { 
        $leads = Lead::orderBy('id', 'desc')->get(); 
        $emails = $leads->pluck('email')->toArray();
        $students = \App\Models\Student::whereIn('email', $emails)->get()->keyBy('email');
        foreach ($leads as $lead) {
            $lead->student = $students->get($lead->email);
        }
        return $leads;
    }
    public function store(Request $request) { 
        $data = $request->all();
        if (isset($data['notes']) && is_array($data['notes'])) {
            $data['notes'] = json_encode($data['notes']);
        }
        return Lead::create($data); 
    }
    public function show(Lead $lead) { return $lead; }
    public function update(Request $request, Lead $lead) { 
        $data = $request->all();
        if (isset($data['notes']) && is_array($data['notes'])) {
            $data['notes'] = json_encode($data['notes']);
        }
        $lead->update($data); 
        return $lead; 
    }
    public function destroy(Lead $lead) { $lead->delete(); return response()->json(['message' => 'Deleted']); }
}
