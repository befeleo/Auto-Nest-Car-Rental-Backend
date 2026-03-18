document.addEventListener('DOMContentLoaded', function() {
    const contactForm = document.getElementById('contactForm');
    const nameInput = document.getElementById('name');
    const emailInput = document.getElementById('email');
    const phoneInput = document.getElementById('phone');
    const subjectInput = document.getElementById('subject');
    const messageInput = document.getElementById('message');
    const formSuccess = document.getElementById('formSuccess');
    
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const phoneRegex = /^[\+]?[1-9][\d]{0,15}$/;
    const nameRegex = /^[a-zA-Z\s]{2,50}$/;
    
    function validateName() {
        const name = nameInput.value.trim();
        const errorElement = document.getElementById('nameError');
        if (!name) {
            showError(nameInput, errorElement, 'Name is required');
            return false;
        }
        if (!nameRegex.test(name)) {
            showError(nameInput, errorElement, 'Name should be 2-50 letters and spaces only');
            return false;
        }
        showSuccess(nameInput, errorElement);
        return true;
    }
    
    function validateEmail() {
        const email = emailInput.value.trim();
        const errorElement = document.getElementById('emailError');
        if (!email) {
            showError(emailInput, errorElement, 'Email is required');
            return false;
        }
        if (!emailRegex.test(email)) {
            showError(emailInput, errorElement, 'Please enter a valid email address');
            return false;
        }
        showSuccess(emailInput, errorElement);
        return true;
    }
    
    function validatePhone() {
        const phone = phoneInput.value.trim();
        const errorElement = document.getElementById('phoneError');
        if (phone && !phoneRegex.test(phone.replace(/[\s\-\(\)]/g, ''))) {
            showError(phoneInput, errorElement, 'Please enter a valid phone number');
            return false;
        }
        if (phone) {
            showSuccess(phoneInput, errorElement);
        } else {
            clearError(phoneInput, errorElement);
        }
        return true;
    }
    
    function validateSubject() {
        const subject = subjectInput.value;
        const errorElement = document.getElementById('subjectError');
        if (!subject) {
            showError(subjectInput, errorElement, 'Please select a subject');
            return false;
        }
        showSuccess(subjectInput, errorElement);
        return true;
    }
    
    function validateMessage() {
        const message = messageInput.value.trim();
        const errorElement = document.getElementById('messageError');
        if (!message) {
            showError(messageInput, errorElement, 'Message is required');
            return false;
        }
        if (message.length < 10) {
            showError(messageInput, errorElement, 'Message should be at least 10 characters');
            return false;
        }
        showSuccess(messageInput, errorElement);
        return true;
    }
    
    function showError(inputElement, errorElement, message) {
        inputElement.classList.remove('valid');
        inputElement.classList.add('error');
        errorElement.textContent = message;
        errorElement.style.display = 'block';
    }
    
    function showSuccess(inputElement, errorElement) {
        inputElement.classList.remove('error');
        inputElement.classList.add('valid');
        errorElement.textContent = '';
        errorElement.style.display = 'none';
    }
    
    function clearError(inputElement, errorElement) {
        inputElement.classList.remove('error', 'valid');
        errorElement.textContent = '';
        errorElement.style.display = 'none';
    }
    
    nameInput.addEventListener('input', validateName);
    emailInput.addEventListener('input', validateEmail);
    phoneInput.addEventListener('input', validatePhone);
    subjectInput.addEventListener('change', validateSubject);
    messageInput.addEventListener('input', validateMessage);
    
    contactForm.addEventListener('submit', function(event) {
        event.preventDefault();
        const isNameValid = validateName();
        const isEmailValid = validateEmail();
        const isPhoneValid = validatePhone();
        const isSubjectValid = validateSubject();
        const isMessageValid = validateMessage();
        
        if (isNameValid && isEmailValid && isPhoneValid && isSubjectValid && isMessageValid) {
            const submitBtn = contactForm.querySelector('.hero-btn');
            const originalBtnText = submitBtn.innerHTML;
            submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Sending...';
            submitBtn.disabled = true;
            
            setTimeout(() => {
                formSuccess.textContent = 'Thank you! Your message has been sent. We will respond within 24 hours.';
                formSuccess.style.display = 'block';
                submitBtn.innerHTML = originalBtnText;
                submitBtn.disabled = false;
                
                setTimeout(() => {
                    contactForm.reset();
                    const allInputs = contactForm.querySelectorAll('input, select, textarea');
                    allInputs.forEach(input => {
                        input.classList.remove('valid', 'error');
                    });
                    const allErrors = contactForm.querySelectorAll('.error-message');
                    allErrors.forEach(error => {
                        error.textContent = '';
                        error.style.display = 'none';
                    });
                    setTimeout(() => {
                        formSuccess.style.display = 'none';
                    }, 5000);
                }, 3000);
                formSuccess.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
            }, 1500);
        } else {
            const firstError = contactForm.querySelector('.error');
            if (firstError) {
                firstError.scrollIntoView({ behavior: 'smooth', block: 'center' });
                firstError.focus();
            }
        }
    });
    
    phoneInput.addEventListener('input', function(e) {
        let value = e.target.value.replace(/\D/g, '');
        if (value.length > 0) {
            value = '(' + value.substring(0,3) + ') ' + value.substring(3,6) + '-' + value.substring(6,10);
        }
        e.target.value = value;
    });
});