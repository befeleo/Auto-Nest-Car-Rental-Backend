<?php
require_once __DIR__ . '/database/db_connect.php';

function esc($value) {
    return htmlspecialchars((string)$value, ENT_QUOTES, 'UTF-8');
}

function formatPrice($price) {
    if (!is_numeric($price)) return esc((string)$price);
    return number_format((float)$price, 0, '.', ',');
}

$preferenceRaw = trim($_GET['preference'] ?? '');
$preference = strtolower($preferenceRaw === '' ? '' : $preferenceRaw);
$cars = [];
$error = null;
$label = '';
$pageTitle = 'Filtered Cars | Auto Nest Car Rental';

$filterMap = [
    'range-1' => ['sql' => 'price < 2000', 'label' => 'Under 2000 ETB'],
    'range-2' => ['sql' => 'price BETWEEN 2000 AND 3000', 'label' => '2,000 - 3,000 ETB'],
    'range-3' => ['sql' => 'price BETWEEN 3000 AND 4000', 'label' => '3,000 - 4,000 ETB'],
    'range-4' => ['sql' => 'price BETWEEN 4000 AND 5000', 'label' => '4,000 - 5,000 ETB'],
    'range-5' => ['sql' => 'price BETWEEN 5000 AND 6000', 'label' => '5,000 - 6,000 ETB'],
    'range-6' => ['sql' => 'price > 6000', 'label' => 'Above 6,000 ETB'],
    'petrol' => ['sql' => "LOWER(fuelType) = 'petrol'", 'label' => 'Petrol Cars'],
    'diesel' => ['sql' => "LOWER(fuelType) = 'diesel'", 'label' => 'Diesel Cars'],
    'electric' => ['sql' => "LOWER(fuelType) = 'electric'", 'label' => 'Electric Cars'],
    'hybrid' => ['sql' => "LOWER(fuelType) = 'hybrid'", 'label' => 'Hybrid Cars'],
    'sedan' => ['sql' => "LOWER(bodyType) = 'sedan'", 'label' => 'Sedan Cars'],
    'suv' => ['sql' => "LOWER(bodyType) = 'suv'", 'label' => 'SUV Cars'],
    'pickup' => ['sql' => "LOWER(bodyType) = 'pickup'", 'label' => 'Pickup Trucks'],
    'hatchback' => ['sql' => "LOWER(bodyType) = 'hatchback'", 'label' => 'Hatchback Cars'],
    'popular' => ['sql' => 'isPopular = 1', 'label' => 'Popular Cars'],
    'luxury' => ['sql' => 'isLuxury = 1', 'label' => 'Luxury Cars'],
    'used' => ['sql' => 'isUsed = 1', 'label' => 'Used Cars'],
    'new' => ['sql' => 'isUsed = 0', 'label' => 'New Cars'],
    'automatic' => ['sql' => 'LOWER(transmission) LIKE "%automatic%"', 'label' => 'Automatic Transmission'],
    'manual' => ['sql' => 'LOWER(transmission) LIKE "%manual%"', 'label' => 'Manual Transmission'],
    'seats-5' => ['sql' => 'CAST(seats AS UNSIGNED) = 5 OR LOWER(seats) LIKE "%5%"', 'label' => '5 Seats'],
    'seats-7' => ['sql' => 'CAST(seats AS UNSIGNED) = 7 OR LOWER(seats) LIKE "%7%"', 'label' => '7 Seats'],
];

if ($preference === '') {
    $error = 'No preference selected. Please choose a filter from the homepage.';
} elseif (!isset($filterMap[$preference])) {
    $error = 'Unknown preference filter selected.';
} else {
    $filter = $filterMap[$preference];
    $label = $filter['label'];
    $pageTitle = 'Filtered Cars - ' . esc($label) . ' | Auto Nest Car Rental';

    try {
        $query = 'SELECT * FROM cars WHERE ' . $filter['sql'] . ' ORDER BY id DESC';
        $stmt = $pdo->query($query);
        $cars = $stmt->fetchAll(PDO::FETCH_ASSOC);
        if (!$cars) {
            $error = 'No cars found for preference: ' . esc($label);
        }
    } catch (Exception $e) {
        $error = 'Unable to load cars for this filter. Please try again later.';
    }
}
?>
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title><?= esc($pageTitle) ?></title>
  <link rel="stylesheet" href="css/common.css" />
  <link rel="stylesheet" href="css/style.css" />
  <link rel="shortcut icon" href="assets/favicon/car.png" />
</head>
<body>
  <nav class="nav-bar-services">
    <a href="index.html" class="logo">
      <img src="assets/images/logo.png" alt="logo" />
    </a>
    <div class="nav-bar-links">
      <ul>
        <li><a href="index.html">Home</a></li>
        <li><a href="about-contact.html">About Us</a></li>
        <li><a href="services.php">Car Service</a></li>
        <li><a href="about-contact.html#contact">Contact</a></li>
      </ul>
    </div>
  </nav>

  <main class="car-section">
    <div class="section">
      <div class="section-header">
        <h1><?= esc($label ?: 'Filtered Cars') ?></h1>
        <p>
          Browse all available cars that match your selected preference.
        </p>
      </div>

      <?php if ($error): ?>
        <div class="no-results" style="text-align: center; padding: 40px;">
          <p><?= esc($error) ?></p>
          <div style="margin-top: 20px; display: inline-flex; gap: 10px;">
            <a href="index.html" class="toggle-btn">Back to Home</a>
            <a href="services.php" class="toggle-btn">View All Cars</a>
          </div>
        </div>
      <?php else: ?>
        <div id="car-list" class="car-grid">
          <?php foreach ($cars as $car): ?>
            <?php
              $image = trim((string)($car['image_path'] ?? $car['image'] ?? ''));
              if ($image === '' || strtolower($image) === 'null') {
                  $image = 'assets/images/placeholder-car.png';
              }
            ?>
            <div class="car-card">
              <div class="car-image-container" style="height: 200px; overflow: hidden; background: #f4f4f4; border-radius: 20px 20px 0 0;">
                <img src="<?= esc($image) ?>"
                     alt="<?= esc($car['brand'] . ' ' . $car['name']) ?>"
                     style="width: 100%; height: 100%; object-fit: cover;"
                     onerror="this.src='assets/images/placeholder-car.png'">
              </div>
              <div class="car-card-content" style="padding: 15px;">
                <h3 style="margin: 0; color: #333;"><?= esc($car['brand'] . ' ' . $car['name']) ?></h3>
                <p style="color: #2996B8; font-weight: bold; font-size: 1.1rem; margin: 10px 0;">
                  <?= formatPrice($car['price']) ?> birr <span style="font-size: 0.8rem; color: #777;">/ day</span>
                </p>
                <p style="font-size: 0.9rem; color: #666;"><?= esc($car['bodyType'] ?? '') ?> • <?= esc($car['fuelType'] ?? '') ?></p>
                <button onclick="window.location.href='car-details.php?id=<?= esc($car['id']) ?>'" class="toggle-btn">
                  View Details
                </button>
              </div>
            </div>
          <?php endforeach; ?>
        </div>
      <?php endif; ?>
    </div>
  </main>

  <footer>
    <div class="footer-container footer-top">
      <div class="footer-info">
        <div class="footer-logo-container">
          <img src="assets/images/logo.png" alt="logo" />
          <span class="logo-text">Auto Nest</span>
        </div>
        <p class="tagline">Your trusted partner for car rentals in Ethiopia</p>
      </div>
    </div>
  </footer>
</body>
</html>
