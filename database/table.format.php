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
    image_path VARCHAR(500) DEFAULT 'assets/images/car_images/placeholder.png',
    status VARCHAR(20) NOT NULL DEFAULT 'available'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
";

$bookingsTableSQL = "
CREATE TABLE IF NOT EXISTS bookings (
    id INT AUTO_INCREMENT PRIMARY KEY,
    car_id INT NOT NULL,
    car_name VARCHAR(255) NOT NULL,
    full_name VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL,
    phone VARCHAR(50) NOT NULL,
    pickup_date DATE NOT NULL,
    dropoff_date DATE NOT NULL,
    pickup_location VARCHAR(120) NOT NULL,
    driver_type VARCHAR(40) NOT NULL DEFAULT 'self_drive',
    special_requests TEXT NULL,
    total_days INT NOT NULL,
    price_per_day DECIMAL(10,2) NOT NULL,
    discount_amount DECIMAL(10,2) NOT NULL DEFAULT 0,
    driver_fee DECIMAL(10,2) NOT NULL DEFAULT 0,
    total_price DECIMAL(10,2) NOT NULL,
    status VARCHAR(40) NOT NULL DEFAULT 'pending',
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    INDEX (car_id),
    INDEX (status),
    CONSTRAINT fk_bookings_car_id FOREIGN KEY (car_id) REFERENCES cars(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
";

function createTables($pdo)
{
    global $adminTableSQL, $carsTableSQL, $bookingsTableSQL;

    try {
        // Create admin_users table
        $pdo->exec($adminTableSQL);
        echo "Admin users table created successfully.\n";

        // Create cars table
        $pdo->exec($carsTableSQL);
        echo "Cars inventory table created successfully.\n";

        // Create bookings table
        $pdo->exec($bookingsTableSQL);
        echo "Bookings table created successfully.\n";
    } catch (PDOException $e) {
        echo "Error creating tables: " . $e->getMessage() . "\n";
    }
}

include 'db_connect.php';
createTables($pdo);
?></content>
<parameter name="filePath">/opt/lampp/htdocs/auto-nest/database/table.format.php