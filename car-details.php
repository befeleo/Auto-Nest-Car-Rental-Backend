<?php
require_once __DIR__ . '/database/db_connect.php';

function esc($value) {
  return htmlspecialchars((string)$value, ENT_QUOTES, 'UTF-8');
}

function toBool($value) {
  if ($value === null) return null;
  if (is_bool($value)) return $value;
  $s = strtolower(trim((string)$value));
  if ($s === '') return null;
  return in_array($s, ['1', 'true', 'yes', 'y'], true);
}

function humanizeKey($key) {
  $k = preg_replace('/[_-]+/', ' ', (string)$key);
  $k = preg_replace('/(?<!^)([A-Z])/', ' $1', $k);
  $k = preg_replace('/\s+/', ' ', $k);
  return ucwords(trim($k));
}

function formatNumber($n) {
  $num = is_numeric($n) ? (float)$n : 0.0;
  return number_format($num, 0, '.', ',');
}

function parseFeatures($value) {
  if (is_array($value)) return array_values(array_filter(array_map('trim', array_map('strval', $value))));
  if (!is_string($value)) return [];
  $parts = preg_split('/,|\n|;|\|/', $value);
  $out = [];
  foreach ($parts as $p) {
    $t = trim((string)$p);
    if ($t !== '') $out[] = $t;
  }
  return $out;
}

function starsHtml($rating) {
  $r = is_numeric($rating) ? (float)$rating : 0.0;
  $r = max(0.0, min(5.0, $r));
  $full = (int)floor($r);
  $half = ($r - $full) >= 0.5 ? 1 : 0;
  $empty = 5 - $full - $half;
  return str_repeat('<i class="fas fa-star"></i>', $full)
    . ($half ? '<i class="fas fa-star-half-alt"></i>' : '')
    . str_repeat('<i class="far fa-star"></i>', $empty);
}

function collectImages($car, $fallback) {
  $images = [];
  foreach (($car ?? []) as $k => $v) {
    if (!preg_match('/image/i', (string)$k)) continue;
    if (!is_string($v)) continue;
    $src = trim($v);
    if ($src === '') continue;
    $exists = false;
    foreach ($images as $img) {
      if ($img['src'] === $src) { $exists = true; break; }
    }
    if ($exists) continue;
    $images[] = ['src' => $src, 'label' => humanizeKey($k)];
  }
  if (!$images) $images[] = ['src' => $fallback, 'label' => 'Car Image'];
  return $images;
}

$fallbackImage = 'assets/images/placeholder-car.png';
$idRaw = $_GET['id'] ?? '';
$car = null;
$errorTitle = null;
$errorMessage = null;

if ($idRaw === '' || !ctype_digit((string)$idRaw)) {
  $errorTitle = 'Error';
  $errorMessage = 'Invalid car id.';
} else {
  try {
    $stmt = $pdo->prepare("SELECT * FROM cars WHERE id = ? LIMIT 1");
    $stmt->execute([(int)$idRaw]);
    $car = $stmt->fetch(PDO::FETCH_ASSOC) ?: null;
    if (!$car) {
      $errorTitle = 'Car Not Found';
      $errorMessage = 'The requested car could not be found.';
    }
  } catch (Exception $e) {
    $errorTitle = 'Error';
    $errorMessage = 'Failed to load car.';
  }
}

$title = $car ? trim(($car['brand'] ?? '') . ' ' . ($car['name'] ?? '')) : 'Car Details';
if ($title === '') $title = 'Car';
$pageTitle = $car ? ($title . ' - Auto Nest Car Rental') : 'Car Details - Auto Nest Car Rental';

$price = $car && isset($car['price']) && is_numeric($car['price']) ? (float)$car['price'] : 0.0;
$weekly = $price * 7 * 0.85;
$rating = $car && isset($car['rating']) ? $car['rating'] : 4.0;
$reviews = $car && isset($car['reviews']) ? $car['reviews'] : 50;
$features = $car ? parseFeatures($car['features'] ?? '') : [];
$images = $car ? collectImages($car, $fallbackImage) : [['src' => $fallbackImage, 'label' => 'Car Image']];

$isPopular = $car ? (toBool($car['isPopular'] ?? null) === true) : false;
$isLuxury = $car ? (toBool($car['isLuxury'] ?? null) === true) : false;
$isUsed = $car ? toBool($car['isUsed'] ?? null) : null;

$primarySpecs = [];
if ($car) {
  $specs = [
    ['Fuel Type', $car['fuelType'] ?? null, 'fa-gas-pump'],
    ['Transmission', $car['transmission'] ?? null, 'fa-cogs'],
    ['Seating Capacity', $car['seats'] ?? null, 'fa-user-friends'],
    ['Body Type', $car['bodyType'] ?? null, 'fa-car'],
    ['Engine', $car['engine'] ?? null, 'fa-tachometer-alt'],
    ['Color', $car['color'] ?? null, 'fa-palette'],
    ['Mileage', $car['mileage'] ?? null, 'fa-road'],
    ['Year', $car['year'] ?? null, 'fa-calendar'],
    ['Fuel Efficiency', $car['fuelEfficiency'] ?? null, 'fa-gas-pump'],
    ['Power', $car['power'] ?? null, 'fa-bolt'],
  ];
  foreach ($specs as [$label, $value, $icon]) {
    if ($value === null || $value === '') continue;
    if ($label === 'Seating Capacity') $value = esc($value) . ' Persons';
    $primarySpecs[] = ['label' => $label, 'value' => (string)$value, 'icon' => $icon];
  }
}

$additionalSpecs = [];
if ($car) {
  $specs = [
    ['Location', $car['location'] ?? null, 'fa-map-marker-alt'],
    ['Insurance', $car['insurance'] ?? null, 'fa-shield-alt'],
    ['Battery Range', $car['batteryRange'] ?? null, 'fa-car-battery'],
    ['Charging Time', $car['chargingTime'] ?? null, 'fa-charging-station'],
    ['Torque', $car['torque'] ?? null, 'fa-cog'],
  ];
  foreach ($specs as [$label, $value, $icon]) {
    if ($value === null || $value === '') continue;
    $additionalSpecs[] = ['label' => $label, 'value' => (string)$value, 'icon' => $icon];
  }
  if (array_key_exists('available', $car) && toBool($car['available']) !== null) {
    $avail = toBool($car['available']) === true;
    array_unshift($additionalSpecs, [
      'label' => 'Availability',
      'value' => $avail ? 'Available Now' : 'Not Available',
      'icon' => $avail ? 'fa-check-circle' : 'fa-times-circle',
    ]);
  }
}

$extraFields = [];
if ($car) {
  $excluded = array_fill_keys([
    'id','brand','name','price','bodyType','fuelType','transmission','isUsed','isPopular','isLuxury','features',
    'image','image_path','imagePath','detailImage','detail_image','description','rating','reviews','available',
    'seats','engine','color','mileage','year','fuelEfficiency','power','torque',
  ], true);
  foreach ($car as $k => $v) {
    if (isset($excluded[$k])) continue;
    if ($v === null || $v === '') continue;
    $extraFields[] = [humanizeKey($k), is_scalar($v) ? (string)$v : json_encode($v)];
  }
}

$relatedCars = [];
if ($car) {
  try {
    $stmt = $pdo->query("SELECT * FROM cars ORDER BY id DESC LIMIT 40");
    $candidates = $stmt->fetchAll(PDO::FETCH_ASSOC);
    $brand = $car['brand'] ?? null;
    $bodyType = $car['bodyType'] ?? null;
    foreach ($candidates as $cand) {
      if ((string)($cand['id'] ?? '') === (string)($car['id'] ?? '')) continue;
      $score = 0;
      if ($brand && ($cand['brand'] ?? null) === $brand) $score += 10;
      if ($bodyType && ($cand['bodyType'] ?? null) === $bodyType) $score += 6;
      if (toBool($cand['isPopular'] ?? null) === true) $score += 2;
      if (toBool($cand['isLuxury'] ?? null) === true) $score += 1;
      $relatedCars[] = ['score' => $score, 'car' => $cand];
    }
    usort($relatedCars, function($a, $b) {
      if ($a['score'] === $b['score']) {
        return (int)($b['car']['id'] ?? 0) <=> (int)($a['car']['id'] ?? 0);
      }
      return $b['score'] <=> $a['score'];
    });
    $relatedCars = array_slice($relatedCars, 0, 4);
  } catch (Exception $e) {
    $relatedCars = [];
  }
}
?>
<!DOCTYPE html>
<html lang="en">

<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <meta http-equiv="Cache-Control" content="no-cache, no-store, must-revalidate" />
  <meta http-equiv="Pragma" content="no-cache" />
  <meta http-equiv="Expires" content="0" />
  <title><?= esc($pageTitle) ?></title>
  <link rel="stylesheet" href="css/common.css" />
  <link rel="stylesheet" href="css/style.css" />
  <link rel="stylesheet" href="css/car-details.css" />
  <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css" />
  <link rel="shortcut icon" href="assets/favicon/car.png" />
</head>

<body>
  <!-- Header with Navigation -->
  <nav class="nav-bar-services">
    <a href="index.html" class="logo">
      <img src="assets/images/logo.png" alt="Auto Nest Logo" />
    </a>
    <div class="nav-bar-search">
      <img src="assets/icons/search.svg" alt="search" title="search" width="24" height="24" />
      <input id="search-input" class="search" type="text" placeholder="Search" />
    </div>
    <div class="nav-bar-links">
      <ul>
        <li><a href="index.html">Home</a></li>
        <li><a href="about-contact.html">About Us</a></li>
        <li><a href="services.html">Car Service</a></li>
        <li><a href="about-contact.html#contact">Contact</a></li>
      </ul>
    </div>
  </nav>

  <!-- Main Content -->
  <main class="car-details-container">
    <!-- States -->
    <div id="page-loading" class="state state-loading" hidden>
      <div class="loading-spinner"></div>
      <p>Loading car details...</p>
    </div>

    <?php if ($errorTitle): ?>
      <div id="page-error" class="state state-error">
        <h3 id="error-title"><?= esc($errorTitle) ?></h3>
        <p id="error-message"><?= esc($errorMessage) ?></p>
        <a href="services.html" class="hero-btn">Back to Cars</a>
      </div>
    <?php else: ?>
      <div id="page-error" class="state state-error" hidden>
        <h3 id="error-title">Error</h3>
        <p id="error-message"></p>
        <a href="services.html" class="hero-btn">Back to Cars</a>
      </div>
    <?php endif; ?>

    <!-- Dynamic Content -->
    <div id="page-content" <?= $errorTitle ? 'hidden' : '' ?>>
      <div class="breadcrumb" id="breadcrumb">
        <a href="index.html">Home</a> > <a href="services.html">Car Service</a> > <span><?= esc($title) ?></span>
      </div>
      <div class="status-badges" id="status-badges">
        <?php if ($isPopular): ?><div class="status-badge popular">Popular</div><?php endif; ?>
        <?php if ($isLuxury): ?><div class="status-badge luxury">Luxury</div><?php endif; ?>
        <?php if ($isUsed === true): ?><div class="status-badge used">Used</div><?php endif; ?>
        <?php if ($isUsed === false): ?><div class="status-badge new">New</div><?php endif; ?>
      </div>

      <section class="car-gallery-section" aria-label="Car gallery">
        <div class="main-car-image">
          <img id="main-image" src="<?= esc($images[0]['src'] ?? $fallbackImage) ?>" alt="<?= esc($images[0]['label'] ?? 'Car image') ?>" onerror="this.src='<?= esc($fallbackImage) ?>'" />
          <div class="image-nav">
            <button class="nav-btn prev-btn" type="button" aria-label="Previous image">
              <i class="fas fa-chevron-left"></i>
            </button>
            <button class="nav-btn next-btn" type="button" aria-label="Next image">
              <i class="fas fa-chevron-right"></i>
            </button>
          </div>
        </div>

        <div class="thumbnail-gallery" id="thumbnail-gallery">
          <?php foreach ($images as $i => $img): ?>
            <button type="button" class="thumbnail<?= $i === 0 ? ' active' : '' ?>">
              <img src="<?= esc($img['src']) ?>" alt="<?= esc($img['label']) ?>" onerror="this.src='<?= esc($fallbackImage) ?>'">
              <span class="thumbnail-label"><?= esc($img['label']) ?></span>
            </button>
          <?php endforeach; ?>
        </div>
      </section>

      <section class="details-booking-section">
        <div class="car-details-info">
          <div class="car-header">
            <h1 id="car-title">
              <?= esc($title) ?>
              <?php if ($car && isset($car['year']) && $car['year'] !== ''): ?>
                <span class="car-brand"><?= esc($car['year']) ?></span>
              <?php endif; ?>
            </h1>
            <div class="car-rating">
              <div class="stars" id="car-stars"><?= starsHtml($rating) ?></div>
              <span class="rating-text" id="car-rating-text"><?= esc((string)$rating) ?> (<?= esc((string)$reviews) ?> reviews)</span>
            </div>
          </div>

          <?php $desc = $car ? ($car['description'] ?? '') : ''; ?>
          <div class="car-description" id="car-description-container" <?= ($desc === '' || $desc === null) ? 'hidden' : '' ?>>
            <p id="car-description"><?= esc($desc) ?></p>
          </div>

          <div class="price-section">
            <div class="daily-rate">
              <span class="rate-label"><i class="fas fa-calendar-day"></i> Daily Rate</span>
              <span class="rate-amount"><span id="daily-rate"><?= esc(formatNumber($price)) ?></span> birr</span>
            </div>
            <div class="weekly-rate">
              <span class="rate-label"><i class="fas fa-calendar-week"></i> Weekly Rate</span>
              <span class="rate-amount"><span id="weekly-rate"><?= esc(formatNumber($weekly)) ?></span> birr</span>
              <div class="rate-save">Save 15% on weekly rental</div>
            </div>
          </div>

          <div class="car-specs" id="primary-specs-section" <?= empty($primarySpecs) ? 'hidden' : '' ?>>
            <h3><i class="fas fa-cogs"></i> Vehicle Specifications</h3>
            <div class="specs-grid" id="primary-specs">
              <?php foreach ($primarySpecs as $it): ?>
                <div class="spec-item">
                  <i class="fas <?= esc($it['icon']) ?>"></i>
                  <div class="spec-content">
                    <span class="spec-label"><?= esc($it['label']) ?></span>
                    <span class="spec-value"><?= esc($it['value']) ?></span>
                  </div>
                </div>
              <?php endforeach; ?>
            </div>
          </div>

          <div class="features-list" id="features-section" <?= empty($features) ? 'hidden' : '' ?>>
            <h3><i class="fas fa-star"></i> Key Features</h3>
            <div class="features-grid" id="features-grid">
              <?php foreach (array_slice($features, 0, 10) as $f): ?>
                <div class="feature-item"><i class="fas fa-check-circle"></i><span><?= esc($f) ?></span></div>
              <?php endforeach; ?>
              <?php if (count($features) > 10): ?>
                <div class="feature-item"><i class="fas fa-plus-circle"></i><span><?= esc('+' . (count($features) - 10) . ' more') ?></span></div>
              <?php endif; ?>
            </div>
          </div>

          <div class="car-specs" id="additional-specs-section" <?= empty($additionalSpecs) ? 'hidden' : '' ?>>
            <h3><i class="fas fa-info-circle"></i> Additional Information</h3>
            <div class="specs-grid" id="additional-specs">
              <?php foreach ($additionalSpecs as $it): ?>
                <div class="spec-item">
                  <i class="fas <?= esc($it['icon']) ?>"></i>
                  <div class="spec-content">
                    <span class="spec-label"><?= esc($it['label']) ?></span>
                    <span class="spec-value"><?= esc($it['value']) ?></span>
                  </div>
                </div>
              <?php endforeach; ?>
            </div>
          </div>

          <div class="extra-fields" id="extra-fields-section" <?= empty($extraFields) ? 'hidden' : '' ?>>
            <h3><i class="fas fa-list"></i> All Data Fields</h3>
            <div class="kv-grid" id="extra-fields-grid">
              <?php foreach ($extraFields as [$k, $v]): ?>
                <div class="kv-item">
                  <div class="kv-key"><?= esc($k) ?></div>
                  <div class="kv-val"><?= esc($v) ?></div>
                </div>
              <?php endforeach; ?>
            </div>
          </div>
        </div>

        <div class="booking-form-container">
          <h2><i class="fas fa-calendar-check"></i> Book This Vehicle</h2>
          <form id="booking-form">
            <input type="hidden" id="car-id" value="<?= esc($car['id'] ?? '') ?>" />
            <input type="hidden" id="car-name" value="<?= esc($title) ?>" />
            <input type="hidden" id="daily-rate-input" value="<?= esc((string)$price) ?>" />

            <div class="form-group">
              <label for="full-name"><i class="fas fa-user"></i> Full Name *</label>
              <input type="text" id="full-name" name="full-name" required placeholder="Enter your full name" />
              <div class="error-message" id="full-name-error"></div>
            </div>

            <div class="form-group">
              <label for="email"><i class="fas fa-envelope"></i> Email Address *</label>
              <input type="email" id="email" name="email" required placeholder="your.email@example.com" />
              <div class="error-message" id="email-error"></div>
            </div>

            <div class="form-group">
              <label for="phone"><i class="fas fa-phone"></i> Phone Number *</label>
              <input type="tel" id="phone" name="phone" required placeholder="+251 9XX XXX XXX" />
              <div class="error-message" id="phone-error"></div>
            </div>

            <div class="date-group">
              <div class="form-group">
                <label for="pickup-date"><i class="fas fa-calendar-plus"></i> Pick-up Date *</label>
                <input type="date" id="pickup-date" name="pickup-date" required />
                <div class="error-message" id="pickup-date-error"></div>
              </div>

              <div class="form-group">
                <label for="dropoff-date"><i class="fas fa-calendar-minus"></i> Drop-off Date *</label>
                <input type="date" id="dropoff-date" name="dropoff-date" required />
                <div class="error-message" id="dropoff-date-error"></div>
              </div>
            </div>

            <div class="form-group">
              <label for="pickup-location"><i class="fas fa-map-marker-alt"></i> Pick-up Location *</label>
              <select id="pickup-location" name="pickup-location" required>
                <option value="">Select location</option>
                <option value="addis_ababa_airport">Addis Ababa Bole Airport</option>
                <option value="addis_ababa_center">City Center Office</option>
                <option value="addis_ababa_south">South Addis Office</option>
                <option value="other_location">Other (Specify in notes)</option>
              </select>
              <div class="error-message" id="pickup-location-error"></div>
            </div>

            <div class="form-group">
              <label for="driver-type"><i class="fas fa-id-card"></i> Driver Option</label>
              <select id="driver-type" name="driver-type">
                <option value="self_drive">Self Drive</option>
                <option value="with_driver">With Driver (Additional 2,000 birr/day)</option>
              </select>
            </div>

            <div class="form-group">
              <label for="special-requests"><i class="fas fa-comment"></i> Special Requests</label>
              <textarea id="special-requests" name="special-requests" rows="3"
                placeholder="Any special requirements or questions..."></textarea>
            </div>

            <div class="total-price">
              <div class="total-row">
                <span>Rental Period:</span>
                <span><span id="total-days">0</span> days</span>
              </div>
              <div class="total-row">
                <span>Daily Rate:</span>
                <span><span id="display-daily-rate"><?= esc(formatNumber($price)) ?></span> birr</span>
              </div>
              <div class="total-row">
                <span>Weekly Discount:</span>
                <span id="discount-amount">0 birr</span>
              </div>
              <div class="total-row">
                <span>Driver Fee:</span>
                <span id="driver-fee">0 birr</span>
              </div>
              <div class="total-row total">
                <span>Total Price:</span>
                <span id="total-price">0 birr</span>
              </div>
            </div>

            <button type="submit" class="submit-btn">
              <i class="fas fa-calendar-check"></i>
              Book Now
            </button>
          </form>

          <div class="success-message" id="success-message">
            <i class="fas fa-check-circle"></i>
            <h3>Booking Request Submitted!</h3>
            <p>Our team will contact you shortly to confirm your reservation and discuss payment details.</p>
            <div class="success-details" id="success-details"></div>
            <button type="button" onclick="window.location.href='services.html'" class="hero-btn" style="margin-top: 20px;">
              Browse More Cars
            </button>
          </div>
        </div>
      </section>

      <section class="related-cars" id="related-cars" <?= empty($relatedCars) ? 'hidden' : '' ?>>
        <h2>You Might Also Like</h2>
        <div class="related-cars-grid" id="related-cars-grid">
          <?php foreach ($relatedCars as $wrap): $rc = $wrap['car']; ?>
            <?php
              $rcTitle = trim(($rc['brand'] ?? '') . ' ' . ($rc['name'] ?? '')) ?: 'Car';
              $rcImages = collectImages($rc, $fallbackImage);
              $rcImg = $rcImages[0]['src'] ?? $fallbackImage;
              $rcSpecs = array_filter([$rc['bodyType'] ?? null, $rc['fuelType'] ?? null, $rc['transmission'] ?? null]);
            ?>
            <a class="related-car-card" href="car-details.php?id=<?= esc(urlencode((string)($rc['id'] ?? ''))) ?>">
              <img alt="<?= esc($rcTitle) ?>" src="<?= esc($rcImg) ?>" onerror="this.src='<?= esc($fallbackImage) ?>'">
              <div class="card-content">
                <h3><?= esc($rcTitle) ?></h3>
                <p class="price"><?= esc(formatNumber($rc['price'] ?? 0)) ?> birr / day</p>
                <div class="specs"><?= esc(implode(' • ', $rcSpecs)) ?></div>
                <div class="related-badges">
                  <?php if (toBool($rc['isLuxury'] ?? null) === true): ?><div class="status-badge luxury">Luxury</div><?php endif; ?>
                  <?php if (toBool($rc['isPopular'] ?? null) === true): ?><div class="status-badge popular">Popular</div><?php endif; ?>
                </div>
              </div>
            </a>
          <?php endforeach; ?>
        </div>
      </section>
    </div>
  </main>

  <!-- Footer -->
  <footer>
    <div class="footer-container footer-top">
      <div class="footer-info">
        <div class="footer-logo-container">
          <img src="assets/images/logo.png" alt="logo" />
          <span class="logo-text">Auto Nest</span>
        </div>
        <p class="tagline">
          Your trusted partner for car rentals in Ethiopia
        </p>
        <div class="social-links">
          <a href="https://t.me/autonest" class="social-link" target="_blank" rel="noopener">
            <img src="assets/icons/telegram-logo.svg" alt="Telegram" />
          </a>
          <a href="https://facebook.com/autonest" class="social-link" target="_blank" rel="noopener">
            <img src="assets/icons/facebook-logo.svg" alt="Facebook" />
          </a>
          <a href="https://linkedin.com/company/autonest" class="social-link" target="_blank" rel="noopener">
            <img src="assets/icons/linkedin-logo.svg" alt="LinkedIn" />
          </a>
          <a href="https://linkedin.com/company/autonest" class="social-link" target="_blank" rel="noopener">
            <img src="assets/icons/x-logo.svg" alt="X (Twitter)" />
          </a>
          <a href="https://instagram.com/autonest" class="social-link" target="_blank" rel="noopener">
            <img src="assets/icons/instagram-logo.svg" alt="Instagram" />
          </a>
          <a href="https://tiktok.com/@autonest" class="social-link" target="_blank" rel="noopener">
            <img src="assets/icons/tiktok-logo.svg" alt="Tiktok" />
          </a>
        </div>
      </div>

      <div class="footer-links">
        <div class="link-column">
          <h4 class="column-title">PAGES</h4>
          <ul class="link-list">
            <li><a href="index.html">Home</a></li>
            <li><a href="about-contact.html">About Us</a></li>
            <li><a href="services.html">Car Service</a></li>
            <li><a href="about-contact.html">Contact</a></li>
            <li><a href="car-details.php?id=1">Car Details</a></li>
          </ul>
        </div>

        <div class="link-column">
          <h4 class="column-title">SUPPORT</h4>
          <ul class="link-list">
            <li><a href="#help">Help Center</a></li>
            <li><a href="#terms">Terms of Service</a></li>
            <li><a href="#privacy">Privacy Policy</a></li>
            <li><a href="#cookies">Cookie Policy</a></li>
          </ul>
        </div>

        <div class="link-column">
          <h4 class="column-title">CONTACT US</h4>
          <div class="contact-info">
            <div class="contact-link">
              <img src="assets/icons//phone.svg" alt="Phone" />
              <a href="tel:+251912345678">+251 912 345 678</a>
              <p>|</p>
              <a href="tel:+251912345678">+251 912 345 678</a>
            </div>
            <div class="contact-link">
              <img src="assets/icons/envelope-simple.svg" alt="Email" />
              <a href="mailto:support@autonestrental.com">
                support@autonestrental.com
              </a>
            </div>
            <div class="contact-link">
              <img src="assets/icons/map-pin.svg" alt="Location" />
              <span>Haile Gebrselassie St. Addis Ababa, Ethiopia</span>
            </div>
          </div>
        </div>
      </div>
    </div>
    <!-- Bottom Section -->
    <div class="footer-bottom">
      <div class="footer-info">
        <p class="footer-description">
          <span>AutoNest</span> Licensed car rental service provider operating
          in Ethiopia.
        </p>
        <p class="footer-credit">Made with 🤍 in Ethiopia</p>
      </div>
      <div class="footer-copyright">
        <p>&copy; 2025 AutoNest. All rights reserved.</p>
      </div>
    </div>
  </footer>

  <script src="js/car-details.js?v=20260406"></script>
</body>

</html>
