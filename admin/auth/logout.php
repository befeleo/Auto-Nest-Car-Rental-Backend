<?php
header('Content-Type: application/json');
session_start();

unset($_SESSION['autonest_admin']);
session_destroy();

echo json_encode([
    "status" => "success",
    "message" => "Logged out"
]);

