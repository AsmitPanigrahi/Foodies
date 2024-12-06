export const validateEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

export const validatePassword = (password) => {
  // At least 8 characters, 1 uppercase, 1 lowercase, 1 number
  const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[a-zA-Z\d]{8,}$/;
  return passwordRegex.test(password);
};

export const validatePhone = (phone) => {
  const phoneRegex = /^\+?[\d\s-]{10,}$/;
  return phoneRegex.test(phone);
};

export const validateRequired = (value) => {
  return value !== null && value !== undefined && value.toString().trim() !== '';
};

export const validateLength = (value, min, max) => {
  if (!value) return false;
  const length = value.toString().trim().length;
  return length >= min && (max ? length <= max : true);
};

export const validatePrice = (price) => {
  return !isNaN(price) && parseFloat(price) >= 0;
};

export const validateImage = (file) => {
  if (!file) return false;
  const validTypes = ['image/jpeg', 'image/png', 'image/gif'];
  return validTypes.includes(file.type) && file.size <= 5 * 1024 * 1024; // 5MB max
};

export const getErrorMessage = (field, type) => {
  const messages = {
    required: 'This field is required',
    email: 'Please enter a valid email address',
    password: 'Password must be at least 8 characters with 1 uppercase, 1 lowercase and 1 number',
    phone: 'Please enter a valid phone number',
    price: 'Please enter a valid price',
    image: 'Please upload a valid image file (JPEG, PNG, GIF) under 5MB',
    length: 'Length must be between specified limits'
  };
  return messages[type] || 'Invalid input';
};
