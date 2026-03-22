<?php
require 'vendor/autoload.php';
$app = require 'bootstrap/app.php';
$app->make('Illuminate\Contracts\Console\Kernel')->bootstrap();

use App\Models\User;
use Illuminate\Support\Facades\Hash;

$email = 'benmoussarim56@gmail.com';
$password = 'test123456';  // Change this to what you actually want to test

// Get user
$user = User::where('email', $email)->first();

if (!$user) {
    echo "User not found\n";
    exit;
}

// Try various common passwords
$test_passwords = [
    'password123',
    'Password123',
    'test123456',
    'Test123456',
    'password',
    'admin123',
    'swappify123',
];

foreach ($test_passwords as $test_pwd) {
    if (Hash::check($test_pwd, $user->password)) {
        echo "Password match found: " . $test_pwd . "\n";
        exit;
    }
}

echo "No password match found. Trying to set password to 'test123456'...\n";
$user->update(['password' => Hash::make('test123456')]);
echo "Password updated to 'test123456'\n";
?>
