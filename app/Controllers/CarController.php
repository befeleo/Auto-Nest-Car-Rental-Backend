<?php
header('Content-Type: application/json');
require 'database/db_connect.php';

function ensureCarStatusColumnExists(PDO $pdo): void
{
    $hasStatus = $pdo->query("SHOW COLUMNS FROM cars LIKE 'status'")->rowCount();
    if ($hasStatus === 0) {
        $pdo->exec("ALTER TABLE cars ADD COLUMN status VARCHAR(20) NOT NULL DEFAULT 'available' AFTER image_path");
    }
}

$brand = isset($_GET['brand']) ? trim($_GET['brand']) : '';
$preference = isset($_GET['preference']) ? strtolower(trim($_GET['preference'])) : '';

$filterMap = [
    'range-1' => 'price < 2000',
    'range-2' => 'price BETWEEN 2000 AND 3000',
    'range-3' => 'price BETWEEN 3000 AND 4000',
    'range-4' => 'price BETWEEN 4000 AND 5000',
    'range-5' => 'price BETWEEN 5000 AND 6000',
    'range-6' => 'price > 6000',

    'petrol' => "LOWER(fuelType) = 'petrol'",
    'diesel' => "LOWER(fuelType) = 'diesel'",
    'electric' => "LOWER(fuelType) = 'electric'",
    'hybrid' => "LOWER(fuelType) = 'hybrid'",

    'sedan' => "LOWER(bodyType) = 'sedan'",
    'suv' => "LOWER(bodyType) = 'suv'",
    'pickup' => "LOWER(bodyType) = 'pickup'",
    'hatchback' => "LOWER(bodyType) = 'hatchback'",

    'popular' => 'isPopular = 1',
    'luxury' => 'isLuxury = 1',
    'used' => 'isUsed = 1',
    'new' => 'isUsed = 0',

    'automatic' => "LOWER(transmission) LIKE '%automatic%'",
    'manual' => "LOWER(transmission) LIKE '%manual%'",

    'seats-5' => 'CAST(seats AS UNSIGNED) = 5',
    'seats-7' => 'CAST(seats AS UNSIGNED) = 7'
];

try {
    ensureCarStatusColumnExists($pdo);

    if ($brand !== '') {
        $sql = "SELECT * FROM cars WHERE LOWER(brand) = LOWER(?) AND status = 'available' ORDER BY id DESC";
        $stmt = $pdo->prepare($sql);
        $stmt->execute([$brand]);
    } elseif ($preference !== '') {
        if (!isset($filterMap[$preference])) {
            http_response_code(400);
            echo json_encode(['error' => 'Invalid preference filter']);
            exit;
        }

        $sql = "SELECT * FROM cars WHERE status = 'available' AND {$filterMap[$preference]} ORDER BY id DESC";
        $stmt = $pdo->query($sql);
    } else {
        $stmt = $pdo->query("SELECT * FROM cars WHERE status = 'available' ORDER BY id DESC");
    }

    $cars = $stmt->fetchAll(PDO::FETCH_ASSOC);
    echo json_encode($cars);
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(['error' => $e->getMessage()]);
}
