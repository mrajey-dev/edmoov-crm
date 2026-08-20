<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class RawLead extends Model
{
    protected $fillable = ['name', 'email', 'phone', 'source', 'status', 'dateAdded', 'notes'];
}
