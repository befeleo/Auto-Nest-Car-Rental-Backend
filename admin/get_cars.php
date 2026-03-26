<?php
header('Content-Type: application/json');
include './database/db_connect.php'; 

try {
    $stmt = $pdo->query("SELECT * FROM cars ORDER BY id DESC");
    $cars = $stmt->fetchAll(PDO::FETCH_ASSOC);

    echo json_encode($cars);
} catch (Exception $e) {

    echo json_encode(["error" => $e->getMessage()]);
}
