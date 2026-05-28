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

    // 3. Available Cars
    $checkStatusCol = $pdo->query("SHOW COLUMNS FROM cars LIKE 'status'")->rowCount();
    if ($checkStatusCol === 0) {
        $pdo->exec("ALTER TABLE cars ADD COLUMN status VARCHAR(20) NOT NULL DEFAULT 'available'");
    }
    $stats['availableCars'] = (int)$pdo->query("SELECT COUNT(*) FROM cars WHERE status='available'")->fetchColumn();

    // 4. Total Customers
    $checkUsers = $pdo->query("SHOW TABLES LIKE 'users'")->rowCount();
    if ($checkUsers > 0) {
        $stats['totalCustomers'] = (int)$pdo->query("SELECT COUNT(*) FROM users WHERE role='customer'")->fetchColumn();
    } else {
        $customerCount = $pdo->query("SELECT COUNT(DISTINCT email) FROM bookings");
        $stats['totalCustomers'] = (int)$customerCount->fetchColumn();
    }

 
    $monthlyData = array_fill(0, 12, 0); 

    if ($checkBookings > 0) {
        $chartQuery = $pdo->query("
            SELECT MONTH(created_at) as booking_month, COUNT(*) as booking_count 
            FROM bookings 
            WHERE YEAR(created_at) = YEAR(CURRENT_DATE())
            GROUP BY MONTH(created_at)
        ");

        while ($row = $chartQuery->fetch(PDO::FETCH_ASSOC)) {
            $monthIndex = (int)$row['booking_month'] - 1; // Converts Month 1-12 to Index 0-11
            $monthlyData[$monthIndex] = (int)$row['booking_count'];
        }
    }

    // Output both our text stats and our new chart data array
    echo json_encode([
        "stats" => $stats,
        "monthlyBookings" => $monthlyData
    ]);
} catch (PDOException $e) {
    http_response_code(500);
    echo json_encode(["error" => "Database error: " . $e->getMessage()]);
}
