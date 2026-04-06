<?php
// 1. Capture the search term from the URL (GET method)
$searchTerm = isset($_GET['search']) ? $_GET['search'] : '';
?>
<!DOCTYPE html>
<html lang="en">

<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Car Services | Auto Nest</title>
  <link rel="stylesheet" href="css/common.css" />
  <link rel="stylesheet" href="css/style.css" />
  <link rel="stylesheet" href="css/responsive.css" />
  <link rel="shortcut icon" href="assets/favicon/car.png" />
</head>

<body>
  <nav class="nav-bar-services">
    <a href="index.html" class="logo">
      <img src="assets/images/logo.png" alt="logo" />
    </a>

    <form action="services.php" method="GET" class="nav-bar-search">
      <img src="assets/icons/search.svg" alt="search" title="search" width="24" height="24" />
      <input
        name="search"
        id="search-input"
        class="search"
        type="text"
        placeholder="Search cars..."
        value="<?php echo htmlspecialchars($searchTerm); ?>" />
      <button type="submit" style="display: none;"></button>
    </form>

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
    <div id="car-list" class="car-grid"> </div>
  </main>

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
          <a href="https://t.me/autonest" class="social-link" target="_blank" rel="noopener"><img src="assets/icons/telegram-logo.svg" alt="Telegram" /></a>
          <a href="https://facebook.com/autonest" class="social-link" target="_blank" rel="noopener"><img src="assets/icons/facebook-logo.svg" alt="Facebook" /></a>
          <a href="https://linkedin.com/company/autonest" class="social-link" target="_blank" rel="noopener"><img src="assets/icons/linkedin-logo.svg" alt="LinkedIn" /></a>
          <a href="https://instagram.com/autonest" class="social-link" target="_blank" rel="noopener"><img src="assets/icons/instagram-logo.svg" alt="Instagram" /></a>
        </div>
      </div>

      <div class="footer-links">
        <div class="link-column">
          <h4 class="column-title">PAGES</h4>
          <ul class="link-list">
            <li><a href="index.html">Home</a></li>
            <li><a href="about-contact.html">About Us</a></li>
            <li><a href="services.php">Car Service</a></li>
            <li><a href="about-contact.html">Contact</a></li>
          </ul>
        </div>

        <div class="link-column">
          <h4 class="column-title">CONTACT US</h4>
          <div class="contact-info">
            <div class="contact-link">
              <img src="assets/icons/phone.svg" alt="Phone" />
              <a href="tel:+251912345678">+251 912 345 678</a>
            </div>
            <div class="contact-link">
              <img src="assets/icons/envelope-simple.svg" alt="Email" />
              <a href="mailto:support@autonestrental.com">support@autonestrental.com</a>
            </div>
          </div>
        </div>
      </div>
    </div>

    <div class="footer-bottom">
      <div class="footer-info">
        <p class="footer-description">
          <span>AutoNest</span> Licensed car rental service provider operating in Ethiopia.
        </p>
        <p class="footer-credit">Made with 🤍 in Ethiopia</p>
      </div>
      <div class="footer-copyright">
        <p>&copy; 2025 AutoNest. All rights reserved.</p>
      </div>
    </div>
  </footer>

  <script src="js/script_services.js?v=1.1"></script>
</body>

</html>