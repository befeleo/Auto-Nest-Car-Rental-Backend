<?php
header('Content-Type: application/json');
session_start();
if (empty($_SESSION['autonest_admin'])) {
    http_response_code(401);
    echo json_encode(["status" => "error", "message" => "Unauthorized"]);
    exit;
}

require_once __DIR__ . '/../database/db_connect.php';

try {
    $stmt = $pdo->query("
        SELECT
            b.*,
            c.brand AS car_brand,
            c.name AS car_model
        FROM bookings b
        LEFT JOIN cars c ON c.id = b.car_id
        ORDER BY b.id DESC
    ");
    echo json_encode([
        "status" => "success",
        "bookings" => $stmt->fetchAll(PDO::FETCH_ASSOC)
    ]);
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(["status" => "error", "message" => $e->getMessage()]);
}
