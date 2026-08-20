<?php
$ctrl = new App\Http\Controllers\DashboardController();
$req = Illuminate\Http\Request::create('/api/dashboard/revenue?period=1m', 'GET');
$res = $ctrl->getRevenue($req);
echo $res->content();
