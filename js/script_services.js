const carListContainer = document.getElementById("car-list");
const carDetailsContainer = document.getElementById("car-details");
let cars = [];

// Add loading indicator
function showLoading() {
    carListContainer.innerHTML = `<div class="loading">Loading cars...</div>`;
}

// Add error display
function showError(message) {
    carListContainer.innerHTML = `<div class="error">${message}</div>`;
}

// Load cars from JSON
async function loadCars() {
    showLoading();

    try {
        console.log('Attempting to load cars.json...');

        // Try different paths if needed
        const response = await fetch('./data/cars.json');

        if (!response.ok) {
            throw new Error(`Failed to load JSON: ${response.status} ${response.statusText}`);
        }

        cars = await response.json();
        console.log(`Successfully loaded ${cars.length} cars`, cars);

        const urlParams = new URLSearchParams(window.location.search);
        const carQuery = urlParams.get('car');

        if (carQuery) {
            console.log(`Filtering by brand from URL: ${carQuery}`);
            const filteredCars = filterCars(carQuery);
            displayCars(filteredCars);

        } else {
            displayCars(cars);
        }
    } catch (error) {
        console.error('Error loading cars:', error);
        showError(`Failed to load cars: ${error.message}<br>Check browser console for details.`);
    }
}

function displayCars(list = cars) {
    carListContainer.innerHTML = "";

    if (!list || list.length === 0) {
        carListContainer.innerHTML = `<div class="no-results">No cars found</div>`;
        return;
    }

    list.forEach(car => {
        const carCard = document.createElement('div');
        carCard.className = 'car-card';
        carCard.innerHTML = `
            <img src="${car.image}" alt="${car.brand} ${car.name}" onerror="this.src='assets/images/placeholder.jpg'">
            <h3>${car.brand} ${car.name}</h3>
            <p><strong>${car.price}</strong> birr / day</p>
            <p>${car.bodyType} • ${car.fuelType}</p>
            <button onclick="window.location.href='car-details.html?id=${car.id}'" class="toggle-btn" >View Details</button>
        `;
        carListContainer.appendChild(carCard);
    });
}

function matchesCar(car, query) {
    if (!query) return true;
    const q = query.toLowerCase();

    if (q.startsWith('range-')) {
        const price = Number(car.price);
        switch (q) {
            case 'range-1': return price < 2000;
            case 'range-2': return price >= 2000 && price < 3000;
            case 'range-3': return price >= 3000 && price < 4000;
            case 'range-4': return price >= 4000 && price < 5000;
            case 'range-5': return price >= 5000 && price < 6000;
            case 'range-6': return price >= 6000;
        }
    }
    if (q === 'popular') return car.isPopular === true;
    if (q === 'used') return car.isUsed === true;
    if (q === 'new') return car.isUsed === false;
    if (q === 'luxury') return car.isLuxury === true;
    if (q === 'automatic') return car.transmission.toLowerCase() === 'automatic';
    if (q === 'manual') return car.transmission.toLowerCase() === 'manual';
    if (q === 'seats-5') return Number(car.seats) === 5;
    if (q === 'seats-7') return Number(car.seats) === 7;

    return (
        car.name.toLowerCase().includes(q) ||
        car.brand.toLowerCase().includes(q) ||
        car.bodyType.toLowerCase().includes(q) ||
        car.fuelType.toLowerCase().includes(q) ||
        car.transmission.toLowerCase().includes(q) ||
        car.features.some(f => f.toLowerCase().includes(q))
    );
}

function filterCars(query) {
    return cars.filter(car => matchesCar(car, query));
}

function showCarDetails(carId) {
    const car = cars.find(c => c.id === carId);
    if (!car) return;

    carDetailsContainer.innerHTML = `
        <div class="car-details-box">
            <h2>${car.brand} ${car.name}</h2>
            <img src="${car.image}" alt="${car.name}" onerror="this.src='images/placeholder.jpg'">
            
            <p><strong>Price:</strong> $${car.price} / day</p>
            <p><strong>Fuel Type:</strong> ${car.fuelType}</p>
            <p><strong>Body Type:</strong> ${car.bodyType}</p>
            <p><strong>Transmission:</strong> ${car.transmission}</p>
            <p><strong>Seats:</strong> ${car.seats}</p>

            <p>
                ${car.isLuxury ? "🌟 Luxury Car<br>" : ""}
                ${car.isPopular ? "🔥 Popular Choice<br>" : ""}
                ${car.isUsed ? "🚗 Used Vehicle" : "🆕 New Vehicle"}
            </p>

            <h3>Features</h3>
            <ul>
                ${car.features.map(f => `<li>${f}</li>`).join("")}
            </ul>

            <button onclick="closeDetails()">Close</button>
        </div>
    `;

    carDetailsContainer.style.display = "flex";
}

function closeDetails() {
    carDetailsContainer.style.display = "none";
}

// Initialize when DOM is loaded
document.addEventListener("DOMContentLoaded", () => {
    console.log('DOM loaded, starting car loading...');
    loadCars();

    const searchInput = document.getElementById("search-input");
    if (searchInput) {
        searchInput.addEventListener("input", e => {
            const query = e.target.value.trim();
            const filteredCars = filterCars(query);
            displayCars(filteredCars);
        });
    }
});

// Make functions globally available
window.showCarDetails = showCarDetails;
window.closeDetails = closeDetails;


