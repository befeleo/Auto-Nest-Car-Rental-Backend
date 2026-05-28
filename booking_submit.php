<?php
require_once __DIR__ . '/database/db_connect.php';

header('X-Content-Type-Options: nosniff');

function jsonResponse(int $status, array $payload): void
{
  http_response_code($status);
  header('Content-Type: application/json; charset=utf-8');
  echo json_encode($payload);
  exit;
}

function isAjaxRequest(): bool
{
  $requestedWith = $_SERVER['HTTP_X_REQUESTED_WITH'] ?? '';
  if (strtolower($requestedWith) === 'xmlhttprequest') return true;
  $accept = $_SERVER['HTTP_ACCEPT'] ?? '';
  return stripos($accept, 'application/json') !== false;
}

function post(string $key): string
{
  $v = $_POST[$key] ?? '';
  return is_string($v) ? trim($v) : '';
}

function requireField(string $key, string $label): string
{
  $v = post($key);
  if ($v === '') jsonFail("$label is required.", 422);
  return $v;
}

function jsonFail(string $message, int $status = 400): void
{
  if (isAjaxRequest()) jsonResponse($status, ['ok' => false, 'error' => $message]);
  $carId = post('car_id');
  if ($carId !== '' && ctype_digit($carId)) {
    header('Location: car-details.php?id=' . urlencode($carId) . '&booking=error&error=' . urlencode($message));
  } else {
    header('Location: services.php?booking=error');
  }
  exit;
}

function normalizePhone(string $phone): string
{
  $p = preg_replace('/\s+/', '', $phone);
  return $p ?? $phone;
}

function parseDate(string $yyyyMmDd): ?DateTimeImmutable
{
  $d = DateTimeImmutable::createFromFormat('Y-m-d', $yyyyMmDd);
  if (!$d) return null;
  $errors = DateTimeImmutable::getLastErrors();
  if (($errors['warning_count'] ?? 0) > 0 || ($errors['error_count'] ?? 0) > 0) return null;
  return $d;
}

if (($_SERVER['REQUEST_METHOD'] ?? 'GET') !== 'POST') {
  if (isAjaxRequest()) jsonResponse(405, ['ok' => false, 'error' => 'Method not allowed.']);
  header('Location: services.php');
  exit;
}

$carIdRaw = requireField('car_id', 'Car');
if (!ctype_digit($carIdRaw)) jsonFail('Invalid car id.', 422);
$carId = (int)$carIdRaw;

function ensureCarStatusColumnExists(PDO $pdo): void
{
  $hasStatus = $pdo->query("SHOW COLUMNS FROM cars LIKE 'status'")->rowCount();
  if ($hasStatus === 0) {
    $pdo->exec("ALTER TABLE cars ADD COLUMN status VARCHAR(20) NOT NULL DEFAULT 'available' AFTER image_path");
  }
}

ensureCarStatusColumnExists($pdo);

$fullName = requireField('full-name', 'Full name');
$email = requireField('email', 'Email');
$phone = normalizePhone(requireField('phone', 'Phone number'));
$pickupDateRaw = requireField('pickup-date', 'Pick-up date');
$dropoffDateRaw = requireField('dropoff-date', 'Drop-off date');
$pickupLocation = requireField('pickup-location', 'Pick-up location');
$driverType = post('driver-type');
if ($driverType === '') $driverType = 'self_drive';
$specialRequests = post('special-requests');

if (!filter_var($email, FILTER_VALIDATE_EMAIL)) jsonFail('Invalid email address.', 422);
if (!preg_match('/^(\+251|0)[0-9]{9}$/', $phone)) jsonFail('Phone format must be +251XXXXXXXXX or 0XXXXXXXXX.', 422);

$pickupDate = parseDate($pickupDateRaw);
$dropoffDate = parseDate($dropoffDateRaw);
if (!$pickupDate || !$dropoffDate) jsonFail('Invalid pick-up or drop-off date.', 422);
if ($dropoffDate <= $pickupDate) jsonFail('Drop-off date must be after pick-up date.', 422);

try {
  $stmt = $pdo->prepare("SELECT id, brand, name, price, status FROM cars WHERE id = ? LIMIT 1");
  $stmt->execute([$carId]);
  $car = $stmt->fetch(PDO::FETCH_ASSOC) ?: null;
  if (!$car) jsonFail('Car not found.', 404);

  $status = strtolower(trim((string)($car['status'] ?? 'available')));
  if ($status !== 'available') {
    jsonFail('This car is currently not available.', 409);
  }

  $pricePerDay = isset($car['price']) && is_numeric($car['price']) ? (float)$car['price'] : 0.0;
  $days = (int)$dropoffDate->diff($pickupDate)->format('%a');
  if ($days <= 0) jsonFail('Invalid rental period.', 422);

  $base = $days * $pricePerDay;
  $weeks = intdiv($days, 7);
  $discount = $weeks > 0 ? ($weeks * 7 * $pricePerDay * 0.15) : 0.0;
  $driverFee = ($driverType === 'with_driver') ? ($days * 2000.0) : 0.0;
  $total = max(0.0, $base - $discount + $driverFee);

  $pdo->exec("
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
  ");

  $carName = trim(($car['brand'] ?? '') . ' ' . ($car['name'] ?? '')) ?: ('Car #' . $carId);

  $ins = $pdo->prepare("
    INSERT INTO bookings
      (car_id, car_name, full_name, email, phone, pickup_date, dropoff_date, pickup_location, driver_type, special_requests,
       total_days, price_per_day, discount_amount, driver_fee, total_price, status)
    VALUES
      (:car_id, :car_name, :full_name, :email, :phone, :pickup_date, :dropoff_date, :pickup_location, :driver_type, :special_requests,
       :total_days, :price_per_day, :discount_amount, :driver_fee, :total_price, 'pending')
  ");
  $ins->execute([
    ':car_id' => $carId,
    ':car_name' => $carName,
    ':full_name' => $fullName,
    ':email' => $email,
    ':phone' => $phone,
    ':pickup_date' => $pickupDate->format('Y-m-d'),
    ':dropoff_date' => $dropoffDate->format('Y-m-d'),
    ':pickup_location' => $pickupLocation,
    ':driver_type' => $driverType,
    ':special_requests' => ($specialRequests === '' ? null : $specialRequests),
    ':total_days' => $days,
    ':price_per_day' => $pricePerDay,
    ':discount_amount' => $discount,
    ':driver_fee' => $driverFee,
    ':total_price' => $total,
  ]);

  $bookingId = (int)$pdo->lastInsertId();
  $pdo->prepare("UPDATE cars SET status = 'booked' WHERE id = ?")->execute([$carId]);

  if (isAjaxRequest()) {
    jsonResponse(200, [
      'ok' => true,
      'booking' => [
        'id' => $bookingId,
        'carName' => $carName,
        'pickupDate' => $pickupDate->format('Y-m-d'),
        'dropoffDate' => $dropoffDate->format('Y-m-d'),
        'totalDays' => $days,
        'totalPrice' => $total,
      ],
    ]);
  }

  header('Location: car-details.php?id=' . urlencode((string)$carId) . '&booking=success&booking_id=' . urlencode((string)$bookingId));
  exit;
} catch (PDOException $e) {
  jsonFail('Database error while saving booking.', 500);
} catch (Exception $e) {
  jsonFail('Unexpected error while saving booking.', 500);
}
