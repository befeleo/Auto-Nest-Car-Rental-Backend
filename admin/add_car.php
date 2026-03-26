<?php
header('Content-Type: application/json');
include './database/db_connect.php';

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    try {
        $id = !empty($_POST['id']) ? $_POST['id'] : null;

        $brand = $_POST['brand'] ?? '';
        $name = $_POST['name'] ?? '';
        $price = $_POST['price'] ?? 0;
        $bodyType = $_POST['bodyType'] ?? '';
        $isUsed = isset($_POST['isUsed']) ? 1 : 0;
        $features = $_POST['features'] ?? '';

        if ($id) {
            $sql = "UPDATE cars SET brand=?, name=?, price=?, bodyType=?, isUsed=?, features=? WHERE id=?";
            $stmt = $pdo->prepare($sql);
            $stmt->execute([$brand, $name, $price, $bodyType, $isUsed, $features, $id]);
            $msg = "Vehicle updated successfully!";
        } else {
            $sql = "INSERT INTO cars (brand, name, price, bodyType, isUsed, features, image_path) 
                    VALUES (?, ?, ?, ?, ?, ?, 'assets/images/car_images/placeholder.png')";
            $stmt = $pdo->prepare($sql);
            $stmt->execute([$brand, $name, $price, $bodyType, $isUsed, $features]);
            $msg = "New vehicle added!";
        }

        echo json_encode(["status" => "success", "message" => $msg]);
    } catch (Exception $e) {
        echo json_encode(["status" => "error", "message" => $e->getMessage()]);
    }
}
