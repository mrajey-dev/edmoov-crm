<?php
$ctrl = new App\Http\Controllers\DashboardController();
$res = $ctrl->getStats();
echo $res->content();
