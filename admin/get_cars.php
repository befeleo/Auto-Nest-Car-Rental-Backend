<?php
header('Content-Type: application/json');
session_start();
if (empty($_SESSION['autonest_admin'])) {
    http_response_code(401);
    echo json_encode(["status" => "error", "message" => "Unauthorized"]);
    exit;
}
require_once '../database/db_connect.php';

try {
    $stmt = $pdo->query("SELECT * FROM cars ORDER BY id DESC");
    $cars = $stmt->fetchAll(PDO::FETCH_ASSOC);

    echo json_encode($cars);
} catch (Exception $e) {

    echo json_encode(["error" => $e->getMessage()]);
}
