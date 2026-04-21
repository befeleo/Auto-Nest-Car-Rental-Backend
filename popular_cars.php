<?php
header('Content-Type: application/json');
include 'database/db_connect.php';

try {
    $sql = "SELECT id, brand, name, price, image_path AS image FROM cars WHERE isPopular = 1 ORDER BY id DESC LIMIT 8";
    $stmt = $pdo->query($sql);
    $cars = $stmt->fetchAll(PDO::FETCH_ASSOC);

    echo json_encode($cars);
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(["error" => $e->getMessage()]);
}
