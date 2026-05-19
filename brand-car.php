<?php
require_once __DIR__ . '/database/db_connect.php';

function esc($value) {
    return htmlspecialchars((string)$value, ENT_QUOTES, 'UTF-8');
}

$brandRaw = trim($_GET['brand'] ?? '');
$brand = $brandRaw === '' ? null : $brandRaw;
$cars = [];
$error = null;
$pageTitle = 'Cars by Brand | Auto Nest Car Rental';
$heading = 'Cars by Brand';

if ($brand === null) {
    $error = 'No brand selected. Please choose a brand from the homepage.';
} else {
    try {
        $stmt = $pdo->prepare('SELECT * FROM cars WHERE LOWER(brand) = LOWER(?) ORDER BY id DESC');
        $stmt->execute([$brand]);
        $cars = $stmt->fetchAll(PDO::FETCH_ASSOC);
        if (!$cars) {
            $error = 'No cars found for brand: ' . esc($brand);
        } else {
            $heading = 'Cars by Brand: ' . esc($brand);
            $pageTitle = 'Cars by Brand - ' . esc($brand) . ' | Auto Nest Car Rental';
        }
    } catch (Exception $e) {
        $error = 'Unable to load cars for this brand. Please try again later.';
    }
}

function formatPrice($price) {
    if (!is_numeric($price)) return esc((string)$price);
    return number_format((float)$price, 0, '.', ',');
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
        <h1><?= esc($heading) ?></h1>
        <p>
          Browse all available cars matching your selected brand.
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
