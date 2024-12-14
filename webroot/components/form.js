import { FormHandler, ValidationRules } from '../utils/forms.js';
import { stateManager } from '../state.js';

// Base form component
export class BaseForm {
    constructor(formId, options = {}) {
        this.formId = formId;
        this.options = options;
        this.state = options.initialState || {};
        
        // Initialize form handler
        this.handler = new FormHandler(formId, {
            rules: options.validationRules || {},
            onSubmit: this.handleSubmit.bind(this),
            onChange: this.handleChange.bind(this)
        });

        // Set up state subscription
        if (options.stateKey) {
            this.stateUnsubscribe = stateManager.subscribe(state => {
                const relevantState = state[options.stateKey];
                if (relevantState && relevantState !== this.state) {
                    this.setState(relevantState);
                }
            });
        }
    }

    setState(newState) {
        this.state = { ...this.state, ...newState };
        this.handler.setInitialValues(this.state);
    }

    handleSubmit(formData) {
        // Prevent double submission
        if (this.isSubmitting) return;
        
        this.isSubmitting = true;
        
        // Show loading state
        this.updateSubmitButton(true);

        // Process form data
        Promise.resolve()
            .then(() => this.options.onSubmit?.(formData))
            .then(response => {
                // Handle success
                if (this.options.onSuccess) {
                    this.options.onSuccess(response);
                }
                
                // Reset form if specified
                if (this.options.resetOnSuccess) {
                    this.handler.reset();
                }
                
                // Update state if needed
                if (this.options.stateKey) {
                    stateManager.setState({
                        [this.options.stateKey]: response
                    });
                }
            })
            .catch(error => {
                // Handle error
                if (this.options.onError) {
                    this.options.onError(error);
                }
                console.error('Form submission error:', error);
            })
            .finally(() => {
                this.isSubmitting = false;
                this.updateSubmitButton(false);
            });
    }

    handleChange({ name, value, formData }) {
        if (this.options.onChange) {
            this.options.onChange({ name, value, formData });
        }
    }

    updateSubmitButton(loading) {
        const submitBtn = document.querySelector(`#${this.formId} [type="submit"]`);
        if (submitBtn) {
            submitBtn.disabled = loading;
            submitBtn.innerHTML = loading ? 
                '<span class="loader"></span> Submitting...' : 
                submitBtn.dataset.originalText || 'Submit';
        }
    }

    destroy() {
        if (this.stateUnsubscribe) {
            this.stateUnsubscribe();
        }
    }
}

// Example usage:
/*
const userForm = new BaseForm('user-form', {
    validationRules: {
        username: ValidationRules.username,
        email: ValidationRules.email,
        password: ValidationRules.password
    },
    stateKey: 'userForm',
    resetOnSuccess: true,
    onSubmit: async (formData) => {
        // Submit to server
        const response = await fetch('/api/user', {
            method: 'POST',
            body: JSON.stringify(formData)
        });
        return response.json();
    },
    onSuccess: (response) => {
        console.log('Form submitted successfully:', response);
    },
    onError: (error) => {
        console.error('Form submission failed:', error);
    }
});
*/
