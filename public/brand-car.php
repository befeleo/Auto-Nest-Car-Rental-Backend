<?php
header('Content-Type: application/json');

require_once __DIR__ . '/../database/db_connect.php';

$brand = trim($_GET['brand'] ?? '');

if ($brand === '') {
  http_response_code(400);

  echo json_encode([
    'error' => 'Brand parameter is required'
  ]);

  exit;
}

try {

  $sql = "SELECT id, brand, name, price, image_path AS image, bodyType, fuelType, transmission, seats, isPopular, isLuxury, isUsed FROM cars WHERE LOWER(brand) = LOWER(?) ORDER BY id DESC";

  $stmt = $pdo->prepare($sql);
  $stmt->execute([$brand]);
  $cars = $stmt->fetchAll(PDO::FETCH_ASSOC);

  echo json_encode($cars);
} catch (Exception $e) {

  http_response_code(500);

  echo json_encode([
    'error' => $e->getMessage()
  ]);
}


