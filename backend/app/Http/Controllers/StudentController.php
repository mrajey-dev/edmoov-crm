<?php
namespace App\Http\Controllers;
use App\Models\Student;
use Illuminate\Http\Request;

class StudentController extends Controller
{
    public function index() { 
        $students = Student::orderBy('id', 'desc')->get();
        $leads = \App\Models\Lead::whereIn('email', $students->pluck('email'))->get()->keyBy('email');
        
        $students->each(function($student) use ($leads) {
            $student->lead_type = isset($leads[$student->email]) ? $leads[$student->email]->type : null;
        });
        
        return $students;
    }
    
    public function applications() {
        $approvedLeads = \App\Models\Lead::where('type', 'approved')->get();
        $emails = $approvedLeads->pluck('email')->filter()->toArray();
        $phones = $approvedLeads->pluck('phone')->filter()->toArray();

        $students = Student::whereIn('email', $emails)
            ->orWhereIn('phone', $phones)
            ->orderBy('id', 'desc')
            ->get();
            
        $students->each(function($student) {
            $student->lead_type = 'approved';
        });
        
        return $students;
    }
    
    public function store(Request $request) { 
        $student = Student::create($request->except(['documents', 'document_names', '_method'])); 
        $this->handleDocuments($request, $student);
        return $student->load('documents'); 
    }
    
    public function show(Student $student) { return $student; }
    
    public function update(Request $request, Student $student) { 
        $student->update($request->except(['documents', 'document_names', '_method'])); 
        $this->handleDocuments($request, $student);
        return $student->load('documents'); 
    }
    
    public function destroy(Student $student) { 
        foreach($student->documents as $doc) {
            \Illuminate\Support\Facades\Storage::disk('public')->delete($doc->file_path);
        }
        $student->delete(); 
        return response()->json(['message' => 'Deleted']); 
    }

    private function handleDocuments(Request $request, Student $student) {
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
