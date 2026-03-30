document.addEventListener('DOMContentLoaded', () => {
    const navLinks = document.querySelectorAll('.nav-link');
    const allSections = document.querySelectorAll('.content-section');

    const switchSection = (sectionName) => {
        const targetSection = document.getElementById(`${sectionName}-section`);
        if (!targetSection) return;

        allSections.forEach(s => s.classList.remove('active-section'));
        targetSection.classList.add('active-section');

        navLinks.forEach(link => {
            link.classList.remove('active');
            if (link.getAttribute('data-section') === sectionName) {
                link.classList.add('active');
            }
        });

        localStorage.setItem('activeSection', sectionName);
    };

    navLinks.forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            const sectionName = link.getAttribute('data-section');
            switchSection(sectionName);
        });
    });

    const savedSection = localStorage.getItem('activeSection');
    if (savedSection) {
        switchSection(savedSection);
    } else {
        switchSection('dashboard');
    }
});

// Inventory
let inventory = [];

document.addEventListener('DOMContentLoaded', () => {
    const form = document.getElementById('add-car-form');
    const modal = document.getElementById('formModal');

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
                alert('Success: ' + result.message);
                form.reset();
            } else {
                alert('Database Error: ' + result.message);
            }
        } catch (error) {
            console.error('Connection Error:', error);
            alert('Could not connect to the server. Check if XAMPP is running.');
        }

        modal.style.display = 'none';
    });

    document.getElementById('openModalBtn').addEventListener('click', () => {
        form.reset();
        document.getElementById('modalTitle').innerText = "Add New Vehicle";
        modal.style.display = 'flex';
    });

    document.getElementById('closeModalBtn').addEventListener('click', () => {
        modal.style.display = 'none';
    });
});

const loadInventoryFromDB = async () => {

    try {
        const response = await fetch('admin/get_cars.php');
        const data = await response.json();

        if (Array.isArray(data)) {
            inventory = data;
            const tbody = document.getElementById('admin-car-list');
            if (!tbody) return;

            tbody.innerHTML = data.map(car => `
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
};

document.addEventListener('DOMContentLoaded', loadInventoryFromDB);


window.editInventory = (id) => {
    const car = inventory.find(c => Number(c.id) === Number(id));
    if (!car) return;

    document.getElementById('modalTitle').innerText = "Edit Vehicle Details";

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
    if (!confirm('Are you sure you want to permanently delete this vehicle?')) return;
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
        } else {
            alert('Error: ' + result.message);
        }
    } catch (error) {
        console.error('Delete Error:', error);
        alert('Could not connect to the server.');
    }
};