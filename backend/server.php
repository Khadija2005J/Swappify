<?php
// Direct server runner to bypass Laravel's Process class issues on Windows

$uri = $_SERVER["REQUEST_URI"] ?? '/';
$requested_file = realpath(ltrim($uri, '/'));
$static_dir = realpath(__DIR__ . '/public');

// Serve static files directly
if ($requested_file !== false && strpos($requested_file, $static_dir) === 0 && is_file($requested_file)) {
    return false;
}

// Route everything else through index.php
require_once __DIR__ . '/public/index.php';
