const totalBookingsEl = document.getElementById("totalBookings");
const availableCarsEl = document.getElementById("availableCars");
const dashTotalCarsEl = document.getElementById("dash-total-cars");
const dashTotalBookingsEl = document.getElementById("dash-total-bookings");
const dashAvailableCarsEl = document.getElementById("dash-available-cars");
const dashCustomersEl = document.getElementById("dash-customers");
const chartsContainer = document.getElementById("charts-container");

let dashboardData = {};

function showLoading() {
    if (chartsContainer) chartsContainer.innerHTML = `<div class="loading">Loading dashboard...</div>`;
}

function showError(message) {
    if (chartsContainer) chartsContainer.innerHTML = `<div class="error">${message}</div>`;
}

async function loadDashboard() {
    showLoading();

    try {
        // CHANGED: Now fetching from your PHP script instead of a static JSON file
        const response = await fetch("admin/get_dashboard_stats.php");

        if (!response.ok) throw new Error(`Server Error: ${response.status}`);

        dashboardData = await response.json();

        // Map the data from PHP to your HTML elements
        // We use || 0 as a fallback in case the database returns null
        if (totalBookingsEl) totalBookingsEl.textContent = dashboardData.stats.totalBookings || 0;
        if (availableCarsEl) availableCarsEl.textContent = dashboardData.stats.availableCars || 0;
        if (dashTotalCarsEl) dashTotalCarsEl.textContent = dashboardData.stats.totalCars || 0;
        if (dashTotalBookingsEl) dashTotalBookingsEl.textContent = dashboardData.stats.totalBookings || 0;
        if (dashAvailableCarsEl) dashAvailableCarsEl.textContent = dashboardData.stats.availableCars || 0;
        if (dashCustomersEl) dashCustomersEl.textContent = dashboardData.stats.totalCustomers || 0;

        renderCharts();
    } catch (error) {
        showError(`Failed to load dashboard: ${error.message}`);
        console.error("Dashboard Fetch Error:", error);
    }
}

function renderCharts() {
    if (!chartsContainer) return;

    chartsContainer.innerHTML = `
      <div class="chart-box">
        <h3>Monthly Bookings</h3>
        <canvas id="bookingChart"></canvas>
      </div>
      <div class="chart-box">
        <h3>Car Status</h3>
        <canvas id="carStatusChart"></canvas>
      </div>
      <div class="chart-box">
        <h3>Customer Growth</h3>
        <canvas id="customerGrowthChart"></canvas>
      </div>
    `;

    const bookingCtx = document.getElementById('bookingChart').getContext('2d');
    const carStatusCtx = document.getElementById('carStatusChart').getContext('2d');
    const customerGrowthCtx = document.getElementById('customerGrowthChart').getContext('2d');

    // Monthly Bookings Chart (Static for now, as database trends require more complex SQL)
    new Chart(bookingCtx, {
        type: 'line',
        data: {
            labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
            datasets: [{
                label: 'Bookings',
                data: [30, 45, 28, 60, 75, 50, 80, 90, 70, 60, 50, 65],
                backgroundColor: 'rgba(233, 69, 96, 0.2)',
                borderColor: '#e94560',
                borderWidth: 3,
                fill: true,
                tension: 0.4
            }]
        },
        options: {
            responsive: true,
            plugins: { legend: { display: false } },
            scales: { y: { beginAtZero: true } }
        }
    });

    // Car Status Chart (DYNAMIC: Uses real data from your PHP)
    new Chart(carStatusCtx, {
        type: 'doughnut',
        data: {
            labels: ['Available', 'Booked'],
            datasets: [{
                // Pulling directly from the dashboardData object we fetched
                data: [
                    dashboardData.stats.availableCars,
                    dashboardData.stats.totalBookings
                ],
                backgroundColor: ['#28a745', '#ffc107'],
                borderWidth: 2,
                borderColor: '#fff'
            }]
        },
        options: {
            responsive: true,
            plugins: {
                legend: {
                    position: 'bottom',
                    labels: { color: '#1a1a2e', font: { weight: 600 } }
                }
            }
        }
    });

    // Customer Growth Chart (Static for now)
    new Chart(customerGrowthCtx, {
        type: 'bar',
        data: {
            labels: ['Week 1', 'Week 2', 'Week 3', 'Week 4'],
            datasets: [{
                label: 'New Customers',
                data: [15, 25, 20, 30],
                backgroundColor: 'rgba(58, 123, 213, 0.7)',
                borderColor: '#3a7bd5',
                borderWidth: 1,
                borderRadius: 6
            }]
        },
        options: {
            responsive: true,
            plugins: { legend: { display: false } },
            scales: { y: { beginAtZero: true } }
        }
    });
}

document.addEventListener("DOMContentLoaded", loadDashboard);