<?php
// Test the /api/me endpoint with a valid token

$email = 'benmoussarim56@gmail.com';
$password = 'test123456';

// Step 1: Login to get token
$loginData = json_encode([
    'email' => $email,
    'password' => $password
]);

$ch = curl_init('http://127.0.0.1:8081/api/login');
curl_setopt($ch, CURLOPT_POST, 1);
curl_setopt($ch, CURLOPT_POSTFIELDS, $loginData);
curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
curl_setopt($ch, CURLOPT_HTTPHEADER, [
    'Content-Type: application/json',
    'Accept: application/json'
]);

$loginResponse = curl_exec($ch);
$loginStatus = curl_getinfo($ch, CURLINFO_HTTP_CODE);
curl_close($ch);

echo "Login Response Status: $loginStatus\n";
$loginData = json_decode($loginResponse, true);

if (!isset($loginData['token'])) {
    echo "ERROR: No token in login response\n";
    echo "Response: $loginResponse\n";
    exit;
}

$token = $loginData['token'];
echo "Token: $token\n\n";

// Step 2: Test /api/me with the token
$ch = curl_init('http://127.0.0.1:8081/api/me');
curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
curl_setopt($ch, CURLOPT_HTTPHEADER, [
    'Accept: application/json',
    'Authorization: Bearer ' . $token
]);

$meResponse = curl_exec($ch);
$meStatus = curl_getinfo($ch, CURLINFO_HTTP_CODE);
curl_close($ch);

echo "/api/me Response Status: $meStatus\n";
echo "/api/me Response Body: $meResponse\n";
?>
