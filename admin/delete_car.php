<?php
header('Content-Type: application/json');
include '../database/db_connect.php';

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    try {
        $id = $_POST['id'] ?? null;

        if (!$id) {
            echo json_encode(["status" => "error", "message" => "No ID provided"]);
            exit;
        }

        $sql = "DELETE FROM cars WHERE id = ?";
        $stmt = $pdo->prepare($sql);
        $stmt->execute([$id]);

        echo json_encode(["status" => "success", "message" => "Vehicle deleted from database"]);
    } catch (Exception $e) {
        echo json_encode(["status" => "error", "message" => $e->getMessage()]);
    }
}
