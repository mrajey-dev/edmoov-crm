<?php
use App\Models\User;
use Illuminate\Support\Facades\Hash;

$user = User::firstOrCreate(
    ["email" => "admin@edmoov.com"],
    [
        "name" => "Admin",
        "username" => "admin",
        "password" => Hash::make("admin"),
        "role" => "admin",
    ]
);

$user->username = "admin";
$user->role = "admin";
$user->password = Hash::make("admin");
$user->save();

echo "Admin seeded successfully.";
