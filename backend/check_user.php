<?php
require 'vendor/autoload.php';
$app = require 'bootstrap/app.php';
$app->make('Illuminate\Contracts\Console\Kernel')->bootstrap();

use App\Models\User;
use Illuminate\Support\Facades\Hash;

$email = 'benmoussarim56@gmail.com';
$password = 'test123456';

// Check if user exists
$user = User::where('email', $email)->first();

if ($user) {
    echo "User exists: " . $user->email . "\n";
    echo "User ID: " . $user->id . "\n";
} else {
    echo "User does not exist. Creating new user...\n";
    $user = User::create([
        'name' => 'Benmoussarim',
        'email' => $email,
        'password' => Hash::make($password),
    ]);
    echo "User created successfully!\n";
    echo "Email: " . $user->email . "\n";
    echo "Password: " . $password . "\n";
}
?>
