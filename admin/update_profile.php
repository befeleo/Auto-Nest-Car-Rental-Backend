<?php
header('Content-Type: application/json');
session_start();

if (empty($_SESSION['autonest_admin'])) {
    http_response_code(401);
    echo json_encode(["status" => "error", "message" => "Unauthorized"]);
    exit;
}

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(["status" => "error", "message" => "Invalid request method"]);
    exit;
}

include '../database/db_connect.php';

function sanitize_profile_name(string $name): string
{
    $name = trim(strip_tags($name));
    $name = preg_replace('/\s+/', ' ', $name);
    return strlen($name) > 255 ? substr($name, 0, 255) : $name;
}

function sanitize_profile_email(string $email): string
{
    return strtolower(trim($email));
}

$rawName = $_POST['newName'] ?? '';
$rawEmail = $_POST['newEmail'] ?? '';
$newName = $rawName !== '' ? sanitize_profile_name($rawName) : '';
$newEmail = $rawEmail !== '' ? sanitize_profile_email($rawEmail) : '';
$newPassword = $_POST['newPassword'] ?? '';

$adminId = isset($_SESSION['autonest_admin']['id']) ? (int)$_SESSION['autonest_admin']['id'] : 0;
$currentEmail = sanitize_profile_email($_SESSION['autonest_admin']['email'] ?? '');

if ($newName === '' && $newEmail === '' && $newPassword === '') {
    echo json_encode(["status" => "error", "message" => "No changes submitted"]);
    exit;
}

if ($rawName !== '' && $newName === '') {
    echo json_encode(["status" => "error", "message" => "Name cannot be empty"]);
    exit;
}

if ($newEmail !== '') {
    if (!filter_var($newEmail, FILTER_VALIDATE_EMAIL)) {
        echo json_encode(["status" => "error", "message" => "Please enter a valid email address"]);
        exit;
    }

    if ($adminId > 0) {
        $dupSql = 'SELECT id FROM admin_users WHERE email = ? AND id != ? LIMIT 1';
        $dupParams = [$newEmail, $adminId];
    } else {
        $dupSql = 'SELECT id FROM admin_users WHERE email = ? AND email != ? LIMIT 1';
        $dupParams = [$newEmail, $currentEmail];
    }
    $dupStmt = $pdo->prepare($dupSql);
    $dupStmt->execute($dupParams);
    if ($dupStmt->fetch()) {
        echo json_encode(["status" => "error", "message" => "That email is already in use"]);
        exit;
    }
}

if ($newPassword !== '') {
    if (strlen($newPassword) < 6) {
        echo json_encode(["status" => "error", "message" => "Password must be at least 6 characters"]);
        exit;
    }
}

$updates = [];
$params = [];

if ($newName !== '') {
    $updates[] = 'name = ?';
    $params[] = $newName;
}

if ($newEmail !== '') {
    $updates[] = 'email = ?';
    $params[] = $newEmail;
}

if ($newPassword !== '') {
    $updates[] = 'password = ?';
    $params[] = password_hash($newPassword, PASSWORD_DEFAULT);
}

if (empty($updates)) {
    echo json_encode(["status" => "error", "message" => "No valid profile fields to update"]);
    exit;
}

if ($adminId > 0) {
    $params[] = $adminId;
    $sql = 'UPDATE admin_users SET ' . implode(', ', $updates) . ' WHERE id = ?';
} else {
    $params[] = $currentEmail;
    $sql = 'UPDATE admin_users SET ' . implode(', ', $updates) . ' WHERE email = ?';
}

try {
    $stmt = $pdo->prepare($sql);
    $stmt->execute($params);

    if ($stmt->rowCount() === 0 && $newPassword === '') {
        echo json_encode(["status" => "error", "message" => "No profile changes were applied"]);
        exit;
    }

    if ($newName !== '') {
        $_SESSION['autonest_admin']['name'] = $newName;
    }
    if ($newEmail !== '') {
        $_SESSION['autonest_admin']['email'] = $newEmail;
    }

    $lookupId = $adminId > 0 ? $adminId : null;
    if ($lookupId) {
        $fetch = $pdo->prepare('SELECT id, name, email FROM admin_users WHERE id = ? LIMIT 1');
        $fetch->execute([$lookupId]);
    } else {
        $fetch = $pdo->prepare('SELECT id, name, email FROM admin_users WHERE email = ? LIMIT 1');
        $fetch->execute([$_SESSION['autonest_admin']['email']]);
    }
    $row = $fetch->fetch(PDO::FETCH_ASSOC);

    if ($row) {
        $_SESSION['autonest_admin']['id'] = (int)$row['id'];
        $_SESSION['autonest_admin']['name'] = $row['name'];
        $_SESSION['autonest_admin']['email'] = $row['email'];
    }

    echo json_encode([
        "status" => "success",
        "message" => "Profile updated successfully",
        "user" => [
            "id" => (int)($_SESSION['autonest_admin']['id'] ?? 0),
            "name" => $_SESSION['autonest_admin']['name'],
            "email" => $_SESSION['autonest_admin']['email'],
        ]
    ]);
} catch (PDOException $e) {
    if ((int)$e->getCode() === 23000) {
        echo json_encode(["status" => "error", "message" => "That email is already in use"]);
        exit;
    }
    http_response_code(500);
    echo json_encode(["status" => "error", "message" => "Could not update profile"]);
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(["status" => "error", "message" => "Could not update profile"]);
}
