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
        } else if (sectionName === 'dashboard' && typeof loadDashboard === 'function') {
            loadDashboard();
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
                const response = await fetch('admin/cars/add.php', {
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
        const response = await fetch('admin/cars/list.php');
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
        const response = await fetch('admin/bookings/get.php');
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
        const response = await fetch('admin/bookings/update.php', {
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
        const response = await fetch('admin/bookings/delete.php', {
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
        const response = await fetch('admin/cars/delete.php', {
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

document.addEventListener('DOMContentLoaded', async () => {
    const loaded = await loadAdminProfile();

    const form = document.getElementById('admin-profile-form');
    const editBtn = document.getElementById('edit-profile-btn');
    const saveBtn = document.getElementById('save-profile-btn');
    const registerForm = document.getElementById('create-admin-form');
    const msgEl = document.getElementById('register-message');
    const profileContainer = document.getElementById('profile-view-container');
    const createContainer = document.getElementById('create-view-container');
    const goToAddBtn = document.getElementById('go-to-create-btn');
    const cancelAddBtn = document.getElementById('cancel-create-btn');

    const editableInputs = [
        document.getElementById('admin-name'),
        document.getElementById('admin-email'),
        document.getElementById('admin-password')
    ];

    const profileState = loaded || {
        name: document.getElementById('admin-name')?.value?.trim() || '',
        email: document.getElementById('admin-email')?.value?.trim() || ''
    };

    if (editBtn) {
        editBtn.addEventListener('click', () => {
            const isEditing = form.classList.toggle('is-editing');

            if (isEditing) {
                profileState.name = editableInputs[0].value;
                profileState.email = editableInputs[1].value;

                editBtn.textContent = 'Cancel Changes';
                editBtn.classList.add('active-editing');
                if (saveBtn) saveBtn.classList.remove('hidden');

                editableInputs.forEach((input) => {
                    if (input) {
                        input.removeAttribute('readonly');
                        if (input.type === 'password') {
                            input.value = '';
                            input.placeholder = 'Enter new password';
                        }
                    }
                });
            } else {
                editBtn.textContent = 'Change Settings';
                editBtn.classList.remove('active-editing');
                if (saveBtn) saveBtn.classList.add('hidden');

                editableInputs.forEach((input) => {
                    if (input) {
                        input.setAttribute('readonly', true);
                        if (input.type === 'password') {
                            input.value = '';
                            input.placeholder = '••••••••';
                        }
                    }
                });

                if (editableInputs[0]) editableInputs[0].value = profileState.name;
                if (editableInputs[1]) editableInputs[1].value = profileState.email;
                setProfileMessage('');
            }
        });
    }

    if (saveBtn) {
        saveBtn.addEventListener('click', async () => {
            const saved = await saveAdminProfile(profileState);
            if (saved && form.classList.contains('is-editing') && editBtn) {
                editBtn.click();
            }
        });
    }

    const logoutAccountBtn = document.getElementById('logout-account-btn');
    if (logoutAccountBtn) {
        logoutAccountBtn.addEventListener('click', async () => {
            try {
                const formData = new FormData();
                formData.append('action', 'logout');
                await fetch('admin/auth/auth.php', { method: 'POST', body: formData });
            } catch (error) {
                // still redirect
            }
            window.location.href = 'public/login.html';
        });
    }

    if (registerForm) {
        registerForm.addEventListener('submit', async (e) => {
            e.preventDefault();

            const nameVal = document.getElementById('new-admin-name').value.trim();
            const emailVal = document.getElementById('new-admin-email').value.trim();
            const passwordVal = document.getElementById('new-admin-password').value.trim();
            const confirmPasswordVal = document.getElementById('new-admin-confirm-password').value.trim();

            if (passwordVal.length < 6) {
                if (msgEl) {
                    msgEl.textContent = 'Password must be at least 6 characters';
                    msgEl.style.color = '#fa5252';
                }
                return;
            }

            if (passwordVal !== confirmPasswordVal) {
                if (msgEl) {
                    msgEl.textContent = 'Passwords do not match!';
                    msgEl.style.color = '#fa5252';
                }
                return;
            }

            const formData = new FormData();
            formData.append('adminName', nameVal);
            formData.append('adminEmail', emailVal);
            formData.append('adminPassword', passwordVal);

            try {
                if (msgEl) {
                    msgEl.textContent = 'Processing registration...';
                    msgEl.style.color = '#495057';
                }

                const response = await fetch('admin/admins/create.php', {
                    method: 'POST',
                    body: formData
                });

                const result = await response.json();

                if (result.status === 'success') {
                    if (msgEl) {
                        msgEl.textContent = result.message;
                        msgEl.style.color = '#2b8a3e';
                    }
                    registerForm.reset();

                    const newToggle = document.getElementById('new-password-toggle');
                    const confirmToggle = document.getElementById('confirm-password-toggle');

                    if (newToggle) newToggle.innerHTML = '<img src="assets/icons/eye.svg" alt="Show" class="action-img">';
                    if (confirmToggle) confirmToggle.innerHTML = '<img src="assets/icons/eye.svg" alt="Show" class="action-img">';

                    if (newToggle) newToggle.style.color = '#adb5bd';
                    if (confirmToggle) confirmToggle.style.color = '#adb5bd';
                } else {
                    if (msgEl) {
                        msgEl.textContent = result.message || 'Registration failed.';
                        msgEl.style.color = '#fa5252';
                    }
                }
            } catch (error) {
                console.error('Registration processing error:', error);
                if (msgEl) {
                    msgEl.textContent = 'Server communications error occurred.';
                    msgEl.style.color = '#fa5252';
                }
            }
        });
    }

    if (goToAddBtn && cancelAddBtn) {
        goToAddBtn.addEventListener('click', () => {
            if (profileContainer) profileContainer.classList.add('hidden');
            if (createContainer) createContainer.classList.remove('hidden');
        });

        cancelAddBtn.addEventListener('click', () => {
            if (createContainer) createContainer.classList.add('hidden');
            if (profileContainer) profileContainer.classList.remove('hidden');

            if (registerForm) registerForm.reset();
            const registerMsg = document.getElementById('register-message');
            if (registerMsg) registerMsg.textContent = '';
        });
    }

    const setupPasswordToggle = (toggleId, inputId) => {
        const toggleBtn = document.getElementById(toggleId);
        const inputField = document.getElementById(inputId);

        if (toggleBtn && inputField) {
            toggleBtn.innerHTML = '<img src="assets/icons/eye.svg" alt="Show" class="action-img">';

            toggleBtn.addEventListener('click', () => {
                const isPassword = inputField.type === 'password';
                inputField.type = isPassword ? 'text' : 'password';

                const iconsPath = isPassword ? 'assets/icons/eye-slash.svg' : 'assets/icons/eye.svg';
                toggleBtn.innerHTML = `<img src="${iconsPath}" alt="${isPassword ? 'Hide' : 'Show'}" class="action-img">`;
                toggleBtn.style.color = isPassword ? '#e94560' : '#adb5bd';
            });
        }
    };

    setupPasswordToggle('new-password-toggle', 'new-admin-password');
    setupPasswordToggle('confirm-password-toggle', 'new-admin-confirm-password');
    setupPasswordToggle('admin-password-toggle', 'admin-password');
});

async function loadAdminProfile() {
    const profileNameEl = document.getElementById('admin-name');
    const profileEmailEl = document.getElementById('admin-email');

    if (!profileNameEl || !profileEmailEl) return null;

    try {
        const response = await fetch('admin/profile/get.php');
        const data = await response.json();

        if (data.status === 'success' && data.user) {
            profileNameEl.value = data.user.name || '';
            profileEmailEl.value = data.user.email || '';
            return {
                name: data.user.name || '',
                email: data.user.email || ''
            };
        }
    } catch (error) {
        console.error('Failed to load admin profile:', error);
    }
    return null;
}

function setProfileMessage(message, isError = false) {
    const el = document.getElementById('profile-message');
    if (!el) return;
    el.textContent = message || '';
    el.classList.remove('success', 'error');
    if (message) {
        el.classList.add(isError ? 'error' : 'success');
    }
}

async function saveAdminProfile(profileState) {
    const nameInput = document.getElementById('admin-name');
    const emailInput = document.getElementById('admin-email');
    const passwordInput = document.getElementById('admin-password');

    if (!nameInput || !emailInput || !passwordInput) return false;

    const newName = nameInput.value.trim();
    const newEmail = emailInput.value.trim();
    const newPassword = passwordInput.value;

    if (!newName) {
        setProfileMessage('Name is required.', true);
        return false;
    }

    if (!newEmail) {
        setProfileMessage('Email is required.', true);
        return false;
    }

    const nameChanged = newName !== profileState.name;
    const emailChanged = newEmail !== profileState.email;
    const passwordChanged = newPassword.length > 0;

    if (!nameChanged && !emailChanged && !passwordChanged) {
        setProfileMessage('No changes to save.', true);
        return false;
    }

    const formData = new FormData();
    if (nameChanged) formData.append('newName', newName);
    if (emailChanged) formData.append('newEmail', newEmail);
    if (passwordChanged) formData.append('newPassword', newPassword);

    try {
        const response = await fetch('admin/profile/update.php', {
            method: 'POST',
            body: formData
        });

        const result = await response.json();

        if (result.status === 'success') {
            if (result.user) {
                nameInput.value = result.user.name;
                emailInput.value = result.user.email;
                profileState.name = result.user.name;
                profileState.email = result.user.email;
            } else {
                profileState.name = newName;
                profileState.email = newEmail;
            }

            passwordInput.value = '';
            passwordInput.placeholder = '••••••••';
            passwordInput.setAttribute('readonly', true);
            setProfileMessage(result.message || 'Profile saved successfully.', false);
            return true;
        }

        setProfileMessage(result.message || 'Unable to update profile.', true);
        return false;
    } catch (error) {
        console.error('Profile Save Error:', error);
        setProfileMessage('Could not reach the server.', true);
        return false;
    }
}

window.confirmBooking = (id) => updateBookingStatus(id, 'confirmed');
window.cancelBooking = (id) => updateBookingStatus(id, 'cancelled');
window.deleteBooking = (id) => deleteBookingById(id);