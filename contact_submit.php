<?php
declare(strict_types=1);

require __DIR__ . '/vendor/autoload.php';

function loadEnv(string $path): void
{
    if (!file_exists($path)) {
        return;
    }
    $lines = file($path, FILE_IGNORE_NEW_LINES | FILE_SKIP_EMPTY_LINES);
    foreach ($lines as $line) {
        $trimmed = trim($line);
        if ($trimmed === '' || str_starts_with($trimmed, '#')) {
            continue;
        }
        putenv($trimmed);
    }
}

loadEnv(__DIR__ . '/.env');

function respondHtml(int $statusCode, string $title, string $message): void
{
    http_response_code($statusCode);
    header('Content-Type: text/html; charset=utf-8');

    $safeTitle = htmlspecialchars($title, ENT_QUOTES | ENT_SUBSTITUTE, 'UTF-8');
    $safeMessage = nl2br(htmlspecialchars($message, ENT_QUOTES | ENT_SUBSTITUTE, 'UTF-8'));

    echo '<!doctype html><html lang="en"><head><meta charset="utf-8">';
    echo '<meta name="viewport" content="width=device-width, initial-scale=1">';
    echo '<title>' . $safeTitle . '</title>';
    echo '<style>
        body{font-family:system-ui,-apple-system,Segoe UI,Roboto,Arial,sans-serif;margin:0;background:#0b1220;color:#e7eefc}
        .wrap{max-width:720px;margin:64px auto;padding:0 16px}
        .card{background:#111a2e;border:1px solid rgba(255,255,255,.08);border-radius:14px;padding:22px}
        h1{font-size:20px;margin:0 0 12px}
        p{margin:0 0 16px;line-height:1.5;color:#cfe0ff}
        a{display:inline-block;color:#0b1220;background:#ffd24d;padding:10px 14px;border-radius:10px;text-decoration:none;font-weight:600}
        a:hover{filter:brightness(.95)}
    </style></head><body><div class="wrap"><div class="card">';
    echo '<h1>' . $safeTitle . '</h1>';
    echo '<p>' . $safeMessage . '</p>';
    echo '<a href="about-contact.html#contact">Back to Contact</a>';
    echo '</div></div></body></html>';
    exit;
}

if (($_SERVER['REQUEST_METHOD'] ?? '') !== 'POST') {
    respondHtml(405, 'Method Not Allowed', 'Please submit the contact form.');
}

$apiKey = getenv('RESEND_API_KEY') ?: '';
$contactTo = getenv('CONTACT_TO_EMAIL') ?: '';
$fromEmail = getenv('CONTACT_FROM_EMAIL') ?: '';

if ($apiKey === '' || $contactTo === '' || $fromEmail === '') {
    respondHtml(
        500,
        'Configuration Missing',
        "Server is missing email configuration.\nPlease set RESEND_API_KEY, CONTACT_TO_EMAIL, and CONTACT_FROM_EMAIL in .env."
    );
}

$name = trim((string)($_POST['name'] ?? ''));
$email = trim((string)($_POST['email'] ?? ''));
$phone = trim((string)($_POST['phone'] ?? ''));
$subject = trim((string)($_POST['subject'] ?? ''));
$message = trim((string)($_POST['message'] ?? ''));
$newsletter = !empty($_POST['newsletter']);

if ($name === '' || mb_strlen($name) > 100) {
    respondHtml(422, 'Validation Error', 'Please enter your full name.');
}
if ($email === '' || !filter_var($email, FILTER_VALIDATE_EMAIL) || mb_strlen($email) > 254) {
    respondHtml(422, 'Validation Error', 'Please enter a valid email address.');
}
if ($subject === '' || mb_strlen($subject) > 80) {
    respondHtml(422, 'Validation Error', 'Please select a subject.');
}
if ($message === '' || mb_strlen($message) < 10 || mb_strlen($message) > 5000) {
    respondHtml(422, 'Validation Error', 'Please enter a message (at least 10 characters).');
}
if ($phone !== '' && mb_strlen($phone) > 40) {
    respondHtml(422, 'Validation Error', 'Phone number looks too long.');
}

$subjectMap = [
    'general' => 'General Inquiry',
    'booking' => 'Booking Assistance',
    'support' => 'Technical Support',
    'feedback' => 'Feedback/Suggestions',
    'other' => 'Other',
];
$subjectLabel = $subjectMap[$subject] ?? $subject;

$html = '<div style="font-family:Arial,sans-serif;line-height:1.5">';
$html .= '<h2>New Contact Form Message</h2>';
$html .= '<p><strong>Name:</strong> ' . htmlspecialchars($name, ENT_QUOTES | ENT_SUBSTITUTE, 'UTF-8') . '</p>';
$html .= '<p><strong>Email:</strong> ' . htmlspecialchars($email, ENT_QUOTES | ENT_SUBSTITUTE, 'UTF-8') . '</p>';
if ($phone !== '') {
    $html .= '<p><strong>Phone:</strong> ' . htmlspecialchars($phone, ENT_QUOTES | ENT_SUBSTITUTE, 'UTF-8') . '</p>';
}
$html .= '<p><strong>Subject:</strong> ' . htmlspecialchars($subjectLabel, ENT_QUOTES | ENT_SUBSTITUTE, 'UTF-8') . '</p>';
$html .= '<p><strong>Newsletter:</strong> ' . ($newsletter ? 'Yes' : 'No') . '</p>';
$html .= '<hr>';
$html .= '<p><strong>Message:</strong></p>';
$html .= '<pre style="white-space:pre-wrap;font-family:inherit;margin:0">';
$html .= htmlspecialchars($message, ENT_QUOTES | ENT_SUBSTITUTE, 'UTF-8');
$html .= '</pre>';
$html .= '</div>';

try {
    $resend = Resend::client($apiKey);
    $resend->emails->send([
        'from' => $fromEmail,
        'to' => [$contactTo],
        'subject' => 'Contact Form: ' . $subjectLabel,
        'html' => $html,
        'reply_to' => $email,
    ]);
} catch (Throwable $exception) {
    respondHtml(502, 'Email Error', 'Failed to send email: ' . $exception->getMessage());
}

respondHtml(200, 'Message Sent', 'Thanks! Your message has been sent to our team. We will get back to you soon.');