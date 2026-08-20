<?php
use App\Models\Lead;
$leads = Lead::select('created_at')->get();
foreach($leads as $l) {
    echo $l->created_at . "\n";
}
