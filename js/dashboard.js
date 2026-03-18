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
        const response = await fetch("./data/dashboard.json");
        if (!response.ok) throw new Error(`Failed to load JSON: ${response.status} ${response.statusText}`);
        dashboardData = await response.json();

        if (totalBookingsEl) totalBookingsEl.textContent = dashboardData.stats.totalBookings;
        if (availableCarsEl) availableCarsEl.textContent = dashboardData.stats.availableCars;
        if (dashTotalCarsEl) dashTotalCarsEl.textContent = dashboardData.stats.totalCars;
        if (dashTotalBookingsEl) dashTotalBookingsEl.textContent = dashboardData.stats.totalBookings;
        if (dashAvailableCarsEl) dashAvailableCarsEl.textContent = dashboardData.stats.availableCars;
        if (dashCustomersEl) dashCustomersEl.textContent = dashboardData.stats.totalCustomers;

        renderCharts();
    } catch (error) {
        showError(`Failed to load dashboard: ${error.message}`);
        console.error("Error loading dashboard.json:", error);
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

    // Monthly Bookings Chart
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
            plugins: {
                legend: { display: false }
            },
            scales: {
                y: { beginAtZero: true }
            }
        }
    });

    // Car Status Chart
    new Chart(carStatusCtx, {
        type: 'doughnut',
        data: {
            labels: ['Available', 'Booked', 'Maintenance'],
            datasets: [{
                data: [12, 7, 3],
                backgroundColor: ['#28a745', '#ffc107', '#dc3545'],
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

    // Customer Growth Chart
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
            plugins: {
                legend: { display: false }
            },
            scales: {
                y: { beginAtZero: true }
            }
        }
    });

}

document.addEventListener("DOMContentLoaded", loadDashboard);