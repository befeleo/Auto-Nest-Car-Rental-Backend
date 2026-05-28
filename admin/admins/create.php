<?php
header('Content-Type: application/json');
session_start();

if (empty($_SESSION['autonest_admin'])) {
    http_response_code(401);
    echo json_encode(["status" => "error", "message" => "Unauthorized access"]);
    exit;
}

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(["status" => "error", "message" => "Invalid request method"]);
    exit;
}

include '../../database/db_connect.php';

$adminName = trim(strip_tags($_POST['adminName'] ?? ''));
$adminName = preg_replace('/\s+/', ' ', $adminName);
$adminEmail = strtolower(trim($_POST['adminEmail'] ?? ''));
$adminPassword = $_POST['adminPassword'] ?? '';

if (!filter_var($adminEmail, FILTER_VALIDATE_EMAIL)) {
    echo json_encode(["status" => "error", "message" => "Please enter a valid email address"]);
    exit;
}

if ($adminName === '' || $adminEmail === '' || $adminPassword === '') {
    echo json_encode(["status" => "error", "message" => "All fields are required"]);
    exit;
}

if (strlen($adminPassword) < 6) {
    echo json_encode(["status" => "error", "message" => "Password must be at least 6 characters long"]);
    exit;
}

try {
    $checkStmt = $pdo->prepare("SELECT email FROM admin_users WHERE email = ? LIMIT 1");
    $checkStmt->execute([$adminEmail]);
    if ($checkStmt->fetch()) {
        echo json_encode(["status" => "error", "message" => "An administrator with this email already exists"]);
        exit;
    }

    $hashedPassword = password_hash($adminPassword, PASSWORD_DEFAULT);
    $sql = "INSERT INTO admin_users (name, email, password) VALUES (?, ?, ?)";
    $insertStmt = $pdo->prepare($sql);
    $insertStmt->execute([$adminName, $adminEmail, $hashedPassword]);

    echo json_encode([
        "status" => "success",
        "message" => "New administrator account created successfully!"
    ]);
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(["status" => "error", "message" => $e->getMessage()]);
}


