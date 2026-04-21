<?php
$env = parse_ini_file(__DIR__ . '/.env');

$conn = new mysqli(
    $env['DB_HOST'],
    $env['DB_USER'],
    $env['DB_PASS'],
    $env['DB_NAME']
);

if ($conn->connect_error) {
    die("Database connection failed: " . $conn->connect_error);
}

if ($_SERVER["REQUEST_METHOD"] === "POST") {
    $name = filter_var($_POST['name'], FILTER_SANITIZE_SPECIAL_CHARS);
    $email = filter_var($_POST['email'], FILTER_VALIDATE_EMAIL);
    $phone = $_POST['phone'] ?? '';
    $subject = $_POST['subject'] ?? '';
    $message = filter_var($_POST['message'], FILTER_SANITIZE_SPECIAL_CHARS);
    $newsletter = isset($_POST['newsletter']) ? 1 : 0;

    if (!$name || !$email || !$message) {
        die("Invalid input");
    }

    $sql = "INSERT INTO contact_messages (name, email, phone, subject, message, newsletter)
            VALUES ('$name', '$email', '$phone', '$subject', '$message', '$newsletter')";

    if ($conn->query($sql)) {
        echo "Success!";
    } else {
        echo "Error: " . $conn->error;
    }
}
?>