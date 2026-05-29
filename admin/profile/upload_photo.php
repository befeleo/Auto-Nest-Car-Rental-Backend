<?php
header('Content-Type: application/json');
session_start();

if (empty($_SESSION['autonest_admin'])) {
    http_response_code(401);
    echo json_encode(['status' => 'error', 'message' => 'Unauthorized']);
    exit;
}

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(['status' => 'error', 'message' => 'Invalid request method']);
    exit;
}

require_once __DIR__ . '/../../database/db_connect.php';

function ensureProfilePictureColumnExists(PDO $pdo): void
{
    $hasColumn = $pdo->query("SHOW COLUMNS FROM admin_users LIKE 'profile_picture'")->rowCount();
    if ($hasColumn === 0) {
        $pdo->exec("ALTER TABLE admin_users ADD COLUMN profile_picture VARCHAR(500) NULL AFTER role");
    }
}

function deleteStoredProfilePicture(?string $relativePath): void
{
    if ($relativePath === null || $relativePath === '') {
        return;
    }

    if (strpos($relativePath, 'assets/images/profile/') !== 0) {
        return;
    }

    $fullPath = __DIR__ . '/../../' . $relativePath;
    if (is_file($fullPath)) {
        unlink($fullPath);
    }
}

$adminId = isset($_SESSION['autonest_admin']['id']) ? (int)$_SESSION['autonest_admin']['id'] : 0;
$currentEmail = trim((string)($_SESSION['autonest_admin']['email'] ?? ''));

if ($adminId <= 0 && $currentEmail === '') {
    echo json_encode(['status' => 'error', 'message' => 'Admin account not found in session']);
    exit;
}

if (!isset($_FILES['profile_photo']) || !is_array($_FILES['profile_photo'])) {
    echo json_encode(['status' => 'error', 'message' => 'No profile photo uploaded']);
    exit;
}

$file = $_FILES['profile_photo'];

if (($file['error'] ?? UPLOAD_ERR_NO_FILE) !== UPLOAD_ERR_OK) {
    echo json_encode(['status' => 'error', 'message' => 'Photo upload failed. Please try again.']);
    exit;
}

$maxBytes = 2 * 1024 * 1024;
if (($file['size'] ?? 0) > $maxBytes) {
    echo json_encode(['status' => 'error', 'message' => 'Image must be 2 MB or smaller']);
    exit;
}

$allowedExtensions = ['jpg', 'jpeg', 'png'];
$allowedMimeTypes = ['image/jpeg', 'image/png'];

$originalName = (string)($file['name'] ?? '');
$extension = strtolower(pathinfo($originalName, PATHINFO_EXTENSION));

if (!in_array($extension, $allowedExtensions, true)) {
    echo json_encode(['status' => 'error', 'message' => 'Only JPG and PNG images are allowed']);
    exit;
}

$finfo = new finfo(FILEINFO_MIME_TYPE);
$detectedMime = $finfo->file($file['tmp_name']) ?: '';

if (!in_array($detectedMime, $allowedMimeTypes, true)) {
    echo json_encode(['status' => 'error', 'message' => 'Only JPG and PNG images are allowed']);
    exit;
}

$storedExtension = $extension === 'jpeg' ? 'jpg' : $extension;
$uploadDir = __DIR__ . '/../../assets/images/profile/';

if (!is_dir($uploadDir) && !mkdir($uploadDir, 0755, true) && !is_dir($uploadDir)) {
    echo json_encode(['status' => 'error', 'message' => 'Could not create profile image folder']);
    exit;
}

try {
    ensureProfilePictureColumnExists($pdo);

    if ($adminId > 0) {
        $fetch = $pdo->prepare('SELECT id, profile_picture FROM admin_users WHERE id = ? LIMIT 1');
        $fetch->execute([$adminId]);
    } else {
        $fetch = $pdo->prepare('SELECT id, profile_picture FROM admin_users WHERE email = ? LIMIT 1');
        $fetch->execute([$currentEmail]);
    }

    $admin = $fetch->fetch(PDO::FETCH_ASSOC);

    if (!$admin) {
        http_response_code(404);
        echo json_encode(['status' => 'error', 'message' => 'Admin profile not found']);
        exit;
    }

    $adminId = (int)$admin['id'];
    deleteStoredProfilePicture($admin['profile_picture'] ?? null);

    $fileName = 'admin_' . $adminId . '.' . $storedExtension;
    $targetPath = $uploadDir . $fileName;
    $relativePath = 'assets/images/profile/' . $fileName;

    if (!move_uploaded_file($file['tmp_name'], $targetPath)) {
        echo json_encode(['status' => 'error', 'message' => 'Could not save profile photo']);
        exit;
    }

    $update = $pdo->prepare('UPDATE admin_users SET profile_picture = ? WHERE id = ?');
    $update->execute([$relativePath, $adminId]);

    $_SESSION['autonest_admin']['id'] = $adminId;
    $_SESSION['autonest_admin']['profile_picture'] = $relativePath;

    echo json_encode([
        'status' => 'success',
        'message' => 'Profile photo updated successfully',
        'profilePicture' => $relativePath,
    ]);
} catch (PDOException $e) {
    http_response_code(500);
    echo json_encode(['status' => 'error', 'message' => 'Could not update profile photo']);
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(['status' => 'error', 'message' => 'Could not update profile photo']);
}
