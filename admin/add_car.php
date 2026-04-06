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
        $imagePath = 'assets/images/cars/placeholder.png';

        if (isset($_FILES['car_image']) && $_FILES['car_image']['error'] === 0) {
            $uploadDir = '../assets/images/cars/';
            if (!is_dir($uploadDir)) mkdir($uploadDir, 0777, true);

            $fileExtension = pathinfo($_FILES['car_image']['name'], PATHINFO_EXTENSION);
            $newFileName = time() . '_' . bin2hex(random_bytes(4)) . '.' . $fileExtension;
            $targetFilePath = $uploadDir . $newFileName;

            if (move_uploaded_file($_FILES['car_image']['tmp_name'], $targetFilePath)) {
                $imagePath = 'assets/images/cars/' . $newFileName;
            }
        }

        if ($id) {
            $sql = "UPDATE cars SET brand=?, name=?, price=?, bodyType=?, fuelType=?, transmission=?, isUsed=?, isPopular=?, isLuxury=?, features=?";
            $params = [$brand, $name, $price, $bodyType, $fuelType, $transmission, $isUsed, $isPopular, $isLuxury, $features];

            if (isset($_FILES['car_image']) && $_FILES['car_image']['error'] === 0) {
                $sql .= ", image_path=?";
                $params[] = $imagePath;
            }

            $sql .= " WHERE id=?";
            $params[] = $id;

            $stmt = $pdo->prepare($sql);
            $stmt->execute($params);
            $msg = "Vehicle updated successfully!";
        } else {
            $sql = "INSERT INTO cars (brand, name, price, bodyType, fuelType, transmission, isUsed, isPopular, isLuxury, features, image_path) 
                    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)";
            $stmt = $pdo->prepare($sql);
            $stmt->execute([$brand, $name, $price, $bodyType, $fuelType, $transmission, $isUsed, $isPopular, $isLuxury, $features, $imagePath]);
            $msg = "New vehicle added!";
        }

        echo json_encode(["status" => "success", "message" => $msg]);
    } catch (Exception $e) {
        echo json_encode(["status" => "error", "message" => $e->getMessage()]);
    }
}
