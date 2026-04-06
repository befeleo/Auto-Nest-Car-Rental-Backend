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

// Load cars from the database
async function loadCars() {
    showLoading();

    try {
        // 1. This "calls" your PHP file
        const response = await fetch('admin/get_cars.php');

        if (!response.ok) throw new Error("Network response was not ok");

        // 2. This receives the "delivery box" (JSON) and opens it
        const rawData = await response.json();

        if (rawData.error) throw new Error(rawData.error);

        // 3. This "translates" the database data so the website can use it
        cars = rawData.map(dbRow => {
            return {
                ...dbRow,
                // The DB uses 'image_path', but our HTML looks for 'image'
                image: dbRow.image_path || 'assets/images/placeholder.jpg',

                // DB sends 0 or 1. We change it to true or false
                isPopular: dbRow.isPopular == 1,
                isLuxury: dbRow.isLuxury == 1,
                isUsed: dbRow.isUsed == 1,

                // DB sends features as "AC, GPS". We turn it into ["AC", "GPS"]
                features: dbRow.features ? dbRow.features.split(',').map(f => f.trim()) : []
            };
        });

        console.log("Real data from database processed:", cars);

        // 4. Send the translated data to the screen
        displayCars(cars);

    } catch (error) {
        console.error('Error fetching from database:', error);
        showError(`Database Error: ${error.message}`);
    }
}

function displayCars(list) {
    carListContainer.innerHTML = "";

    if (!list || list.length === 0) {
        carListContainer.innerHTML = '<div class="no-results">No cars found in database.</div>';
        return;
    }

    list.forEach(car => {
        const carCard = document.createElement('div');
        carCard.className = 'car-card';

        // Using the data we fetched and translated
        carCard.innerHTML = `
            <img src="${car.image}" alt="${car.brand}" onerror="this.src='assets/images/placeholder.jpg'">
            <div class="car-card-content">
                <h3>${car.brand} ${car.name}</h3>
                <p><strong>${Number(car.price).toLocaleString()}</strong> birr / day</p>
                <p>${car.bodyType} • ${car.fuelType} • ${car.transmission}</p>
                <button onclick="window.location.href='car-details.html?id=${car.id}'" class="toggle-btn">
                    View Details
                </button>
            </div>
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


