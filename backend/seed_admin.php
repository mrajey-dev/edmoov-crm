<?php
use App\Models\User;
use Illuminate\Support\Facades\Hash;

$user = User::firstOrCreate(
    ["email" => "admin@edmoov.com"],
    [
        "name" => "Super Admin",
        "username" => "admin",
        "password" => Hash::make("admin"),
        "role" => "super_admin",
    ]
);

$user->name = "Super Admin";
$user->username = "admin";
$user->role = "super_admin";
$user->password = Hash::make("admin");
$user->save();

echo "Admin seeded successfully.";
