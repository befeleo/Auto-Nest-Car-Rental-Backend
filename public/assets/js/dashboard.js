let dashboardData = { stats: { totalCars: 0, totalBookings: 0, availableCars: 0, totalCustomers: 0 } };
let monthlyBookingsData = array_fill_fallback(); 
let bookingChartInstance = null;
let vehicleChartInstance = null;

function array_fill_fallback() {
    return [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0];
}

function destroyCharts() {
    if (bookingChartInstance) {
        bookingChartInstance.destroy();
        bookingChartInstance = null;
    }
    if (vehicleChartInstance) {
        vehicleChartInstance.destroy();
        vehicleChartInstance = null;
    }
}

function updateDashboardCards(stats) {
    document.getElementById('dash-total-cars').textContent = stats.totalCars ?? 0;
    document.getElementById('dash-total-bookings').textContent = stats.totalBookings ?? 0;
    document.getElementById('dash-available-cars').textContent = stats.availableCars ?? 0;
    document.getElementById('dash-customers').textContent = stats.totalCustomers ?? 0;
}

function renderCharts() {
    const bookingCanvas = document.getElementById('bookingChart');
    const vehicleCanvas = document.getElementById('vehicleChart');

    if (!bookingCanvas || !vehicleCanvas) return;

    destroyCharts();

    const bookingCtx = bookingCanvas.getContext('2d');
    const vehicleCtx = vehicleCanvas.getContext('2d');

    const stats = dashboardData.stats || {};

    bookingChartInstance = new Chart(bookingCtx, {
        type: 'line',
        data: {
            labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
            datasets: [{
                label: 'Bookings',
                data: monthlyBookingsData, 
                backgroundColor: 'rgba(41, 150, 184, 0.2)',
                borderColor: '#2996B8',
                borderWidth: 3,
                fill: true,
                tension: 0.4
            }]
        },

        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: { legend: { display: false } },
            scales: { y: { beginAtZero: true } }
        }
    });

    vehicleChartInstance = new Chart(vehicleCtx, {
        type: 'doughnut',
        data: {
            labels: ['Available', 'Booked'],
            datasets: [{
                data: [stats.availableCars || 0, stats.totalBookings || 0],
                backgroundColor: ['#2996B8', '#e94560'],
                borderWidth: 2,
                borderColor: '#fff'
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: { legend: { position: 'bottom' } }
        }
    });
}

async function loadDashboard() {
    const bookingCanvas = document.getElementById('bookingChart');
    const vehicleCanvas = document.getElementById('vehicleChart');
    if (!bookingCanvas || !vehicleCanvas) return;

    try {
        const response = await fetch('admin/dashboard/stats.php');
        if (!response.ok) throw new Error(`Failed to fetch dashboard stats: ${response.status}`);
        const data = await response.json();

        dashboardData = data || { stats: {} };
        monthlyBookingsData = data.monthlyBookings || [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0];

        updateDashboardCards(dashboardData.stats || {});
        renderCharts();
    } catch (error) {
        console.error('Dashboard load error:', error);
    }
}

document.addEventListener('DOMContentLoaded', loadDashboard); s