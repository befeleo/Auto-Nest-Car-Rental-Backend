<?php
include '../database/db_connect.php';
header('Content-Type: application/json');

$stats = [
    "totalCars" => 0,
    "totalBookings" => 0,
    "availableCars" => 0,
    "totalCustomers" => 0
];

try {
    // 1. Total Cars
    $carCount = $pdo->query("SELECT COUNT(*) FROM cars");
    $stats['totalCars'] = (int)$carCount->fetchColumn();

    // 2. Total Bookings - Wrapped in a check to see if table exists
    $checkBookings = $pdo->query("SHOW TABLES LIKE 'bookings'")->rowCount();
    if ($checkBookings > 0) {
        $stats['totalBookings'] = (int)$pdo->query("SELECT COUNT(*) FROM bookings")->fetchColumn();
    }

    // 3. Available Cars - Check if 'status' column exists first
    $checkStatusCol = $pdo->query("SHOW COLUMNS FROM cars LIKE 'status'")->rowCount();
    if ($checkStatusCol > 0) {
        $stats['availableCars'] = (int)$pdo->query("SELECT COUNT(*) FROM cars WHERE status='available'")->fetchColumn();
    } else {
        $stats['availableCars'] = $stats['totalCars']; // Fallback
    }

    $checkUsers = $pdo->query("SHOW TABLES LIKE 'users'")->rowCount();
    if ($checkUsers > 0) {
        $stats['totalCustomers'] = (int)$pdo->query("SELECT COUNT(*) FROM users WHERE role='customer'")->fetchColumn();
    } else {
        // Count unique customer emails from the bookings table instead!
        $customerCount = $pdo->query("SELECT COUNT(DISTINCT email) FROM bookings");
        $stats['totalCustomers'] = (int)$customerCount->fetchColumn();
    }

    echo json_encode(["stats" => $stats]);
} catch (PDOException $e) {
    http_response_code(500);
    echo json_encode(["error" => "Database error: " . $e->getMessage()]);
}
