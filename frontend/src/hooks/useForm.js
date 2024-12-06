import { useState, useCallback } from 'react';
import * as validators from '../utils/validation';

const useForm = (initialValues = {}, validationRules = {}) => {
  const [values, setValues] = useState(initialValues);
  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});

  const validateField = useCallback((name, value) => {
    const rules = validationRules[name];
    if (!rules) return '';

    for (const rule of rules) {
      const { type, min, max } = rule;
      
      switch (type) {
        case 'required':
          if (!validators.validateRequired(value)) {
            return validators.getErrorMessage(name, 'required');
          }
          break;
          
        case 'email':
          if (!validators.validateEmail(value)) {
            return validators.getErrorMessage(name, 'email');
          }
          break;
          
        case 'password':
          if (!validators.validatePassword(value)) {
            return validators.getErrorMessage(name, 'password');
          }
          break;
          
        case 'phone':
          if (!validators.validatePhone(value)) {
            return validators.getErrorMessage(name, 'phone');
          }
          break;
          
        case 'length':
          if (!validators.validateLength(value, min, max)) {
            return validators.getErrorMessage(name, 'length');
          }
          break;
          
        case 'price':
          if (!validators.validatePrice(value)) {
            return validators.getErrorMessage(name, 'price');
          }
          break;
          
        default:
          break;
      }
    }
    
    return '';
  }, [validationRules]);

  const handleChange = useCallback((e) => {
    const { name, value } = e.target;
    setValues(prev => ({ ...prev, [name]: value }));
    
    const error = validateField(name, value);
    setErrors(prev => ({ ...prev, [name]: error }));
  }, [validateField]);

  const handleBlur = useCallback((e) => {
    const { name } = e.target;
    setTouched(prev => ({ ...prev, [name]: true }));
  }, []);

  const validateForm = useCallback(() => {
    const newErrors = {};
    let isValid = true;

    Object.keys(validationRules).forEach(name => {
      const value = values[name];
      const error = validateField(name, value);
      if (error) {
        newErrors[name] = error;
        isValid = false;
      }
    });

    setErrors(newErrors);
    return isValid;
  }, [validateField, values, validationRules]);

  const resetForm = useCallback(() => {
    setValues(initialValues);
    setErrors({});
    setTouched({});
  }, [initialValues]);

  return {
    values,
    errors,
    touched,
    handleChange,
    handleBlur,
    validateForm,
    resetForm,
    setValues,
  };
};

export default useForm;
