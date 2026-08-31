<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class RawLead extends Model
{
    protected $fillable = ['user_id', 'name', 'email', 'phone', 'source', 'status', 'dateAdded', 'notes'];

    public function user()
    {
        return $this->belongsTo(User::class);
    }
}
