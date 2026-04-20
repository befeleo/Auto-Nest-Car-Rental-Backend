<?php
header('Content-Type: application/json');
session_start();
if (empty($_SESSION['autonest_admin'])) {
    http_response_code(401);
    echo json_encode(["status" => "error", "message" => "Unauthorized"]);
    exit;
}
include '../database/db_connect.php';

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    try {
        $id = $_POST['id'] ?? null;

        if ($id) {
            $stmt = $pdo->prepare("SELECT image_path, image_side, image_dashboard FROM cars WHERE id = ?");
            $stmt->execute([$id]);
            $car = $stmt->fetch();

            if ($car) {
                $imageColumns = ['image_path', 'image_side', 'image_dashboard'];

                foreach ($imageColumns as $column) {
                    $relativeSelector = $car[$column];

                    if (!empty($relativeSelector)) {
                        $fullPath = '../' . $relativeSelector;

                        if (file_exists($fullPath) && strpos($relativeSelector, 'placeholder.png') === false) {
                            unlink($fullPath);
                        }
                    }
                }
            }

            $sql = "DELETE FROM cars WHERE id = ?";
            $stmt = $pdo->prepare($sql);
            $stmt->execute([$id]);

            echo json_encode(["status" => "success", "message" => "Car and all associated images deleted!"]);
        }
    } catch (Exception $e) {
        echo json_encode(["status" => "error", "message" => $e->getMessage()]);
    }
}
