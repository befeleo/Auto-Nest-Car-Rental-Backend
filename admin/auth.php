<?php
header('Content-Type: application/json');
session_start();
include '../database/db_connect.php';

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    echo json_encode(["status" => "error", "message" => "Invalid request method"]);
    exit;
}

$action = $_POST['action'] ?? '';

if ($action === 'login') {
    $email = trim($_POST['email'] ?? '');
    $password = $_POST['password'] ?? '';

    if ($email === '' || $password === '') {
        echo json_encode(["status" => "error", "message" => "Email and password are required"]);
        exit;
    }

    try {
        $table = getenv('ADMIN_TABLE') ?: 'admin_users';
        $emailColumn = getenv('ADMIN_EMAIL_COLUMN') ?: 'email';
        $passwordColumn = getenv('ADMIN_PASSWORD_COLUMN') ?: 'password';
        $nameColumn = getenv('ADMIN_NAME_COLUMN') ?: 'name';
        $roleColumn = getenv('ADMIN_ROLE_COLUMN') ?: 'role';

        $sql = "SELECT {$nameColumn} AS name, {$emailColumn} AS email, {$passwordColumn} AS password, {$roleColumn} AS role
                FROM {$table}
                WHERE {$emailColumn} = ?
                LIMIT 1";
        $stmt = $pdo->prepare($sql);
        $stmt->execute([$email]);
        $admin = $stmt->fetch(PDO::FETCH_ASSOC);

        if (!$admin) {
            echo json_encode(["status" => "error", "message" => "Invalid email or password"]);
            exit;
        }

        $storedPassword = (string)$admin['password'];
        $passwordMatches = password_verify($password, $storedPassword) || hash_equals($storedPassword, $password);

        if (!$passwordMatches) {
            echo json_encode(["status" => "error", "message" => "Invalid email or password"]);
            exit;
        }

        $_SESSION['autonest_admin'] = [
            "name" => $admin['name'] ?: 'Admin User',
            "email" => $admin['email'],
            "role" => $admin['role'] ?: 'admin'
        ];

        echo json_encode([
            "status" => "success",
            "user" => $_SESSION['autonest_admin']
        ]);
    } catch (Exception $e) {
        echo json_encode(["status" => "error", "message" => $e->getMessage()]);
    }
    exit;
}

if ($action === 'check') {
    if (!empty($_SESSION['autonest_admin'])) {
        echo json_encode([
            "status" => "success",
            "loggedIn" => true,
            "user" => $_SESSION['autonest_admin']
        ]);
    } else {
        echo json_encode([
            "status" => "success",
            "loggedIn" => false
        ]);
    }
    exit;
}

if ($action === 'logout') {
    unset($_SESSION['autonest_admin']);
    session_destroy();
    echo json_encode([
        "status" => "success",
        "message" => "Logged out"
    ]);
    exit;
}

echo json_encode(["status" => "error", "message" => "Invalid action"]);
