<?php
$adminTableSQL = "
CREATE TABLE IF NOT EXISTS admin_users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    role VARCHAR(50) DEFAULT 'admin'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
";

$carsTableSQL = "
CREATE TABLE IF NOT EXISTS cars (
    id INT AUTO_INCREMENT PRIMARY KEY,
    brand VARCHAR(255) NOT NULL,
    name VARCHAR(255) NOT NULL,
    price DECIMAL(10,2) NOT NULL,
    bodyType VARCHAR(100),
    fuelType VARCHAR(50),
    transmission VARCHAR(50),
    isUsed TINYINT(1) DEFAULT 0,
    isPopular TINYINT(1) DEFAULT 0,
    isLuxury TINYINT(1) DEFAULT 0,
    features TEXT,
    image_path VARCHAR(500) DEFAULT 'assets/images/car_images/placeholder.png'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
";

function createTables($pdo) {
    global $adminTableSQL, $carsTableSQL;

    try {
        // Create admin_users table
        $pdo->exec($adminTableSQL);
        echo "Admin users table created successfully.\n";

        // Create cars table
        $pdo->exec($carsTableSQL);
        echo "Cars inventory table created successfully.\n";

    } catch (PDOException $e) {
        echo "Error creating tables: " . $e->getMessage() . "\n";
    }
}

include 'db_connect.php';
createTables($pdo);
?></content>
<parameter name="filePath">/opt/lampp/htdocs/auto-nest/database/table.format.php
