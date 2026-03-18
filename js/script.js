const popularCarGrid = document.getElementById('popular-car-grid');
const toggleBtn = document.getElementById('toggleBtn');
const moreBrands = document.getElementById('more-brands');
const tabLinks = document.querySelectorAll('.tab-link a');
const tabPanels = document.querySelectorAll('.tab-panel');
const brandCard = document.querySelectorAll('.brand-card');
const filterOptions = document.querySelectorAll('.filter-option');
const backToTopButton = document.getElementById("back-to-top");

toggleBtn.addEventListener('click', () => {
    moreBrands.style.display = (moreBrands.style.display === 'grid') ? 'none' : 'grid';
});

tabLinks.forEach((link) => {
    link.addEventListener('click', (e) => {
        e.preventDefault();

        tabLinks.forEach(tabLink => tabLink.parentElement.classList.remove('active'));
        tabPanels.forEach(panel => panel.style.display = 'none');
        link.parentElement.classList.add('active');
        const tabId = link.className;
        const targetPanel = document.getElementById(tabId);
        if (targetPanel) targetPanel.style.display = 'block';
    });
});

const redirectToFilter = (value) => {
    if (!value) return;
    window.location.href = `services.html?car=${encodeURIComponent(value)}`;
};

brandCard.forEach(brand => {
    brand.addEventListener('click', () => {
        const brandName = brand.getAttribute('data-brand')

        redirectToFilter(brandName);
    });
});

filterOptions.forEach(filter => {
    filter.addEventListener('click', (e) => {
        e.preventDefault();
        const filterValue = filter.getAttribute('data-filter');

        redirectToFilter(filterValue);
    });
});

async function loadPopularCars() {
    const carData = 'data/cars.json';

    try {
        const response = await fetch(carData);
        const allCars = await response.json();

        const popularCars = allCars.filter(car => car.isPopular === true).slice(0, 8);
        popularCarGrid.innerHTML = ""

        popularCars.forEach(car => {
            const carCard = document.createElement('div');
            carCard.className = 'popular-car-card';

            carCard.style.cursor = 'pointer';

            carCard.onclick = () => {
                window.location.href = `car-details.html?id=${car.id}`;
            };

            carCard.innerHTML = `
                <img src="${car.image}" alt="${car.brand} ${car.name}">
                <h3>${car.brand} ${car.name}</h3>
                <p class="price">${car.price} Birr</p>
            `;
            popularCarGrid.appendChild(carCard);
        });
    } catch (error) {
        console.error("Could not load popular cars:", error);
    }
}

loadPopularCars();

backToTopButton.addEventListener("click", () => {
    window.scrollTo({
        top: 0,
        behavior: "smooth"
    });
});

window.onscroll = function () {
    scrollFunction();
};

function scrollFunction() {
    if (window.scrollY > 300) {
        backToTopButton.style.display = "block";
    } else {
        backToTopButton.style.display = "none";
    }
}