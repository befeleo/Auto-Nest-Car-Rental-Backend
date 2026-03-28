<?php
header('Content-Type: application/json');
include '../database/db_connect.php';

try {
    $stmt = $pdo->query("SELECT id, car_brand AS brand, model_name AS name, price_per_day AS price, image_url AS image FROM cars ORDER BY id DESC");
    $cars = $stmt->fetchAll(PDO::FETCH_ASSOC);

    echo json_encode($cars);
} catch (Exception $e) {

    echo json_encode(["error" => $e->getMessage()]);
}
