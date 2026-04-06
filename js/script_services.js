const carListContainer = document.getElementById("car-list");
const carDetailsContainer = document.getElementById("car-details");
let cars = []; // Global array to hold our database records

// 1. UI Feedback: Loading state
function showLoading() {
    if (carListContainer) {
        carListContainer.innerHTML = `<div class="loading">Fetching real data from database...</div>`;
    }
}

// 2. UI Feedback: Error state
function showError(message) {
    if (carListContainer) {
        carListContainer.innerHTML = `<div class="error" style="color: #ff4d4d; padding: 20px;">${message}</div>`;
    }
}

// 3. THE CORE FUNCTION: Load and Filter
async function loadCars() {
    showLoading();

    try {
        const response = await fetch('admin/get_cars.php');
        if (!response.ok) throw new Error("Could not connect to get_cars.php");

        const rawData = await response.json();

        // DEBUG 1: See if data actually arrived
        console.log("Data from DB:", rawData);

        cars = rawData.map(dbRow => {
            return {
                ...dbRow,
                // IMPORTANT: If your DB column is 'name', keep it dbRow.name
                // If your DB column is 'car_name', change this to dbRow.car_name
                image: dbRow.image_path || 'assets/images/placeholder.jpg',
                isPopular: dbRow.isPopular == 1,
                isLuxury: dbRow.isLuxury == 1,
                isUsed: dbRow.isUsed == 1,
                features: dbRow.features ? dbRow.features.split(',').map(f => f.trim()) : []
            };
        });

        const urlParams = new URLSearchParams(window.location.search);
        const searchQuery = urlParams.get('search');

        if (searchQuery && searchQuery.trim() !== "") {
            // DEBUG 2: Confirm the JS sees the URL word
            console.log("Searching for:", searchQuery);

            const filteredResults = filterCars(searchQuery);

            // DEBUG 3: Check how many cars were found
            console.log("Cars found:", filteredResults.length);

            displayCars(filteredResults);
        } else {
            displayCars(cars);
        }

    } catch (error) {
        console.error('Fetch Error:', error);
        showError(`Database Error: ${error.message}`);
    }
}

// 4. THE RENDERER: Put HTML on the screen
function displayCars(list) {
    if (!carListContainer) return;

    carListContainer.innerHTML = "";

    if (!list || list.length === 0) {
        carListContainer.innerHTML = `
            <div class="no-results" style="grid-column: 1/-1; text-align: center; padding: 50px;">
                <p>No cars found matching your search.</p>
                <a href="services.php" style="color: #2996B8; text-decoration: underline;">View All Cars</a>
            </div>`;
        return;
    }

    list.forEach(car => {
        const carCard = document.createElement('div');
        carCard.className = 'car-card';

        carCard.innerHTML = `
            <div class="car-card-image">
                <img src="${car.image}" alt="${car.brand}" onerror="this.src='assets/images/placeholder.jpg'">
            </div>
            <div class="car-card-content">
                <h3>${car.brand} ${car.name}</h3>
                <p class="price"><strong>${Number(car.price).toLocaleString()}</strong> birr / day</p>
                <p class="specs">${car.bodyType} • ${car.fuelType} • ${car.transmission}</p>
                <button onclick="window.location.href='car-details.html?id=${car.id}'" class="toggle-btn">
                    View Details
                </button>
            </div>
        `;
        carListContainer.appendChild(carCard);
    });
}

// 5. THE BRAIN: Logic for matching queries
function matchesCar(car, query) {
    if (!query) return true;
    const q = query.toLowerCase().trim();

    // Specific tag-based filtering
    if (q === 'popular') return car.isPopular === true;
    if (q === 'luxury') return car.isLuxury === true;
    if (q === 'used') return car.isUsed === true;
    if (q === 'new') return car.isUsed === false;

    // General text search across multiple fields
    return (
        car.name.toLowerCase().includes(q) ||
        car.brand.toLowerCase().includes(q) ||
        car.bodyType.toLowerCase().includes(q) ||
        car.fuelType.toLowerCase().includes(q) ||
        car.transmission.toLowerCase().includes(q) ||
        (car.features && car.features.some(f => f.toLowerCase().includes(q)))
    );
}

// 6. HELPER: Filter the global array
function filterCars(query) {
    return cars.filter(car => matchesCar(car, query));
}

// 7. INITIALIZE: Run when page loads
document.addEventListener("DOMContentLoaded", () => {
    loadCars();

    // Also handle live typing if the user doesn't press Enter
    const searchInput = document.getElementById("search-input");
    if (searchInput) {
        searchInput.addEventListener("input", (e) => {
            const query = e.target.value;
            displayCars(filterCars(query));
        });
    }
});