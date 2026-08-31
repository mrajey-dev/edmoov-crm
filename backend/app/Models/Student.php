<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Student extends Model
{
    protected $guarded = [];
    protected $with = ['documents'];

    public function documents()
    {
        return $this->hasMany(StudentDocument::class);
    }

    public function user()
    {
        return $this->belongsTo(User::class);
    }
}
