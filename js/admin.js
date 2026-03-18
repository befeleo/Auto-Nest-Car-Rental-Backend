document.addEventListener('DOMContentLoaded', () => {
    const navLinks = document.querySelectorAll('.nav-link');
    const allSections = document.querySelectorAll('.content-section');

    navLinks.forEach(link => {
        link.addEventListener('click', (e) => {
            const sectionName = link.getAttribute('data-section');
            const targetSection = document.getElementById(`${sectionName}-section`);

            if (targetSection) {
                e.preventDefault();

                allSections.forEach(section => section.classList.remove('active-section'));
                targetSection.classList.add('active-section');

                navLinks.forEach(item => item.classList.remove('active'));
                link.classList.add('active');
            }
        });
    });
});

// Inventory
let inventory = [];

document.addEventListener('DOMContentLoaded', () => {

    const savedData = localStorage.getItem('autoNestCars');
    if (savedData) {
        inventory = JSON.parse(savedData);
        renderInventory();
    }

    const form = document.getElementById('add-car-form');
    const modal = document.getElementById('formModal');

    form.addEventListener('submit', (e) => {
        e.preventDefault();

        const editId = document.getElementById('edit-id').value;

        const newCar = {
            id: editId ? parseInt(editId) : Date.now(),
            brand: document.getElementById('brand').value,
            name: document.getElementById('name').value,
            price: parseInt(document.getElementById('price').value),
            fuelType: document.getElementById('fuelType').value,
            bodyType: document.getElementById('bodyType').value,
            transmission: document.getElementById('transmission').value,
            isUsed: document.getElementById('isUsed').checked,
            isPopular: document.getElementById('isPopular').checked,
            isLuxury: document.getElementById('isLuxury').checked,
            image: "assets/images/car_images/placeholder.png",
            features: document.getElementById('features').value
                ? document.getElementById('features').value.split(',').map(f => f.trim()) : []
        };
        if (editId) {
            const index = inventory.findIndex(c => c.id === newCar.id);
            if (index !== -1) inventory[index] = newCar;
        } else {
            inventory.push(newCar);
        }

        saveInventory();
        modal.style.display = 'none';
        form.reset();
    });

    document.getElementById('openModalBtn').addEventListener('click', () => {
        form.reset();
        document.getElementById('edit-id').value = '';
        document.getElementById('modalTitle').innerText = "Add New Vehicle";
        modal.style.display = 'flex';
    });

    document.getElementById('closeModalBtn').addEventListener('click', () => {
        modal.style.display = 'none';
    });
});

const renderInventory = () => {
    const tbody = document.getElementById('admin-car-list');
    tbody.innerHTML = inventory.map(car => `
        <tr class="inventory-row">
            <td>#${car.id.toString().slice(-4)}</td>
            <td>${car.brand}</td>
            <td>${car.name}</td>
            <td>${car.bodyType}</td>
            <td class="price-cell">${car.price.toLocaleString()} Birr</td>
            <td>
                <div class="action-buttons">
                    <button class="btn-edit" onclick="editInventory(${car.id})">
                        <img src="assets/icons/pen.svg" alt="edit"  class="action-img" />
                    </button>
                    <button class="btn-delete" onclick="deleteInventory(${car.id})"> 
                        <img src="assets/icons/trash-can.svg" alt="delete" class="action-img" />
                    </button>
                </div>
            </td>
        </tr>`).join('');
}

const saveInventory = () => {
    localStorage.setItem('autoNestCars', JSON.stringify(inventory));
    renderInventory();
}

const deleteInventory = (id) => {
    inventory = inventory.filter(car => car.id !== id);
    saveInventory();
}

window.deleteInventory = deleteInventory;

const editInventory = (id) => {
    const car = inventory.find(c => c.id === id);
    if (!car) return;

    document.getElementById('modalTitle').innerText = "Edit Vehicle";

    document.getElementById('edit-id').value = car.id;
    document.getElementById('brand').value = car.brand;
    document.getElementById('name').value = car.name;
    document.getElementById('price').value = car.price;
    document.getElementById('fuelType').value = car.fuelType;
    document.getElementById('bodyType').value = car.bodyType;
    document.getElementById('transmission').value = car.transmission;
    document.getElementById('isUsed').checked = car.isUsed;
    document.getElementById('isPopular').checked = car.isPopular;
    document.getElementById('isLuxury').checked = car.isLuxury;
    document.getElementById('features').value = car.features ? car.features.join(', ') : '';

    document.getElementById('formModal').style.display = 'flex';
};

window.editInventory = editInventory;

// Booking
let bookings = [];

document.addEventListener('DOMContentLoaded', () => {
    const savedBookings = localStorage.getItem('carBookings');
    if (savedBookings)
        bookings = JSON.parse(savedBookings);
    localStorage.setItem('carBookings', JSON.stringify(bookings));
    renderBookings();
});

const renderBookings = () => {
    const tbody = document.getElementById('admin-booking-list');
    if (!tbody) return;

    tbody.innerHTML = bookings.map(book => {

        const customer = book.fullName || book.customerName || "Unknown";
        const vehicle = book.carName || "Unknown Car";
        const phone = book.phone || "N/A";
        const date = book.pickupDate || book.date || "N/A";

        return `
            <tr class="inventory-row">
                <td>${customer}</td>
                <td>${vehicle}</td>
                <td>${phone}</td>
                <td>${date}</td>
                <td>
                    <span class="status ${book.status.toLowerCase()}">
                        ${book.status}
                    </span>
                </td>
                <td>
                    <div class="action-buttons">
                        <button type="button" class="btn-confirm" onclick="updateStatus(${book.id}, 'Confirmed')">
                            <img src="assets/icons/check.svg" alt="confirm" class="action-img" />
                        </button>
                        
                        <button type="button" class="btn-cancel-status" onclick="updateStatus(${book.id}, 'Cancelled')">
                            <img src="assets/icons/x-mark.svg" alt="cancel" class="action-img" />
                        </button>

                        <button type="button" class="btn-delete-perm" onclick="deleteBooking(${book.id})">
                            <img src="assets/icons/trash-can.svg" alt="delete" class="action-img" />
                        </button>
                    </div>
                </td>
            </tr>`;
    }).join('');
};

const saveBooking = () => {
    localStorage.setItem('carBookings', JSON.stringify(bookings));
    renderBookings();
};

const updateStatus = (id, newStatus) => {
    const bookingIndex = bookings.findIndex(booking => Number(booking.id) === Number(id));
    if (bookingIndex !== -1) {
        bookings[bookingIndex].status = newStatus;
        saveBooking();
    }
};

const deleteBooking = (id) => {
    bookings = bookings.filter(booking => Number(booking.id) !== Number(id));
    saveBooking();
};

window.updateStatus = updateStatus;
window.deleteBooking = deleteBooking;

// Setting
const photoUpload = document.getElementById('admin-photo-upload');
const profilePreview = document.getElementById('profile-img-preview');

photoUpload.addEventListener('change', () => {
    const [file] = photoUpload.files;
    if (file) {
        const reader = new FileReader();
        reader.onload = (img) => profilePreview.src = img.target.result;
        reader.readAsDataURL(file);
    }
});
