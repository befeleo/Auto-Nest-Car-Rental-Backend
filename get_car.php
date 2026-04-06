<?php
header('Content-Type: application/json');
include 'database/db_connect.php';

$idRaw = $_GET['id'] ?? null;
if ($idRaw === null || $idRaw === '') {
    http_response_code(400);
    echo json_encode(["error" => "Missing id"]);
    exit;
}

if (!ctype_digit((string)$idRaw)) {
    http_response_code(400);
    echo json_encode(["error" => "Invalid id"]);
    exit;
}

$id = (int)$idRaw;

try {
    $stmt = $pdo->prepare("SELECT * FROM cars WHERE id = ? LIMIT 1");
    $stmt->execute([$id]);
    $car = $stmt->fetch(PDO::FETCH_ASSOC);

    if (!$car) {
        http_response_code(404);
        echo json_encode(["error" => "Car not found"]);
        exit;
    }

    echo json_encode($car);
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(["error" => $e->getMessage()]);
}

