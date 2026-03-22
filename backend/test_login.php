<?php
require 'vendor/autoload.php';
$app = require 'bootstrap/app.php';
$app->make('Illuminate\Contracts\Console\Kernel')->bootstrap();

use Illuminate\Http\Request;
use App\Http\Controllers\Api\AuthController;

// Simulate a login request
$request = new Request();
$request->merge([
    'email' => 'benmoussarim56@gmail.com',
    'password' => 'test123456',
]);

$controller = new AuthController();
$response = $controller->login($request);

echo "Response Status: " . $response->status() . "\n";
echo "Response Body: " . json_encode($response->getData()) . "\n";
?>
