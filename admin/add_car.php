<?php
header('Content-Type: application/json');
include '../database/db_connect.php';

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    try {
        $id = !empty($_POST['id']) ? $_POST['id'] : null;

        $brand = $_POST['brand'] ?? '';
        $name = $_POST['name'] ?? '';
        $price = $_POST['price'] ?? 0;
        $bodyType = $_POST['bodyType'] ?? '';
        $fuelType = $_POST['fuelType'] ?? '';
        $transmission = $_POST['transmission'] ?? '';
        $isUsed = isset($_POST['isUsed']) ? 1 : 0;
        $isPopular = isset($_POST['isPopular']) ? 1 : 0;
        $isLuxury = isset($_POST['isLuxury']) ? 1 : 0;
        $features = $_POST['features'] ?? '';


        if ($id) {
            $sql = "UPDATE cars SET brand=?, name=?, price=?, bodyType=?, fuelType=?, transmission=?, isUsed=?, isPopular=?, isLuxury=?, features=? WHERE id=?";
            $stmt = $pdo->prepare($sql);
            $stmt->execute([$brand, $name, $price, $bodyType, $fuelType, $transmission, $isUsed, $isPopular, $isLuxury, $features, $id]);
            $msg = "Vehicle updated successfully!";
        } else {
            $sql = "INSERT INTO cars (brand, name, price, bodyType, fuelType, transmission, isUsed, isPopular, isLuxury, features, image_path) 
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'assets/images/car_images/placeholder.png')";
            $stmt = $pdo->prepare($sql);
            $stmt->execute([$brand, $name, $price, $bodyType, $fuelType, $transmission, $isUsed, $isPopular, $isLuxury, $features]);
            $msg = "New vehicle added!";
        }

        echo json_encode(["status" => "success", "message" => $msg]);
    } catch (Exception $e) {
        echo json_encode(["status" => "error", "message" => $e->getMessage()]);
    }
}
