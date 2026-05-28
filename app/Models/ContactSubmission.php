<?php

declare(strict_types=1);

require_once __DIR__ . '/../../database/db_connect.php';

if (($_SERVER['REQUEST_METHOD'] ?? '') === 'POST') {
    $name = trim((string)($_POST['name'] ?? ''));
    $email = trim((string)($_POST['email'] ?? ''));
    $phone = trim((string)($_POST['phone'] ?? ''));
    $subject = trim((string)($_POST['subject'] ?? ''));
    $message = trim((string)($_POST['message'] ?? ''));
    $newsletter = isset($_POST['newsletter']) ? 1 : 0;

    $name = filter_var($name, FILTER_SANITIZE_FULL_SPECIAL_CHARS);
    $message = filter_var($message, FILTER_SANITIZE_FULL_SPECIAL_CHARS);
    $subject = filter_var($subject, FILTER_SANITIZE_FULL_SPECIAL_CHARS);

    if ($name === '' || $email === '' || $message === '') {
        http_response_code(422);
        echo "Invalid input.";
        exit;
    }

    if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
        http_response_code(422);
        echo "Invalid email address.";
        exit;
    }

    try {
        $stmt = $pdo->prepare(
            'INSERT INTO contact_messages (name, email, phone, subject, message, newsletter)
             VALUES (:name, :email, :phone, :subject, :message, :newsletter)'
        );

        $stmt->execute([
            ':name' => $name,
            ':email' => $email,
            ':phone' => $phone,
            ':subject' => $subject,
            ':message' => $message,
            ':newsletter' => $newsletter,
        ]);

        http_response_code(200);
        echo 'Success!';
    } catch (PDOException $e) {
        http_response_code(500);
        echo 'Error: ' . $e->getMessage();
    }
}
