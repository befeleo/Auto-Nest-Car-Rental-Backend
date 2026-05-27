function renderCharts() {
    const bookingCanvas = document.getElementById('bookingChart');
    const vehicleCanvas = document.getElementById('vehicleChart');

    if (!bookingCanvas || !vehicleCanvas) return;

    const bookingCtx = bookingCanvas.getContext('2d');
    const vehicleCtx = vehicleCanvas.getContext('2d');

    new Chart(bookingCtx, {
        type: 'line',
        data: {
            labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
            datasets: [{
                label: 'Bookings',
                data: [30, 45, 28, 60, 75, 50, 80, 90, 70, 60, 50, 65],
                backgroundColor: 'rgba(41, 150, 184, 0.2)', // Matches your teal accent color
                borderColor: '#2996B8', // Your main teal color
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

    new Chart(vehicleCtx, {
        type: 'doughnut',
        data: {
            labels: ['Available', 'Booked'],
            datasets: [{
                data: [
                    dashboardData.stats.availableCars || 0,
                    dashboardData.stats.totalBookings || 0
                ],
                backgroundColor: ['#2996B8', '#e94560'], // Teal and subtle coral/red accent
                borderWidth: 2,
                borderColor: '#fff'
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    position: 'bottom'
                }
            }
        }
    });
}