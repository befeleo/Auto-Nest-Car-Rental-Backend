<?php
header('Content-Type: application/json');
session_start();
if (empty($_SESSION['autonest_admin'])) {
    http_response_code(401);
    echo json_encode(["status" => "error", "message" => "Unauthorized"]);
    exit;
}

require_once __DIR__ . '/../database/db_connect.php';

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(["status" => "error", "message" => "Invalid request method"]);
    exit;
}

$id = isset($_POST['id']) ? (int)$_POST['id'] : 0;
$status = strtolower(trim((string)($_POST['status'] ?? '')));
$allowedStatuses = ['pending', 'confirmed', 'cancelled'];

if ($id <= 0) {
    echo json_encode(["status" => "error", "message" => "Invalid booking id"]);
    exit;
}

if (!in_array($status, $allowedStatuses, true)) {
    echo json_encode(["status" => "error", "message" => "Invalid booking status"]);
    exit;
}

try {
    $stmt = $pdo->prepare("UPDATE bookings SET status = ? WHERE id = ?");
    $stmt->execute([$status, $id]);

    if ($stmt->rowCount() === 0) {
        $exists = $pdo->prepare("SELECT id FROM bookings WHERE id = ? LIMIT 1");
        $exists->execute([$id]);
        if (!$exists->fetchColumn()) {
            echo json_encode(["status" => "error", "message" => "Booking not found"]);
            exit;
        }
    }

    echo json_encode([
        "status" => "success",
        "message" => "Booking status updated",
        "booking" => [
            "id" => $id,
            "status" => $status
        ]
    ]);
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(["status" => "error", "message" => $e->getMessage()]);
}
