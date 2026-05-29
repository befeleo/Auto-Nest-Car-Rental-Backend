<?php
header('Content-Type: application/json');
session_start();

if (empty($_SESSION['autonest_admin']['email'])) {
    http_response_code(401);
    echo json_encode(["status" => "error", "message" => "Unauthorized access."]);
    exit;
}

include_once '../../database/db_connect.php';

function ensureProfilePictureColumnExists(PDO $pdo): void
{
    $hasColumn = $pdo->query("SHOW COLUMNS FROM admin_users LIKE 'profile_picture'")->rowCount();
    if ($hasColumn === 0) {
        $pdo->exec("ALTER TABLE admin_users ADD COLUMN profile_picture VARCHAR(500) NULL AFTER role");
    }
}

function sanitize_profile_name(string $name): string
{
    $name = trim(strip_tags($name));
    $name = preg_replace('/\s+/', ' ', $name);
    return strlen($name) > 255 ? substr($name, 0, 255) : $name;
}

try {
    ensureProfilePictureColumnExists($pdo);

    $adminId = isset($_SESSION['autonest_admin']['id']) ? (int)$_SESSION['autonest_admin']['id'] : 0;
    $currentEmail = trim($_SESSION['autonest_admin']['email']);

    if ($adminId > 0) {
        $stmt = $pdo->prepare('SELECT id, name, email, profile_picture FROM admin_users WHERE id = ? LIMIT 1');
        $stmt->execute([$adminId]);
    } else {
        $stmt = $pdo->prepare('SELECT id, name, email, profile_picture FROM admin_users WHERE email = ? LIMIT 1');
        $stmt->execute([$currentEmail]);
    }

    $admin = $stmt->fetch(PDO::FETCH_ASSOC);

    if (!$admin) {
        http_response_code(404);
        echo json_encode(["status" => "error", "message" => "Admin profile not found."]);
        exit;
    }

    $profilePicture = trim((string)($admin['profile_picture'] ?? ''));
    if ($profilePicture !== '' && !is_file(__DIR__ . '/../../' . $profilePicture)) {
        $profilePicture = '';
    }

    $_SESSION['autonest_admin']['id'] = (int)$admin['id'];
    $_SESSION['autonest_admin']['name'] = $admin['name'];
    $_SESSION['autonest_admin']['email'] = $admin['email'];
    $_SESSION['autonest_admin']['profile_picture'] = $profilePicture;

    echo json_encode([
        "status" => "success",
        "user" => [
            "id" => (int)$admin['id'],
            "name" => sanitize_profile_name((string)$admin['name']),
            "email" => strtolower(trim((string)$admin['email'])),
            "profilePicture" => $profilePicture,
        ]
    ]);
} catch (PDOException $e) {
    http_response_code(500);
    echo json_encode(["status" => "error", "message" => "Database connection error occurred."]);
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(["status" => "error", "message" => "An unexpected error occurred."]);
}


