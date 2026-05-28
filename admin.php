<?php
session_start();
if (empty($_SESSION['autonest_admin'])) {
  header('Location: login.html');
  exit;
}
?>
<!doctype html>
<html lang="en">

<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Admin Dashboard</title>
  <link rel="stylesheet" href="css/admin.css" />
  <link rel="shortcut icon" href="assets/favicon/car.png" />
  <script src="https://cdn.jsdelivr.net/npm/chart.js"></script>
  <script src="https://cdn.jsdelivr.net/npm/chart.js/dist/chart.js"></script>
</head>

<body>
  <div class="admin-wrapper">
    <aside class="admin-sidebar">
      <div class="logo">Auto Nest <span>Admin</span></div>
      <nav id="admin-nav">
        <a href="#" class="nav-link active" data-section="dashboard">
          <img src="assets/icons/chart-simple-solid.svg" alt="" class="nav-icon" />Dashboard
        </a>
        <a href="#" class="nav-link" data-section="inventory">
          <img src="assets/icons/car-side-solid.svg" alt="car" class="nav-icon" />Manage Inventory
        </a>
        <a href="#" class="nav-link" data-section="bookings">
          <img src="assets/icons/calendar-solid.svg" alt="book" class="nav-icon" />Bookings
        </a>

        <a href="index.html" class="nav-link" data-section="site">
          <img src="assets/icons/globe-solid.svg" alt="website" class="nav-icon" />View Site
        </a>

        <a href="#" class="nav-link" data-section="setting">
          <img src="assets/icons/gear-solid.svg" alt="setting" class="nav-icon" />Setting
        </a>

        <div class="sidebar-footer">
          <a href="#" class="nav-link" data-section="logout" id="logoutBtn">
            <img src="assets/icons/arrow-right-from-bracket-solid.svg" alt="logout" class="nav-icon" />Logout
          </a>
        </div>
      </nav>
    </aside>

    <div class="main-body-wrapper">

      <main>
        <div id="dashboard-section" class="content-section active-section">
          <header class="inventory-header">
            <h1>Dashboard</h1>
          </header>

          <section class="dashboard-content">
            <div class="dashboard-cards">
              <div class="dash-card">
                <h4>Total Cars</h4>
                <p id="dash-total-cars">0</p>
              </div>

              <div class="dash-card">
                <h4>Total Bookings</h4>
                <p id="dash-total-bookings">0</p>
              </div>

              <div class="dash-card">
                <h4>Available Cars</h4>
                <p id="dash-available-cars">0</p>
              </div>

              <div class="dash-card">
                <h4>Customers</h4>
                <p id="dash-customers">0</p>
              </div>
            </div>

            <div class="dashboard-charts">
              <div class="chart-box">
                <h3>Bookings Overview</h3>
                <canvas id="bookingChart"></canvas>
              </div>

              <div class="chart-box">
                <h3>Vehicle Categories</h3>
                <canvas id="vehicleChart"></canvas>
              </div>
            </div>
          </section>
        </div>

        <div id="inventory-section" class="content-section">
          <header class="inventory-header">
            <h1>Manage Inventory</h1>
            <button id="openModalBtn" type="button">+ Add New Car</button>
          </header>

          <section class="admin-table">
            <h3>Current Inventory</h3>
            <div class="table-scroll">
              <table id="car-table">
                <thead>
                  <tr>
                    <th>ID</th>
                    <th>BRAND</th>
                    <th>MODEL</th>
                    <th>TYPE</th>
                    <th>PRICE (Day)</th>
                    <th>ACTIONS</th>
                  </tr>
                </thead>
                <tbody id="admin-car-list"></tbody>
              </table>
            </div>
          </section>
        </div>

        <div id="bookings-section" class="content-section">
          <header class="inventory-header">
            <h1>Manage Bookings</h1>
          </header>

          <div id="booking-admin-message" class="admin-feedback" hidden></div>

          <section class="admin-table">
            <h3>Customer Requests</h3>
            <div class="table-scroll">
              <table id="booking-table">
                <thead>
                  <tr>
                    <th>ID</th>
                    <th>CUSTOMER</th>
                    <th>VEHICLE</th>
                    <th>PICKUP</th>
                    <th>DROP-OFF</th>
                    <th>PHONE</th>
                    <th>TOTAL</th>
                    <th>STATUS</th>
                    <th>ACTIONS</th>
                  </tr>
                </thead>
                <tbody id="admin-booking-list"></tbody>
              </table>
            </div>
          </section>
        </div>

        <div id="setting-section" class="content-section">
          <header class="inventory-header">
            <h1>Setting</h1>
          </header>

          <div class="settings-grid">

            <div id="profile-view-container" class="settings-sub-card">
              <div class="card-header-flex" style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 24px;">
                <h4 style="margin: 0;">Admin Profile</h4>
                <button type="button" class="btn-switch-account" id="go-to-create-btn">
                  + Add Admin
                </button>
              </div>

              <div class="profile-upload-container">
                <div class="profile-preview">
                  <img src="assets/icons/user-solid.svg" alt="Profile" id="profile-img-preview" />
                </div>
                <label for="admin-photo-upload" id="change-admin-photo">Change Photo</label>
                <input type="file" id="admin-photo-upload" accept="image/*" />
              </div>

              <form id="admin-profile-form" class="setting-form-grid">
                <div class="form-fields-column">
                  <div class="input-group">
                    <label for="admin-name">Profile Name</label>
                    <input type="text" id="admin-name" value="" readonly />
                  </div>
                  <div class="input-group">
                    <label for="admin-email">Email Address</label>
                    <input type="email" id="admin-email" value="" readonly />
                  </div>
                  <div class="input-group">
                    <label for="admin-password">Update Password</label>
                    <div class="input-wrapper">
                      <input type="password" id="admin-password" placeholder="••••••••" readonly />
                      <button type="button" id="admin-password-toggle" class="password-toggle" aria-label="Show password"></button>
                    </div>
                  </div>
                </div>

                <div class="form-actions-column">
                  <h5>Account Actions</h5>
                  <button type="button" class="btn-edit-mode" id="edit-profile-btn">Change Settings</button>
                  <button type="button" class="btn-logout-account" id="logout-account-btn">Log Out</button>
                  <button type="button" class="update-setting hidden" id="save-profile-btn">Save Profile</button>
                  <div id="profile-message" class="profile-message"></div>
                </div>
              </form>
            </div>

            <div id="create-view-container" class="settings-sub-card hidden">
              <div class="card-header-flex" style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 24px;">
                <h4 style="margin: 0;">Create New Admin Account</h4>
                <button type="button" class="btn-switch-account" id="cancel-create-btn">
                  ← Back to Profile
                </button>
              </div>

              <form id="create-admin-form" class="setting-form-grid">
                <div class="form-fields-column">
                  <div class="input-group">
                    <label for="new-admin-name">Full Name</label>
                    <input type="text" id="new-admin-name" name="adminName" placeholder="Enter full name" required />
                  </div>

                  <div class="input-group">
                    <label for="new-admin-email">Email Address</label>
                    <input type="email" id="new-admin-email" name="adminEmail" placeholder="Enter registration email" required />
                  </div>

                  <div class="input-group">
                    <label for="new-admin-password">Account Password</label>
                    <div class="input-wrapper">
                      <input type="password" id="new-admin-password" name="adminPassword" placeholder="Create secure password" required />
                      <button type="button" id="new-password-toggle" class="password-toggle" aria-label="Show password">👁</button>
                    </div>
                  </div>

                  <div class="input-group">
                    <label for="new-admin-confirm-password">Confirm Password</label>
                    <div class="input-wrapper">
                      <input type="password" id="new-admin-confirm-password" name="adminConfirmPassword" placeholder="Retype password" required />
                      <button type="button" id="confirm-password-toggle" class="password-toggle" aria-label="Show confirm password">👁</button>
                    </div>
                  </div>
                  <p class="password-note">Must be at least 6 characters long and match perfectly</p>
                </div>

                <div class="form-actions-column">
                  <h5>Management</h5>
                  <p style="font-size: 0.85rem; color: #6c757d; margin: 0; line-height: 1.4;">
                    Provide credentials to authorize access to the AutoNest administrator panel ecosystem.
                  </p>
                  <button type="submit" class="update-setting" id="create-admin-btn" style="margin-top: auto;">
                    Create Admin
                  </button>
                  <div id="register-message" class="profile-message"></div>
                </div>
              </form>
            </div>

          </div>
        </div>

        <div id="formModal" class="modal-overlay">
          <div class="modal-content">
            <div class="modal-header">
              <h3 id="modalTitle">Add New Vehicle</h3>
              <span id="closeModalBtn">&times;</span>
            </div>

            <!-- form -->
            <form id="add-car-form" enctype="multipart/form-data" method="POST">
              <input type="hidden" id="edit-id" name="id" />
              <div class="form-grid">
                <div class="form-group">
                  <label>Brand <span class="required">*</span></label>
                  <input type="text" id="brand" name="brand" placeholder="Brand" required />
                </div>

                <div class="form-group">
                  <label>Model Name <span class="required">*</span></label>
                  <input type="text" id="name" name="name" placeholder="Model" required />
                </div>

                <div class="form-group">
                  <label>Price per Day (Birr)<span class="required">*</span></label>
                  <input type="number" id="price" name="price" placeholder="Price" required />
                </div>

                <div class="form-group">
                  <label>Fuel Type <span class="required">*</span></label>
                  <select title="fuelype" id="fuelType" name="fuelType" required>
                    <option value="" disabled selected>
                      Select Fuel Type
                    </option>
                    <option value="Petrol">Petrol</option>
                    <option value="Diesel">Diesel</option>
                    <option value="Electric">Electric</option>
                  </select>
                </div>

                <div class="form-group">
                  <label>Body Type <span class="required">*</span></label>
                  <select title="bodyType" id="bodyType" name="bodyType" required>
                    <option value="" disabled selected>
                      Select Body Type
                    </option>
                    <option value="SUV">SUV</option>
                    <option value="Sedan">Sedan</option>
                    <option value="Pickup">Pickup</option>
                    <option value="Hatchback">Hatchback</option>
                  </select>
                </div>

                <div class="form-group">
                  <label>Transmission <span class="required">*</span></label>
                  <select title="transmission" id="transmission" name="transmission" required>
                    <option value="" disabled selected>
                      Select Transmission
                    </option>
                    <option value="Automatic">Automatic</option>
                    <option value="Manual">Manual</option>
                  </select>
                </div>
              </div>

              <div class="file-upload-conatiner">
                <div class="file-upload-group">
                  <label for="image-main">Main View (Required):</label>
                  <input type="file" id="image-main" name="car_image_main" accept="image/*" required />
                </div>

                <div class="file-upload-group">
                  <label for="image-side">Side View (Optional):</label>
                  <input type="file" id="image-side" name="car_image_side" accept="image/*" />
                </div>

                <div class="file-upload-group">
                  <label for="image-dashboard">Dashboard View (Optional):</label>
                  <input type="file" id="image-dashboard" name="car_image_dashboard" accept="image/*" />
                </div>
              </div>


              <div class="checkbox-group">
                <label><input type="checkbox" id="isUsed" name="isUsed" />
                  Used</label>
                <label><input type="checkbox" id="isPopular" name="isPopular" />
                  Popular</label>
                <label><input type="checkbox" id="isLuxury" name="isLuxury" />
                  Luxury Fleet</label>
              </div>

              <div class="form-group">
                <label>Key Features</label>
                <textarea id="features" name="features" placeholder="AC, Bluetooth, GPS"></textarea>
              </div>

              <div class="form-action">
                <button type="submit" class="btn-save" id="saveBtn">
                  Save Vehicle
                </button>
              </div>
            </form>
          </div>
        </div>
      </main>
    </div>
  </div>
  <script src="js/admin.js"></script>
  <script src="js/dashboard.js"></script>
  <script src="js/auth.js"></script>
</body>

</html>