// car-details.js
document.addEventListener('DOMContentLoaded', async function() {
    // Get car ID from URL parameters
    const urlParams = new URLSearchParams(window.location.search);
    const carId = urlParams.get('id');
    
    if (!carId) {
        window.location.href = 'services.html';
        return;
    }
    
    // Load and display car details
    await loadCarDetails(carId);
    
    // Initialize booking form
    initializeBookingForm();
    
    // Load related cars
    await loadRelatedCars(carId);
});

async function loadCarDetails(carId) {
    try {
        // Show loading state
        document.querySelector('.car-details-container').innerHTML = `
            <div style="text-align: center; padding: 50px;">
                <div class="loading-spinner"></div>
                <p>Loading car details...</p>
            </div>
        `;
        
        // Load cars data
        const response = await fetch('./data/cars.json');
        const cars = await response.json();
        
        // Find the car by ID
        const car = cars.find(c => c.id === parseInt(carId));
        
        if (!car) {
            throw new Error('Car not found');
        }
        
        // Display car details
        displayCarDetails(car);
        
        // Set car data for booking form
        window.currentCar = car;
        
    } catch (error) {
        console.error('Error loading car details:', error);
        document.querySelector('.car-details-container').innerHTML = `
            <div style="text-align: center; padding: 100px;">
                <h3>Car Not Found</h3>
                <p>The requested car could not be found.</p>
                <a href="services.html" class="hero-btn">Back to Cars</a>
            </div>
        `;
    }
}

function displayCarDetails(car) {
    const container = document.querySelector('.car-details-container');
    
    // Create image array for gallery
    const images = [];
    
    // Add main image
    if (car.image) {
        images.push({ src: car.image, label: 'Main View' });
    }
    
    // Add detail images if available
    if (car.detailImage) {
        if (car.detailImage.interior) {
            images.push({ src: car.detailImage.interior, label: 'Interior' });
        }
        if (car.detailImage.side) {
            images.push({ src: car.detailImage.side, label: 'Side View' });
        }
        if (car.detailImage.dashboard) {
            images.push({ src: car.detailImage.dashboard, label: 'Dashboard' });
        }
    }
    
    // If no images found, use placeholder
    if (images.length === 0) {
        images.push({ src: 'assets/images/placeholder.jpg', label: 'Car Image' });
    }
    
    // Create status badges
    const badges = [];
    if (car.isPopular) badges.push('popular');
    if (car.isLuxury) badges.push('luxury');
    if (car.isUsed) badges.push('used');
    if (!car.isUsed) badges.push('new');
    
    // Format price with thousand separators
    const formattedPrice = new Intl.NumberFormat('en-US').format(car.price);
    const weeklyPrice = new Intl.NumberFormat('en-US').format(car.price * 7 * 0.85);
    
    container.innerHTML = `
        <!-- Breadcrumb -->
        <div class="breadcrumb">
            <a href="index.html">Home</a> &gt;
            <a href="services.html">Car Service</a> &gt;
            <span>${car.brand} ${car.name}</span>
        </div>

        <!-- Status Badges -->
        <div class="status-badges">
            ${badges.map(badge => `
                <div class="status-badge ${badge}">
                    ${badge.charAt(0).toUpperCase() + badge.slice(1)}
                </div>
            `).join('')}
            <div class="status-badge available">Available</div>
        </div>

        <!-- Car Images Gallery -->
        <section class="car-gallery-section">
            <div class="main-car-image">
                <img src="${images[0].src}" alt="${car.brand} ${car.name}" id="main-image" 
                     onerror="this.onerror=null; this.src='assets/images/placeholder.jpg'">
                <div class="image-nav">
                    <button class="nav-btn prev-btn">
                        <i class="fas fa-chevron-left"></i>
                    </button>
                    <button class="nav-btn next-btn">
                        <i class="fas fa-chevron-right"></i>
                    </button>
                </div>
            </div>
            
            <div class="thumbnail-gallery">
                ${images.map((img, index) => `
                    <div class="thumbnail ${index === 0 ? 'active' : ''}" 
                         data-image="${img.src}" 
                         data-index="${index}">
                        <img src="${img.src}" alt="${img.label}" 
                             onerror="this.onerror=null; this.src='assets/images/placeholder.jpg'">
                        <div class="thumbnail-label">${img.label}</div>
                    </div>
                `).join('')}
            </div>
        </section>

        <!-- Car Details and Booking Form -->
        <section class="details-booking-section">
            <!-- Car Details -->
            <div class="car-details-info">
                <div class="car-header">
                    <h1>${car.brand} ${car.name} ${car.year ? `<span class="car-brand">${car.year}</span>` : ''}</h1>
                    <div class="car-rating">
                        <div class="stars">
                            ${getStarRating(car.rating || 4.0)}
                        </div>
                        <span class="rating-text">${car.rating || 4.0} (${car.reviews || 50} reviews)</span>
                    </div>
                </div>
                
                ${car.description ? `
                    <div class="car-description">
                        <p>${car.description}</p>
                    </div>
                ` : ''}
                
                <div class="price-section">
                    <div class="daily-rate">
                        <span class="rate-label">
                            <i class="fas fa-calendar-day"></i> Daily Rate
                        </span>
                        <span class="rate-amount">${formattedPrice} birr</span>
                    </div>
                    <div class="weekly-rate">
                        <span class="rate-label">
                            <i class="fas fa-calendar-week"></i> Weekly Rate
                        </span>
                        <span class="rate-amount">${weeklyPrice} birr</span>
                        <div class="rate-save">Save 15% on weekly rental</div>
                    </div>
                </div>
                
                <div class="car-specs">
                    <h3><i class="fas fa-cogs"></i> Vehicle Specifications</h3>
                    <div class="specs-grid">
                        <div class="spec-item">
                            <i class="fas fa-gas-pump"></i>
                            <div class="spec-content">
                                <span class="spec-label">Fuel Type</span>
                                <span class="spec-value">${car.fuelType}</span>
                            </div>
                        </div>
                        <div class="spec-item">
                            <i class="fas fa-cogs"></i>
                            <div class="spec-content">
                                <span class="spec-label">Transmission</span>
                                <span class="spec-value">${car.transmission}</span>
                            </div>
                        </div>
                        <div class="spec-item">
                            <i class="fas fa-user-friends"></i>
                            <div class="spec-content">
                                <span class="spec-label">Seating Capacity</span>
                                <span class="spec-value">${car.seats} Persons</span>
                            </div>
                        </div>
                        <div class="spec-item">
                            <i class="fas fa-car"></i>
                            <div class="spec-content">
                                <span class="spec-label">Body Type</span>
                                <span class="spec-value">${car.bodyType}</span>
                            </div>
                        </div>
                        ${car.engine ? `
                        <div class="spec-item">
                            <i class="fas fa-tachometer-alt"></i>
                            <div class="spec-content">
                                <span class="spec-label">Engine</span>
                                <span class="spec-value">${car.engine}</span>
                            </div>
                        </div>
                        ` : ''}
                        ${car.color ? `
                        <div class="spec-item">
                            <i class="fas fa-palette"></i>
                            <div class="spec-content">
                                <span class="spec-label">Color</span>
                                <span class="spec-value">${car.color}</span>
                            </div>
                        </div>
                        ` : ''}
                        ${car.mileage ? `
                        <div class="spec-item">
                            <i class="fas fa-road"></i>
                            <div class="spec-content">
                                <span class="spec-label">Mileage</span>
                                <span class="spec-value">${car.mileage}</span>
                            </div>
                        </div>
                        ` : ''}
                        ${car.year ? `
                        <div class="spec-item">
                            <i class="fas fa-calendar"></i>
                            <div class="spec-content">
                                <span class="spec-label">Year</span>
                                <span class="spec-value">${car.year}</span>
                            </div>
                        </div>
                        ` : ''}
                        ${car.fuelEfficiency ? `
                        <div class="spec-item">
                            <i class="fas fa-gas-pump"></i>
                            <div class="spec-content">
                                <span class="spec-label">Fuel Efficiency</span>
                                <span class="spec-value">${car.fuelEfficiency}</span>
                            </div>
                        </div>
                        ` : ''}
                        ${car.power ? `
                        <div class="spec-item">
                            <i class="fas fa-bolt"></i>
                            <div class="spec-content">
                                <span class="spec-label">Power</span>
                                <span class="spec-value">${car.power}</span>
                            </div>
                        </div>
                        ` : ''}
                    </div>
                </div>
                
                ${car.features && car.features.length > 0 ? `
                <div class="features-list">
                    <h3><i class="fas fa-star"></i> Key Features</h3>
                    <div class="features-grid">
                        ${car.features.slice(0, 8).map(feature => `
                            <div class="feature-item">
                                <i class="fas fa-check-circle"></i>
                                <span>${feature}</span>
                            </div>
                        `).join('')}
                        ${car.features.length > 8 ? `
                            <div class="feature-item">
                                <i class="fas fa-plus-circle"></i>
                                <span>+${car.features.length - 8} more features</span>
                            </div>
                        ` : ''}
                    </div>
                </div>
                ` : ''}

                <!-- Additional Information -->
                <div class="car-specs" style="margin-top: 30px;">
                    <h3><i class="fas fa-info-circle"></i> Additional Information</h3>
                    <div class="specs-grid">
                        ${car.location ? `
                        <div class="spec-item">
                            <i class="fas fa-map-marker-alt"></i>
                            <div class="spec-content">
                                <span class="spec-label">Location</span>
                                <span class="spec-value">${car.location}</span>
                            </div>
                        </div>
                        ` : ''}
                        ${car.insurance ? `
                        <div class="spec-item">
                            <i class="fas fa-shield-alt"></i>
                            <div class="spec-content">
                                <span class="spec-label">Insurance</span>
                                <span class="spec-value">${car.insurance}</span>
                            </div>
                        </div>
                        ` : ''}
                        ${car.available !== undefined ? `
                        <div class="spec-item">
                            <i class="fas ${car.available ? 'fa-check-circle' : 'fa-times-circle'}"></i>
                            <div class="spec-content">
                                <span class="spec-label">Availability</span>
                                <span class="spec-value">${car.available ? 'Available Now' : 'Not Available'}</span>
                            </div>
                        </div>
                        ` : ''}
                        ${car.batteryRange ? `
                        <div class="spec-item">
                            <i class="fas fa-car-battery"></i>
                            <div class="spec-content">
                                <span class="spec-label">Battery Range</span>
                                <span class="spec-value">${car.batteryRange}</span>
                            </div>
                        </div>
                        ` : ''}
                        ${car.chargingTime ? `
                        <div class="spec-item">
                            <i class="fas fa-charging-station"></i>
                            <div class="spec-content">
                                <span class="spec-label">Charging Time</span>
                                <span class="spec-value">${car.chargingTime}</span>
                            </div>
                        </div>
                        ` : ''}
                        ${car.torque ? `
                        <div class="spec-item">
                            <i class="fas fa-cog"></i>
                            <div class="spec-content">
                                <span class="spec-label">Torque</span>
                                <span class="spec-value">${car.torque}</span>
                            </div>
                        </div>
                        ` : ''}
                    </div>
                </div>
            </div>

            <!-- Booking Form -->
            <div class="booking-form-container">
                <h2><i class="fas fa-calendar-check"></i> Book This Vehicle</h2>
                <form id="booking-form">
                    <input type="hidden" id="car-id" value="${car.id}">
                    <input type="hidden" id="car-name" value="${car.brand} ${car.name}">
                    <input type="hidden" id="daily-rate" value="${car.price}">
                    
                    <div class="form-group">
                        <label for="full-name"><i class="fas fa-user"></i> Full Name *</label>
                        <input type="text" id="full-name" name="full-name" required 
                               placeholder="Enter your full name">
                        <div class="error-message" id="full-name-error"></div>
                    </div>
                    
                    <div class="form-group">
                        <label for="email"><i class="fas fa-envelope"></i> Email Address *</label>
                        <input type="email" id="email" name="email" required 
                               placeholder="your.email@example.com">
                        <div class="error-message" id="email-error"></div>
                    </div>
                    
                    <div class="form-group">
                        <label for="phone"><i class="fas fa-phone"></i> Phone Number *</label>
                        <input type="tel" id="phone" name="phone" required 
                               placeholder="+251 9XX XXX XXX">
                        <div class="error-message" id="phone-error"></div>
                    </div>
                    
                    <div class="date-group">
                        <div class="form-group">
                            <label for="pickup-date"><i class="fas fa-calendar-plus"></i> Pick-up Date *</label>
                            <input type="date" id="pickup-date" name="pickup-date" required>
                            <div class="error-message" id="pickup-date-error"></div>
                        </div>
                        
                        <div class="form-group">
                            <label for="dropoff-date"><i class="fas fa-calendar-minus"></i> Drop-off Date *</label>
                            <input type="date" id="dropoff-date" name="dropoff-date" required>
                            <div class="error-message" id="dropoff-date-error"></div>
                        </div>
                    </div>
                    
                    <div class="form-group">
                        <label for="pickup-location"><i class="fas fa-map-marker-alt"></i> Pick-up Location *</label>
                        <select id="pickup-location" name="pickup-location" required>
                            <option value="">Select location</option>
                            <option value="addis_ababa_airport">Addis Ababa Bole Airport</option>
                            <option value="addis_ababa_center">City Center Office</option>
                            <option value="addis_ababa_south">South Addis Office</option>
                            <option value="other_location">Other (Specify in notes)</option>
                        </select>
                        <div class="error-message" id="pickup-location-error"></div>
                    </div>
                    
                    <div class="form-group">
                        <label for="driver-type"><i class="fas fa-id-card"></i> Driver Option</label>
                        <select id="driver-type" name="driver-type">
                            <option value="self_drive">Self Drive</option>
                            <option value="with_driver">With Driver (Additional 2,000 birr/day)</option>
                        </select>
                    </div>
                    
                    <div class="form-group">
                        <label for="special-requests"><i class="fas fa-comment"></i> Special Requests</label>
                        <textarea id="special-requests" name="special-requests" rows="3" 
                                  placeholder="Any special requirements or questions..."></textarea>
                    </div>
                    
                    <div class="form-note">
                        <i class="fas fa-info-circle"></i>
                        Our team will contact you within 2 hours to confirm your booking and discuss payment options.
                    </div>
                    
                    <div class="total-price">
                        <div class="total-row">
                            <span>Rental Period:</span>
                            <span id="total-days">0</span> days
                        </div>
                        <div class="total-row">
                            <span>Daily Rate:</span>
                            <span>${formattedPrice} birr</span>
                        </div>
                        <div class="total-row">
                            <span>Weekly Discount:</span>
                            <span id="discount-amount">0 birr</span>
                        </div>
                        <div class="total-row">
                            <span>Driver Fee:</span>
                            <span id="driver-fee">0 birr</span>
                        </div>
                        <div class="total-row total">
                            <span>Total Price:</span>
                            <span id="total-price">0 birr</span>
                        </div>
                    </div>
                    
                    <div class="rental-terms">
                        <h4><i class="fas fa-file-contract"></i> Rental Terms</h4>
                        <ul>
                            <li>Minimum rental period: 1 day</li>
                            <li>Security deposit required upon pickup</li>
                            <li>Free cancellation up to 24 hours before pickup</li>
                            <li>Insurance included in rental price</li>
                            <li>Must be 21+ years old with valid driver's license</li>
                            <li>Unlimited mileage included</li>
                        </ul>
                    </div>
                    
                    <button type="submit" class="submit-btn">
                        <i class="fas fa-calendar-check"></i>
                        Book Now
                    </button>
                </form>
                
                <div class="success-message" id="success-message">
                    <i class="fas fa-check-circle"></i>
                    <h3>Booking Request Submitted!</h3>
                    <p>Thank you for your booking request. Our team will contact you shortly to confirm your reservation and discuss payment details.</p>
                    <div class="success-details" id="success-details"></div>
                    <button onclick="window.location.href='services.html'" class="hero-btn" style="margin-top: 20px;">
                        Browse More Cars
                    </button>
                </div>
            </div>
        </section>
    `;
    
    // Initialize gallery functionality
    initializeGallery(images);
}

function getStarRating(rating) {
    let stars = '';
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 >= 0.5;
    
    for (let i = 0; i < fullStars; i++) {
        stars += '<i class="fas fa-star"></i>';
    }
    
    if (hasHalfStar) {
        stars += '<i class="fas fa-star-half-alt"></i>';
    }
    
    const emptyStars = 5 - fullStars - (hasHalfStar ? 1 : 0);
    for (let i = 0; i < emptyStars; i++) {
        stars += '<i class="far fa-star"></i>';
    }
    
    return stars;
}

function initializeGallery(images) {
    const mainImage = document.getElementById('main-image');
    const thumbnails = document.querySelectorAll('.thumbnail');
    const prevBtn = document.querySelector('.prev-btn');
    const nextBtn = document.querySelector('.next-btn');
    
    if (!mainImage || !thumbnails.length) return;
    
    let currentIndex = 0;
    
    // Thumbnail click handler
    thumbnails.forEach((thumb, index) => {
        thumb.addEventListener('click', function() {
            // Remove active class from all thumbnails
            thumbnails.forEach(t => t.classList.remove('active'));
            
            // Add active class to clicked thumbnail
            this.classList.add('active');
            
            // Change main image
            currentIndex = index;
            updateMainImage();
        });
    });
    
    // Previous button
    if (prevBtn) {
        prevBtn.addEventListener('click', function() {
            currentIndex = (currentIndex - 1 + images.length) % images.length;
            updateMainImage();
            updateActiveThumbnail();
        });
    }
    
    // Next button
    if (nextBtn) {
        nextBtn.addEventListener('click', function() {
            currentIndex = (currentIndex + 1) % images.length;
            updateMainImage();
            updateActiveThumbnail();
        });
    }
    
    function updateMainImage() {
        mainImage.src = images[currentIndex].src;
        mainImage.style.opacity = '0.5';
        setTimeout(() => {
            mainImage.style.opacity = '1';
        }, 150);
    }
    
    function updateActiveThumbnail() {
        thumbnails.forEach((t, i) => {
            t.classList.toggle('active', i === currentIndex);
        });
    }
    
    // Auto-rotate images every 5 seconds (only if more than 1 image)
    if (images.length > 1) {
        setInterval(() => {
            currentIndex = (currentIndex + 1) % images.length;
            updateMainImage();
            updateActiveThumbnail();
        }, 5000);
    }
}

function initializeBookingForm() {
    const bookingForm = document.getElementById('booking-form');
    const successMessage = document.getElementById('success-message');
    const totalDaysElement = document.getElementById('total-days');
    const totalPriceElement = document.getElementById('total-price');
    const discountAmountElement = document.getElementById('discount-amount');
    const driverFeeElement = document.getElementById('driver-fee');
    
    if (!bookingForm) return;
    
    // Set minimum dates
    function setMinDates() {
        const today = new Date();
        const tomorrow = new Date(today);
        tomorrow.setDate(tomorrow.getDate() + 1);
        
        const pickupDate = document.getElementById('pickup-date');
        const dropoffDate = document.getElementById('dropoff-date');
        
        if (!pickupDate || !dropoffDate) return;
        
        // Format dates for input fields
        const formatDate = (date) => {
            return date.toISOString().split('T')[0];
        };
        
        const minDate = formatDate(tomorrow);
        pickupDate.min = minDate;
        dropoffDate.min = minDate;
        
        // Set default dates
        pickupDate.value = minDate;
        const dayAfterTomorrow = new Date(tomorrow);
        dayAfterTomorrow.setDate(dayAfterTomorrow.getDate() + 2);
        dropoffDate.value = formatDate(dayAfterTomorrow);
        
        // Calculate initial total
        calculateTotal();
    }
    
    // Calculate total price
    function calculateTotal() {
        const pickupDate = document.getElementById('pickup-date');
        const dropoffDate = document.getElementById('dropoff-date');
        const driverType = document.getElementById('driver-type');
        
        if (pickupDate && dropoffDate && driverType && window.currentCar) {
            const pickup = new Date(pickupDate.value);
            const dropoff = new Date(dropoffDate.value);
            
            // Calculate days difference
            const timeDiff = dropoff.getTime() - pickup.getTime();
            const daysDiff = Math.ceil(timeDiff / (1000 * 3600 * 24));
            
            if (daysDiff > 0) {
                totalDaysElement.textContent = daysDiff;
                
                // Calculate base price
                let totalPrice = daysDiff * window.currentCar.price;
                let discount = 0;
                let driverFee = 0;
                
                // Apply weekly discount
                const weeks = Math.floor(daysDiff / 7);
                if (weeks > 0) {
                    const weeklyDiscount = weeks * 7 * window.currentCar.price * 0.15;
                    discount = weeklyDiscount;
                    totalPrice -= weeklyDiscount;
                }
                
                // Add driver cost if selected
                if (driverType.value === 'with_driver') {
                    driverFee = daysDiff * 2000;
                    totalPrice += driverFee;
                }
                
                // Update display
                discountAmountElement.textContent = formatNumber(discount) + ' birr';
                driverFeeElement.textContent = formatNumber(driverFee) + ' birr';
                totalPriceElement.textContent = formatNumber(totalPrice) + ' birr';
            } else {
                totalDaysElement.textContent = '0';
                discountAmountElement.textContent = '0 birr';
                driverFeeElement.textContent = '0 birr';
                totalPriceElement.textContent = '0 birr';
            }
        }
    }
    
    // Format number with thousand separators
    function formatNumber(num) {
        return new Intl.NumberFormat('en-US').format(num);
    }
    
    // Form validation
    function validateForm() {
        let isValid = true;
        const requiredFields = bookingForm.querySelectorAll('[required]');
        
        // Reset error states
        bookingForm.querySelectorAll('.error-message').forEach(el => {
            el.style.display = 'none';
        });
        bookingForm.querySelectorAll('.error').forEach(el => {
            el.classList.remove('error');
        });
        
        // Validate each required field
        requiredFields.forEach(field => {
            if (!field.value.trim()) {
                field.classList.add('error');
                const errorId = field.id + '-error';
                const errorElement = document.getElementById(errorId);
                if (errorElement) {
                    errorElement.textContent = 'This field is required';
                    errorElement.style.display = 'block';
                }
                isValid = false;
            } else if (field.type === 'email' && !validateEmail(field.value)) {
                field.classList.add('error');
                const errorId = field.id + '-error';
                const errorElement = document.getElementById(errorId);
                if (errorElement) {
                    errorElement.textContent = 'Please enter a valid email address';
                    errorElement.style.display = 'block';
                }
                isValid = false;
            } else if (field.type === 'tel' && !validatePhone(field.value)) {
                field.classList.add('error');
                const errorId = field.id + '-error';
                const errorElement = document.getElementById(errorId);
                if (errorElement) {
                    errorElement.textContent = 'Format: +251XXXXXXXXX or 0XXXXXXXXX';
                    errorElement.style.display = 'block';
                }
                isValid = false;
            }
        });
        
        // Validate dates
        const pickupDate = document.getElementById('pickup-date');
        const dropoffDate = document.getElementById('dropoff-date');
        
        if (pickupDate && dropoffDate && pickupDate.value && dropoffDate.value) {
            const pickup = new Date(pickupDate.value);
            const dropoff = new Date(dropoffDate.value);
            
            if (dropoff <= pickup) {
                pickupDate.classList.add('error');
                dropoffDate.classList.add('error');
                document.getElementById('pickup-date-error').textContent = 'Drop-off date must be after pick-up date';
                document.getElementById('pickup-date-error').style.display = 'block';
                document.getElementById('dropoff-date-error').textContent = 'Drop-off date must be after pick-up date';
                document.getElementById('dropoff-date-error').style.display = 'block';
                isValid = false;
            }
            
            // Check if pickup is at least tomorrow
            const today = new Date();
            today.setHours(0, 0, 0, 0);
            if (pickup < today) {
                pickupDate.classList.add('error');
                document.getElementById('pickup-date-error').textContent = 'Pick-up date cannot be in the past';
                document.getElementById('pickup-date-error').style.display = 'block';
                isValid = false;
            }
        }
        
        return isValid;
    }
    
    function validateEmail(email) {
        const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return re.test(email);
    }
    
    function validatePhone(phone) {
        const cleaned = phone.replace(/\s+/g, '');
        const re = /^(\+251|0)[0-9]{9}$/;
        return re.test(cleaned);
    }
    
    // Save booking to local storage
    function saveBooking(formData) {
        let bookings = JSON.parse(localStorage.getItem('carBookings')) || [];
        
        const booking = {
            id: Date.now(),
            carId: window.currentCar.id,
            carName: `${window.currentCar.brand} ${window.currentCar.name}`,
            carImage: window.currentCar.image,
            ...formData,
            submittedAt: new Date().toISOString(),
            status: 'pending'
        };
        
        bookings.push(booking);
        localStorage.setItem('carBookings', JSON.stringify(bookings));
        
        return booking;
    }
    
    // Form submission
    bookingForm.addEventListener('submit', function(e) {
        e.preventDefault();
        
        if (!validateForm()) {
            return;
        }
        
        // Collect form data
        const formData = {
            fullName: document.getElementById('full-name').value,
            email: document.getElementById('email').value,
            phone: document.getElementById('phone').value,
            pickupDate: document.getElementById('pickup-date').value,
            dropoffDate: document.getElementById('dropoff-date').value,
            pickupLocation: document.getElementById('pickup-location').value,
            driverType: document.getElementById('driver-type').value,
            specialRequests: document.getElementById('special-requests').value,
            totalDays: totalDaysElement.textContent,
            totalPrice: totalPriceElement.textContent,
            discount: discountAmountElement.textContent,
            driverFee: driverFeeElement.textContent
        };
        
        // Save to local storage
        const booking = saveBooking(formData);
        
        // Show success message
        bookingForm.style.display = 'none';
        successMessage.style.display = 'block';
        
        // Display booking details
        const successDetails = document.getElementById('success-details');
        successDetails.innerHTML = `
            <h4>Booking Details</h4>
            <div class="detail-row">
                <span>Booking ID:</span>
                <span>#${booking.id}</span>
            </div>
            <div class="detail-row">
                <span>Vehicle:</span>
                <span>${booking.carName}</span>
            </div>
            <div class="detail-row">
                <span>Pick-up Date:</span>
                <span>${new Date(booking.pickupDate).toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</span>
            </div>
            <div class="detail-row">
                <span>Duration:</span>
                <span>${booking.totalDays} days</span>
            </div>
            <div class="detail-row">
                <span>Total Price:</span>
                <span>${booking.totalPrice}</span>
            </div>
            <div class="detail-row">
                <span>Status:</span>
                <span style="color: #FFD700; font-weight: bold;">Pending Confirmation</span>
            </div>
        `;
        
        // Scroll to success message
        successMessage.scrollIntoView({ behavior: 'smooth' });
        
        // Send notification (simulated)
        sendBookingNotification(booking);
        
        // Clear form after submission
        setTimeout(() => {
            bookingForm.reset();
            setMinDates();
        }, 3000);
    });
    
    // Initialize event listeners
    setMinDates();
    
    // Recalculate on date changes
    document.getElementById('pickup-date').addEventListener('change', calculateTotal);
    document.getElementById('dropoff-date').addEventListener('change', calculateTotal);
    document.getElementById('driver-type').addEventListener('change', calculateTotal);
    
    // Real-time phone validation
    document.getElementById('phone').addEventListener('input', function(e) {
        const errorElement = document.getElementById('phone-error');
        if (errorElement) {
            if (e.target.value && !validatePhone(e.target.value)) {
                errorElement.textContent = 'Format: +251XXXXXXXXX or 0XXXXXXXXX';
                errorElement.style.display = 'block';
            } else {
                errorElement.style.display = 'none';
            }
        }
    });
}

async function loadRelatedCars(carId) {
    try {
        const response = await fetch('./data/cars.json');
        const cars = await response.json();
        
        const currentCar = cars.find(c => c.id === parseInt(carId));
        if (!currentCar) return;
        
        // Get related cars (same brand or similar body type, exclude current car)
        const relatedCars = cars
            .filter(c => c.id !== parseInt(carId))
            .sort((a, b) => {
                // Prioritize same brand
                if (a.brand === currentCar.brand && b.brand !== currentCar.brand) return -1;
                if (b.brand === currentCar.brand && a.brand !== currentCar.brand) return 1;
                
                // Then prioritize same body type
                if (a.bodyType === currentCar.bodyType && b.bodyType !== currentCar.bodyType) return -1;
                if (b.bodyType === currentCar.bodyType && a.bodyType !== currentCar.bodyType) return 1;
                
                // Then by popularity
                if (a.isPopular && !b.isPopular) return -1;
                if (!a.isPopular && b.isPopular) return 1;
                
                return 0;
            })
            .slice(0, 4);
        
        if (relatedCars.length > 0) {
            displayRelatedCars(relatedCars);
        }
    } catch (error) {
        console.error('Error loading related cars:', error);
    }
}

function displayRelatedCars(cars) {
    const container = document.querySelector('.car-details-container');
    
    const relatedSection = document.createElement('section');
    relatedSection.className = 'related-cars';
    relatedSection.innerHTML = `
        <h2>You Might Also Like</h2>
        <div class="related-cars-grid">
            ${cars.map(car => `
                <a href="car-details.html?id=${car.id}" class="related-car-card">
                    <img src="${car.image}" alt="${car.brand} ${car.name}" 
                         onerror="this.onerror=null; this.src='assets/images/placeholder.jpg'">
                    <div class="card-content">
                        <h3>${car.brand} ${car.name}</h3>
                        <p class="price">${new Intl.NumberFormat('en-US').format(car.price)} birr / day</p>
                        <div class="specs">
                            <span>${car.bodyType}</span>
                            <span>•</span>
                            <span>${car.fuelType}</span>
                            <span>•</span>
                            <span>${car.transmission}</span>
                        </div>
                        ${car.isLuxury ? '<span class="status-badge luxury" style="margin-top: 10px; display: inline-block;">Luxury</span>' : ''}
                        ${car.isPopular ? '<span class="status-badge popular" style="margin-top: 10px; display: inline-block; margin-left: 5px;">Popular</span>' : ''}
                    </div>
                </a>
            `).join('')}
        </div>
    `;
    
    container.appendChild(relatedSection);
}

function sendBookingNotification(booking) {
    // Simulate sending notification to admin
    console.log('Booking notification sent:', {
        to: 'admin@autonestrental.com',
        subject: `New Car Booking - ${booking.carName}`,
        bookingDetails: booking
    });
    
    // In a real application, you would send this to your backend
    // Example:
    /*
    fetch('/api/bookings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(booking)
    });
    */
}

// Add loading spinner CSS dynamically
const style = document.createElement('style');
style.textContent = `
    .loading-spinner {
        border: 4px solid #f3f3f3;
        border-top: 4px solid #ff1313;
        border-radius: 50%;
        width: 50px;
        height: 50px;
        animation: spin 1s linear infinite;
        margin: 0 auto 20px;
    }
    
    @keyframes spin {
        0% { transform: rotate(0deg); }
        100% { transform: rotate(360deg); }
    }
`;
document.head.appendChild(style);