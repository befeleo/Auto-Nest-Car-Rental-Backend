let inventory = [];
let bookings = [];

document.addEventListener('DOMContentLoaded', () => {
    const navLinks = document.querySelectorAll('.nav-link');
    const allSections = document.querySelectorAll('.content-section');

    const switchSection = (sectionName) => {
        const targetSection = document.getElementById(`${sectionName}-section`);
        if (!targetSection) return;

        allSections.forEach((section) => section.classList.remove('active-section'));
        targetSection.classList.add('active-section');

        navLinks.forEach((link) => {
            link.classList.remove('active');
            if (link.getAttribute('data-section') === sectionName) {
                link.classList.add('active');
            }
        });

        sessionStorage.setItem('activeSection', sectionName);

        if (sectionName === 'bookings') {
            loadBookingsFromDB();
        }
    };

    navLinks.forEach((link) => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            switchSection(link.getAttribute('data-section'));
        });
    });

    switchSection(sessionStorage.getItem('activeSection') || 'dashboard');
});

document.addEventListener('DOMContentLoaded', () => {
    const form = document.getElementById('add-car-form');
    const modal = document.getElementById('formModal');

    if (form) {
        form.addEventListener('submit', async (e) => {
            e.preventDefault();
            const formData = new FormData(form);

            try {
                const response = await fetch('admin/add_car.php', {
                    method: 'POST',
                    body: formData
                });
                const result = await response.json();

                if (result.status === 'success') {
                    form.reset();
                    await loadInventoryFromDB();
                }
            } catch (error) {
                console.error('Connection Error:', error);
            }

            if (modal) modal.style.display = 'none';
        });
    }

    const openModalBtn = document.getElementById('openModalBtn');
    if (openModalBtn) {
        openModalBtn.addEventListener('click', () => {
            if (!form || !modal) return;
            form.reset();
            const title = document.getElementById('modalTitle');
            if (title) title.innerText = 'Add New Vehicle';
            modal.style.display = 'flex';
        });
    }

    const closeModalBtn = document.getElementById('closeModalBtn');
    if (closeModalBtn && modal) {
        closeModalBtn.addEventListener('click', () => {
            modal.style.display = 'none';
        });
    }
});

function escapeHtml(value) {
    return String(value ?? '')
        .replaceAll('&', '&amp;')
        .replaceAll('<', '&lt;')
        .replaceAll('>', '&gt;')
        .replaceAll('"', '&quot;')
        .replaceAll("'", '&#39;');
}

function formatMoney(value) {
    const number = Number(value || 0);
    return Number.isFinite(number) ? number.toLocaleString() : '0';
}

function setBookingMessage(message, type = 'success') {
    const box = document.getElementById('booking-admin-message');
    if (!box) return;
    const text = String(message || '').trim();
    if (!text) {
        box.hidden = true;
        box.textContent = '';
        box.className = 'admin-feedback';
        return;
    }

    box.hidden = false;
    box.className = `admin-feedback ${type === 'error' ? 'error' : 'success'}`;
    box.textContent = text;
}

function bookingStatusLabel(status) {
    const value = String(status || 'pending').toLowerCase();
    if (value === 'confirmed') return 'Confirmed';
    if (value === 'cancelled') return 'Cancelled';
    return 'Pending';
}

function bookingActionsHtml(booking) {
    const id = Number(booking.id);
    const status = String(booking.status || 'pending').toLowerCase();
    const confirmDisabled = status === 'confirmed';
    const cancelDisabled = status === 'cancelled';

    return `
        <div class="booking-actions">
            <button type="button" class="booking-action-btn confirm" ${confirmDisabled ? 'disabled' : ''} onclick="confirmBooking(${id})">Confirm</button>
            <button type="button" class="booking-action-btn cancel" ${cancelDisabled ? 'disabled' : ''} onclick="cancelBooking(${id})">Cancel</button>
            <button type="button" class="booking-action-btn delete" onclick="deleteBooking(${id})">Delete</button>
        </div>
    `;
}

function renderBookingsTable() {
    const tbody = document.getElementById('admin-booking-list');
    if (!tbody) return;

    if (!bookings.length) {
        tbody.innerHTML = '<tr><td colspan="8" style="text-align:center;padding:24px;">No bookings found.</td></tr>';
        return;
    }

    tbody.innerHTML = bookings.map((booking) => {
        const customer = escapeHtml(booking.full_name || '');
        const vehicle = escapeHtml(booking.car_name || [booking.car_brand, booking.car_model].filter(Boolean).join(' ').trim() || 'Car');
        const pickup = escapeHtml(booking.pickup_date || '');
        const dropoff = escapeHtml(booking.dropoff_date || '');
        const phone = escapeHtml(booking.phone || '');
        const total = `${formatMoney(booking.total_price)} Birr`;
        const status = bookingStatusLabel(booking.status);

        return `
            <tr class="inventory-row">
                <td>#${escapeHtml(booking.id)}</td>
                <td>${customer}</td>
                <td>${vehicle}</td>
                <td>${pickup}</td>
                <td>${dropoff}</td>
                <td>${phone}</td>
                <td class="price-cell">${total}</td>
                <td><span class="status ${escapeHtml(String(booking.status || 'pending').toLowerCase())}">${status}</span></td>
                <td>${bookingActionsHtml(booking)}</td>
            </tr>
        `;
    }).join('');
}

async function loadInventoryFromDB() {
    try {
        const response = await fetch('admin/get_cars.php');
        const data = await response.json();

        if (Array.isArray(data)) {
            inventory = data;
            const tbody = document.getElementById('admin-car-list');
            if (!tbody) return;

            tbody.innerHTML = data.map((car) => `
                <tr class="inventory-row">
                    <td>#${car.id}</td>
                    <td>${car.brand}</td>
                    <td>${car.name}</td>
                    <td>${car.bodyType}</td>
                    <td class="price-cell">${Number(car.price).toLocaleString()} Birr</td>
                    <td>
                        <div class="action-buttons">
                            <button class="btn-edit" onclick="editInventory(${car.id})">
                                <img src="assets/icons/pen.svg" alt="edit" class="action-img" />
                            </button>
                            <button class="btn-delete" onclick="deleteInventory(${car.id})">
                                <img src="assets/icons/trash-can.svg" alt="delete" class="action-img" />
                            </button>
                        </div>
                    </td>
                </tr>`).join('');
        }
    } catch (error) {
        console.error('Failed to load inventory:', error);
    }
}

async function loadBookingsFromDB() {
    try {
        const response = await fetch('admin/get_bookings.php');
        const result = await response.json();

        if (result.status === 'success' && Array.isArray(result.bookings)) {
            bookings = result.bookings;
            renderBookingsTable();
        } else {
            bookings = [];
            renderBookingsTable();
            setBookingMessage(result.message || 'Failed to load bookings.', 'error');
        }
    } catch (error) {
        console.error('Failed to load bookings:', error);
        setBookingMessage('Failed to load bookings.', 'error');
    }
}

async function updateBookingStatus(id, status) {
    const formData = new FormData();
    formData.append('id', id);
    formData.append('status', status);

    try {
        const response = await fetch('admin/update_booking.php', {
            method: 'POST',
            body: formData
        });
        const result = await response.json();

        if (result.status === 'success') {
            setBookingMessage(result.message || 'Booking updated.');
            await loadBookingsFromDB();
            if (typeof loadDashboard === 'function') loadDashboard();
        } else {
            setBookingMessage(result.message || 'Unable to update booking.', 'error');
        }
    } catch (error) {
        console.error('Booking update error:', error);
        setBookingMessage('Unable to update booking.', 'error');
    }
}

async function deleteBookingById(id) {
    if (!window.confirm('Delete this booking permanently?')) return;

    const formData = new FormData();
    formData.append('id', id);

    try {
        const response = await fetch('admin/delete_booking.php', {
            method: 'POST',
            body: formData
        });
        const result = await response.json();

        if (result.status === 'success') {
            setBookingMessage(result.message || 'Booking deleted.');
            await loadBookingsFromDB();
            if (typeof loadDashboard === 'function') loadDashboard();
        } else {
            setBookingMessage(result.message || 'Unable to delete booking.', 'error');
        }
    } catch (error) {
        console.error('Booking delete error:', error);
        setBookingMessage('Unable to delete booking.', 'error');
    }
}

document.addEventListener('DOMContentLoaded', loadInventoryFromDB);
document.addEventListener('DOMContentLoaded', loadBookingsFromDB);

window.editInventory = (id) => {
    const car = inventory.find((item) => Number(item.id) === Number(id));
    if (!car) return;

    document.getElementById('modalTitle').innerText = 'Edit Vehicle Details';

    document.getElementById('edit-id').value = car.id;
    document.getElementById('brand').value = car.brand;
    document.getElementById('name').value = car.name;
    document.getElementById('price').value = car.price;
    document.getElementById('bodyType').value = car.bodyType;
    document.getElementById('fuelType').value = car.fuelType;
    document.getElementById('transmission').value = car.transmission;
    document.getElementById('isUsed').checked = (parseInt(car.isUsed) === 1);
    document.getElementById('isPopular').checked = (parseInt(car.isPopular) === 1);
    document.getElementById('isLuxury').checked = (parseInt(car.isLuxury) === 1);
    document.getElementById('features').value = car.features || '';

    document.getElementById('formModal').style.display = 'flex';
};

window.deleteInventory = async (id) => {
    const formData = new FormData();
    formData.append('id', id);

    try {
        const response = await fetch('admin/delete_car.php', {
            method: 'POST',
            body: formData
        });

        const result = await response.json();

        if (result.status === 'success') {
            loadInventoryFromDB();
        }
    } catch (error) {
        console.error('Delete Error:', error);
    }
};

window.confirmBooking = (id) => updateBookingStatus(id, 'confirmed');
window.cancelBooking = (id) => updateBookingStatus(id, 'cancelled');
window.deleteBooking = (id) => deleteBookingById(id);
