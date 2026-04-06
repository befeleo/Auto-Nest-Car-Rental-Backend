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

        $uploadDir = '../assets/images/cars/';
        if (!is_dir($uploadDir)) mkdir($uploadDir, 0777, true);

        function uploadCarImage($fileKey, $suffix, $uploadDir)
        {
            if (isset($_FILES[$fileKey]) && $_FILES[$fileKey]['error'] === 0) {
                $originalName = pathinfo($_FILES[$fileKey]['name'], PATHINFO_FILENAME);
                $extension = pathinfo($_FILES[$fileKey]['name'], PATHINFO_EXTENSION);

                $finalName = $originalName . '_' . $suffix . '.' . $extension;
                $targetPath = $uploadDir . $finalName;

                if (move_uploaded_file($_FILES[$fileKey]['tmp_name'], $targetPath)) {
                    return 'assets/images/cars/' . $finalName;
                }
            }
            return null;
        }

        $pathMain = uploadCarImage('car_image_main', 'main', $uploadDir);
        $pathSide = uploadCarImage('car_image_side', 'side', $uploadDir);
        $pathDash = uploadCarImage('car_image_dashboard', 'dashboard', $uploadDir);

        if ($id) {
            $sql = "UPDATE cars SET brand=?, name=?, price=?, bodyType=?, fuelType=?, transmission=?, isUsed=?, isPopular=?, isLuxury=?, features=?";
            $params = [$brand, $name, $price, $bodyType, $fuelType, $transmission, $isUsed, $isPopular, $isLuxury, $features];

            if ($pathMain) {
                $sql .= ", image_path=?";
                $params[] = $pathMain;
            }
            if ($pathSide) {
                $sql .= ", image_side=?";
                $params[] = $pathSide;
            }
            if ($pathDash) {
                $sql .= ", image_dashboard=?";
                $params[] = $pathDash;
            }
            $sql .= " WHERE id=?";
            $params[] = $id;

            $stmt = $pdo->prepare($sql);
            $stmt->execute($params);
            $msg = "Vehicle updated!";
        } else {
            $sql = "INSERT INTO cars (brand, name, price, bodyType, fuelType, transmission, isUsed, isPopular, isLuxury, features, image_path, image_side, image_dashboard) 
                    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)";
            $stmt = $pdo->prepare($sql);
            $stmt->execute([
                $brand,
                $name,
                $price,
                $bodyType,
                $fuelType,
                $transmission,
                $isUsed,
                $isPopular,
                $isLuxury,
                $features,
                $pathMain ?? 'assets/images/cars/placeholder.png',
                $pathSide,
                $pathDash
            ]);
            $msg = "New vehicle added!";
        }

        echo json_encode(["status" => "success", "message" => $msg]);
    } catch (Exception $e) {
        echo json_encode(["status" => "error", "message" => $e->getMessage()]);
    }
}                                                                      