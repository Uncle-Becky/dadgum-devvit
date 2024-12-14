// Form validation and handling utilities
export class FormValidator {
    constructor(rules = {}) {
        this.rules = rules;
        this.errors = new Map();
    }

    // Add validation rules
    addRules(rules) {
        this.rules = { ...this.rules, ...rules };
    }

    // Validate a single field
    validateField(name, value) {
        const rule = this.rules[name];
        if (!rule) return true;

        const errors = [];
        
        if (rule.required && !value) {
            errors.push('This field is required');
        }

        if (rule.minLength && value.length < rule.minLength) {
            errors.push(`Minimum length is ${rule.minLength} characters`);
        }

        if (rule.maxLength && value.length > rule.maxLength) {
            errors.push(`Maximum length is ${rule.maxLength} characters`);
        }

        if (rule.pattern && !rule.pattern.test(value)) {
            errors.push(rule.message || 'Invalid format');
        }

        if (rule.custom) {
            const customError = rule.custom(value);
            if (customError) errors.push(customError);
        }

        this.errors.set(name, errors);
        return errors.length === 0;
    }

    // Validate entire form
    validateForm(formData) {
        let isValid = true;
        this.errors.clear();

        Object.entries(formData).forEach(([name, value]) => {
            if (!this.validateField(name, value)) {
                isValid = false;
            }
        });

        return isValid;
    }

    // Get errors for a field
    getFieldErrors(name) {
        return this.errors.get(name) || [];
    }

    // Get all form errors
    getAllErrors() {
        return Object.fromEntries(this.errors);
    }

    // Clear all errors
    clearErrors() {
        this.errors.clear();
    }
}

// Form handler class
export class FormHandler {
    constructor(formId, options = {}) {
        this.form = document.getElementById(formId);
        this.validator = new FormValidator(options.rules);
        this.onSubmit = options.onSubmit || (() => {});
        this.onChange = options.onChange || (() => {});
        this.state = {};
        
        if (!this.form) {
            throw new Error(`Form with id "${formId}" not found`);
        }

        this.setupListeners();
    }

    setupListeners() {
        // Handle form submission
        this.form.addEventListener('submit', (e) => {
            e.preventDefault();
            this.handleSubmit();
        });

        // Handle input changes
        this.form.addEventListener('input', (e) => {
            const { name, value } = e.target;
            if (name) {
                this.handleChange(name, value);
            }
        });

        // Handle blur events for validation
        this.form.addEventListener('blur', (e) => {
            const { name, value } = e.target;
            if (name) {
                this.validator.validateField(name, value);
                this.updateFieldError(name);
            }
        }, true);
    }

    handleSubmit() {
        const formData = this.getFormData();
        
        if (this.validator.validateForm(formData)) {
            this.onSubmit(formData);
        }
        
        this.updateAllErrors();
    }

    handleChange(name, value) {
        this.state[name] = value;
        this.onChange({ name, value, formData: this.state });
    }

    getFormData() {
        const formData = new FormData(this.form);
        return Object.fromEntries(formData.entries());
    }

    updateFieldError(name) {
        const errorContainer = this.form.querySelector(`[data-error="${name}"]`);
        if (errorContainer) {
            const errors = this.validator.getFieldErrors(name);
            errorContainer.textContent = errors.join(', ');
            errorContainer.style.display = errors.length ? 'block' : 'none';
        }
    }

    updateAllErrors() {
        Object.keys(this.validator.rules).forEach(name => {
            this.updateFieldError(name);
        });
    }

    reset() {
        this.form.reset();
        this.state = {};
        this.validator.clearErrors();
        this.updateAllErrors();
    }

    setInitialValues(values) {
        Object.entries(values).forEach(([name, value]) => {
            const element = this.form.elements[name];
            if (element) {
                element.value = value;
                this.state[name] = value;
            }
        });
    }
}

// Common validation rules
export const ValidationRules = {
    required: { required: true },
    email: {
        required: true,
        pattern: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
        message: 'Please enter a valid email address'
    },
    username: {
        required: true,
        minLength: 3,
        maxLength: 20,
        pattern: /^[a-zA-Z0-9_-]+$/,
        message: 'Username can only contain letters, numbers, underscores and hyphens'
    },
    password: {
        required: true,
        minLength: 8,
        custom: (value) => {
            if (!/[A-Z]/.test(value)) return 'Password must contain at least one uppercase letter';
            if (!/[a-z]/.test(value)) return 'Password must contain at least one lowercase letter';
            if (!/[0-9]/.test(value)) return 'Password must contain at least one number';
            return null;
        }
    }
};
