function validateRequired(input) {
    const value = input.value.trim();
  
    if (!value) {
      showError(input, 'This field is required.');
      return false;
    }
  
    hideError(input);
    return true; // Valid input
  }
  
  function validateEmail(input) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const email = input.value.trim();
  
    if (!emailRegex.test(email)) {
      showError(input, 'Please enter a valid email address.');
      return false;
    }
  
    hideError(input);
    return true; // Valid email
  }
  
  function validateMobileNumber(input) {
    const mobileRegex = /^\d{10}$/;
    const mobileNumber = input.value.trim();
  
    if (!mobileRegex.test(mobileNumber)) {
      showError(input, 'Please enter a valid mobile number (10 digits only).');
      return false;
    }
  
    hideError(input);
    return true; // Valid mobile number
  }
  
  function validatePassword(input) {
    const passwordRegex = /^(?=.*[a-zA-Z])(?=.*[!@#$%^&*])[a-zA-Z0-9!@#$%^&*]{8,}$/;
    const password = input.value.trim();
  
    if (!passwordRegex.test(password)) {
      showError(
        input,
        'Please enter a valid password (minimum 8 characters with at least one letter, one number, and one special character).'
      );
      return false;
    }
  
    hideError(input);
    return true; // Valid password
  }
  
  function showError(input, errorMessage) {
    const errorElement = getErrorElement(input);
    errorElement.textContent = errorMessage;
    errorElement.style.display = 'block';
  }
  
  function hideError(input) {
    const errorElement = getErrorElement(input);
    errorElement.textContent = '';
    errorElement.style.display = 'none';
  }
  
  function getErrorElement(input) {
    const parent = input.parentNode;
    let errorElement = parent.querySelector('.error-message');
  
    if (!errorElement) {
      errorElement = document.createElement('div');
      errorElement.className = 'error-message';
      parent.appendChild(errorElement);
    }
  
    return errorElement;
  }