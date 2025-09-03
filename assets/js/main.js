// Initialize AOS
if (window.AOS) {
    AOS.init({
        once: true,
        duration: 600,
        easing: 'ease-out-cubic'
    });
}

// Reusable data-attribute driven carousel
(function ($) {
    function initCarousel($root) {
        var $slidesSrc = $root.find('[data-slides]').first();
        var slides = [];
        $slidesSrc.find('[data-slide]').each(function () {
            slides.push({
                title: $(this).attr('data-title') || '',
                desc: $(this).attr('data-desc') || ''
            });
        });
        if (!slides.length) return;

        var $title = $root.find('[data-slot="title"]').first();
        var $desc = $root.find('[data-slot="desc"]').first();
        var $dotsWrap = $root.find('[data-slot="dots"]').first();
        var interval = parseInt($root.attr('data-interval'), 10) || 5000;

        // Build dots
        $dotsWrap.empty();
        slides.forEach(function (_, i) {
            var $b = $('<button/>', {
                type: 'button',
                class: 'w-8  h-1 lg:h-1.5 rounded-full bg-white/50 js-dot cursor-pointer',
                'data-index': i,
                'aria-label': 'Slide ' + (i + 1),
                'aria-selected': 'false'
            });
            if (i === 0) $b.removeClass('bg-white/50').addClass('bg-white is-active').attr('aria-selected', 'true').addClass('w-12');
            $dotsWrap.append($b);
        });

        var $dots = $dotsWrap.find('.js-dot');
        var current = 0;
        var autoTimer = null;

        function setSlide(index) {
            var s = slides[index];
            if ($title.length) $title.fadeOut(150, function () { $title.text(s.title).fadeIn(200); });
            if ($desc.length) $desc.fadeOut(150, function () { $desc.text(s.desc).fadeIn(200); });

            $dots.removeClass('is-active').attr('aria-selected', 'false').removeClass('bg-white').addClass('bg-white/50').removeClass('w-12').each(function (i, el) {
                if (i === index) {
                    $(el).addClass('is-active').attr('aria-selected', 'true').removeClass('bg-white/50').addClass('bg-white').addClass('w-12');
                }
            });
        }

        function go(i) {
            current = ((i % slides.length) + slides.length) % slides.length;
            setSlide(current);
        }

        $dots.on('click keydown', function (e) {
            if (e.type === 'click' || (e.type === 'keydown' && (e.key === 'Enter' || e.key === ' '))) {
                var idx = parseInt($(this).data('index'), 10) || 0;
                go(idx);
                if (autoTimer) {
                    clearInterval(autoTimer);
                    autoTimer = setInterval(function () { go(current + 1); }, interval);
                }
                e.preventDefault();
            }
        });

        autoTimer = setInterval(function () { go(current + 1); }, interval);
        setSlide(0);
    }

    $(function () {
        $('.js-carousel').each(function () { initCarousel($(this)); });
    });
})(jQuery);

// Reusable OTP Input Handler
(function ($) {
    function initOTPInput($container) {
        var $inputs = $container.find('[data-otp-input]');
        var maxLength = parseInt($container.attr('data-otp-length')) || 6;

        // Ensure we have the right number of inputs
        if ($inputs.length !== maxLength) {
            console.warn('OTP container has ' + $inputs.length + ' inputs but expects ' + maxLength);
            return;
        }

        // Set maxlength attribute on all inputs
        $inputs.attr('maxlength', 1);

        // Handle input events
        $inputs.on('input', function () {
            var $current = $(this);
            var value = $current.val();
            var currentIndex = $inputs.index($current);

            // Only allow single digits
            if (value.length > 1) {
                $current.val(value.slice(0, 1));
            }

            // Move to next input if value is entered
            if (value && currentIndex < maxLength - 1) {
                $inputs.eq(currentIndex + 1).focus();
            }
        });

        // Handle keydown events for backspace
        $inputs.on('keydown', function (e) {
            var $current = $(this);
            var currentIndex = $inputs.index($current);

            // Handle backspace
            if (e.key === 'Backspace') {
                if ($current.val() === '') {
                    // If current input is empty, go to previous input and clear it
                    if (currentIndex > 0) {
                        $inputs.eq(currentIndex - 1).focus().val('');
                    }
                } else {
                    // Clear current input
                    $current.val('');
                }
                e.preventDefault();
            }

            // Handle arrow keys
            if (e.key === 'ArrowLeft' && currentIndex > 0) {
                $inputs.eq(currentIndex - 1).focus();
                e.preventDefault();
            }

            if (e.key === 'ArrowRight' && currentIndex < maxLength - 1) {
                $inputs.eq(currentIndex + 1).focus();
                e.preventDefault();
            }
        });

        // Handle paste event
        $container.on('paste', function (e) {
            e.preventDefault();
            var pastedData = (e.originalEvent.clipboardData || window.clipboardData).getData('text');
            var digits = pastedData.replace(/\D/g, '').slice(0, maxLength);

            if (digits.length > 0) {
                $inputs.each(function (index) {
                    if (index < digits.length) {
                        $(this).val(digits[index]);
                    }
                });

                // Focus the next empty input or the last input
                var nextEmptyIndex = digits.length;
                if (nextEmptyIndex < maxLength) {
                    $inputs.eq(nextEmptyIndex).focus();
                } else {
                    $inputs.eq(maxLength - 1).focus();
                }
            }
        });

        // Handle focus events
        $inputs.on('focus', function () {
            $(this).select();
        });

        // Add method to get OTP value
        $container.getOTPValue = function () {
            var otp = '';
            $inputs.each(function () {
                otp += $(this).val() || '';
            });
            return otp;
        };

        // Add method to set OTP value
        $container.setOTPValue = function (value) {
            var digits = value.toString().replace(/\D/g, '').slice(0, maxLength);
            $inputs.each(function (index) {
                $(this).val(index < digits.length ? digits[index] : '');
            });
        };

        // Add method to clear OTP
        $container.clearOTP = function () {
            $inputs.val('');
            $inputs.first().focus();
        };

        // Add method to check if OTP is complete
        $container.isOTPComplete = function () {
            var otp = this.getOTPValue();
            return otp.length === maxLength;
        };
    }

    // Initialize OTP inputs when DOM is ready
    $(function () {
        $('[data-otp-container]').each(function () {
            initOTPInput($(this));
        });
    });

    // Make OTP functions globally available
    window.OTPHandler = {
        init: function (selector) {
            $(selector).each(function () {
                initOTPInput($(this));
            });
        }
    };
})(jQuery);


// ================= REUSABLE VALIDATION SYSTEM =================
/*
 * VALIDATION SYSTEM USAGE:
 * 
 * 1. Add data-validate-form to your form element
 * 2. Add data-validate="rule1 rule2" to input fields
 * 
 * Available validation rules:
 * - required: Field must not be empty
 * - email: Valid email format
 * - phone: Valid phone number format
 * - password: Strong password (8+ chars, uppercase, lowercase, number, special char)
 * - confirmPassword: Must match another password field
 * - name: Valid name format (letters and spaces only)
 * - minLength: Minimum length (use data-min-length="3")
 * - maxLength: Maximum length (use data-max-length="50")
 * - otp: Complete OTP validation for data-otp-container
 * 
 * Examples:
 * <input data-validate="required email">
 * <input data-validate="required password">
 * <input data-validate="required name" data-min-length="2" data-max-length="50">
 * 
 * For OTP validation, use data-validate="otp" on any input within data-otp-container
 */
(function ($) {
    'use strict';

    // Helper function to get field display name
    function getFieldDisplayName(field) {
        // Try to get label text first
        const label = field.parentNode.querySelector('.form-label');
        if (label) {
            return label.textContent.trim();
        }

        // Try to get placeholder
        if (field.placeholder) {
            return field.placeholder;
        }

        // Try to get name attribute
        if (field.name) {
            return field.name.charAt(0).toUpperCase() + field.name.slice(1).replace(/([A-Z])/g, ' $1');
        }

        // Default fallback
        return 'Field';
    }

    // Validation rules and messages
    const VALIDATION_RULES = {
        required: {
            test: (value) => value.trim().length > 0,
            message: (field) => {
                const fieldName = getFieldDisplayName(field);
                return `${fieldName} is required`;
            }
        },
        email: {
            test: (value) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value),
            message: (field) => {
                const fieldName = getFieldDisplayName(field);
                return `Please enter a valid ${fieldName}`;
            }
        },
        phone: {
            test: (value) => /^[\+]?[1-9][\d]{0,15}$/.test(value.replace(/\s/g, '')),
            message: (field) => {
                const fieldName = getFieldDisplayName(field);
                return `Please enter a valid ${fieldName}`;
            }
        },
        password: {
            test: (value) => /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/.test(value),
            message: (field) => {
                const fieldName = getFieldDisplayName(field);
                return `${fieldName} must be at least 8 characters with uppercase, lowercase, number and special character`;
            }
        },
        confirmPassword: {
            test: (value, field, form) => {
                const targetSelector = field.getAttribute('data-confirm-field');
                let passwordField = null;

                if (targetSelector) {
                    passwordField = form.querySelector(targetSelector);
                } else {
                    passwordField = form.querySelector('input[type="password"]:not([data-validate*="confirmPassword"])');
                }
                return passwordField && value === passwordField.value;
            },
            message: (field) => {
                const fieldName = getFieldDisplayName(field);
                return `${fieldName} does not match`;
            }
        },
        minLength: {
            test: (value, field) => {
                const minLength = parseInt(field.getAttribute('data-min-length')) || 2;
                return value.length >= minLength;
            },
            message: (field) => {
                const fieldName = getFieldDisplayName(field);
                const minLength = parseInt(field.getAttribute('data-min-length')) || 2;
                return `${fieldName} must be at least ${minLength} characters`;
            }
        },
        maxLength: {
            test: (value, field) => {
                const maxLength = parseInt(field.getAttribute('data-max-length')) || 50;
                return value.length <= maxLength;
            },
            message: (field) => {
                const fieldName = getFieldDisplayName(field);
                const maxLength = parseInt(field.getAttribute('data-max-length')) || 50;
                return `${fieldName} must be no more than ${maxLength} characters`;
            }
        },
        otp: {
            test: (value, field) => {
                const otpContainer = field.closest('[data-otp-container]');
                if (!otpContainer) return false;

                const otpLength = parseInt(otpContainer.getAttribute('data-otp-length')) || 6;
                const inputs = otpContainer.querySelectorAll('[data-otp-input]');
                let fullOTP = '';

                inputs.forEach(input => {
                    fullOTP += input.value || '';
                });

                return fullOTP.length === otpLength && /^\d+$/.test(fullOTP);
            },
            message: (field) => {
                const fieldName = getFieldDisplayName(field);
                const otpContainer = field.closest('[data-otp-container]');
                const otpLength = parseInt(otpContainer.getAttribute('data-otp-length')) || 6;
                return `Please enter a complete ${otpLength}-digit ${fieldName}`;
            }
        },
        name: {
            test: (value) => /^[a-zA-Z\s]{2,50}$/.test(value),
            message: (field) => {
                const fieldName = getFieldDisplayName(field);
                return `Please enter a valid ${fieldName} (letters and spaces only)`;
            }
        }
    };

    // Validation class
    class FormValidator {
        constructor(form) {
            this.form = form;
            this.fields = form.querySelectorAll('[data-validate]');
            this.errors = new Map();
            this.init();
        }

        init() {
            // Add error display elements
            this.fields.forEach(field => {
                this.addErrorDisplay(field);
            });

            // Bind events
            this.bindEvents();
        }

        addErrorDisplay(field) {
            // For OTP fields, don't add error display to individual inputs
            if (field.hasAttribute('data-otp-input')) {
                const container = field.closest('[data-otp-container]');
                if (container && !container.parentNode.querySelector('.form-error')) {
                    // Create error display element for OTP container
                    const errorDisplay = document.createElement('div');
                    errorDisplay.className = 'form-error';

                    // Insert after the container
                    container.parentNode.insertBefore(errorDisplay, container.nextSibling);
                }
                return;
            }

            // Check if error display already exists for regular fields
            if (field.parentNode.querySelector('.form-error')) {
                return;
            }

            // Create error display element for regular fields
            const errorDisplay = document.createElement('div');
            errorDisplay.className = 'form-error';

            // Insert after the field
            field.parentNode.appendChild(errorDisplay);
        }

        bindEvents() {
            // Real-time validation on input
            this.fields.forEach(field => {
                field.addEventListener('blur', () => this.validateField(field));
                field.addEventListener('input', () => {
                    if (this.errors.has(field)) {
                        this.validateField(field);
                    }
                });
            });

            // Special handling for OTP inputs
            this.form.querySelectorAll('[data-otp-container]').forEach(container => {
                const inputs = container.querySelectorAll('[data-otp-input]');
                inputs.forEach(input => {
                    input.addEventListener('input', () => {
                        // Validate all OTP fields when any input changes
                        inputs.forEach(otpInput => {
                            if (this.errors.has(otpInput)) {
                                this.validateField(otpInput);
                            }
                        });
                    });
                });
            });

            // Form submission
            this.form.addEventListener('submit', (e) => {
                if (!this.validateForm()) {
                    e.preventDefault();
                }
            });
        }

        validateField(field) {
            const value = field.value;
            const validations = field.getAttribute('data-validate').split(' ').filter(v => v.trim());
            let isValid = true;
            let errorMessage = '';

            // Clear previous error state
            this.clearFieldError(field);

            // Run each validation rule
            for (const validation of validations) {
                const rule = VALIDATION_RULES[validation];
                if (!rule) continue;

                const testResult = rule.test(value, field, this.form);
                if (!testResult) {
                    isValid = false;
                    errorMessage = typeof rule.message === 'function' ? rule.message(field) : rule.message;
                    break;
                }
            }

            // Handle result
            if (!isValid) {
                this.showFieldError(field, errorMessage);
                this.errors.set(field, errorMessage);
            } else {
                this.errors.delete(field);
            }

            return isValid;
        }

        validateForm() {
            let isValid = true;

            this.fields.forEach(field => {
                if (!this.validateField(field)) {
                    isValid = false;
                }
            });

            return isValid;
        }

        showFieldError(field, message) {
            // Add error class to field
            field.classList.add('is-error');

            // For OTP fields, add error class to container and show message below container
            if (field.hasAttribute('data-otp-input')) {
                const container = field.closest('[data-otp-container]');
                if (container) {
                    container.classList.add('is-error');

                    // Show error message below the OTP container, not inside it
                    let errorDisplay = container.parentNode.querySelector('.form-error');
                    if (!errorDisplay) {
                        errorDisplay = document.createElement('div');
                        errorDisplay.className = 'form-error';
                        // Insert after the container, not inside it
                        container.parentNode.insertBefore(errorDisplay, container.nextSibling);
                    }
                    errorDisplay.textContent = message;
                    errorDisplay.classList.add('show');
                }
            } else {
                // Show error message for regular fields
                const errorDisplay = field.parentNode.querySelector('.form-error');
                if (errorDisplay) {
                    errorDisplay.textContent = message;
                    errorDisplay.classList.add('show');
                }
            }
        }

        clearFieldError(field) {
            // Remove error class from field
            field.classList.remove('is-error');

            // For OTP fields, remove error class from container
            if (field.hasAttribute('data-otp-input')) {
                const container = field.closest('[data-otp-container]');
                if (container) {
                    container.classList.remove('is-error');

                    // Hide error message below the OTP container
                    const errorDisplay = container.parentNode.querySelector('.form-error');
                    if (errorDisplay) {
                        errorDisplay.classList.remove('show');
                    }
                }
            } else {
                // Hide error message for regular fields
                const errorDisplay = field.parentNode.querySelector('.form-error');
                if (errorDisplay) {
                    errorDisplay.classList.remove('show');
                }
            }
        }

        clearAllErrors() {
            this.fields.forEach(field => {
                this.clearFieldError(field);
            });
            this.errors.clear();
        }

        // Public methods
        isValid() {
            return this.errors.size === 0;
        }

        getErrors() {
            return Array.from(this.errors.values());
        }
    }

    // Initialize validation on all forms with data-validate-form
    $(function () {
        $('[data-validate-form]').each(function () {
            const validator = new FormValidator(this);
            // Store reference to validator on form for easy access
            this._validator = validator;
        });
    });

    // Make validator globally available
    window.FormValidator = FormValidator;

    // Global validation helper functions
    window.ValidationHelper = {
        // Initialize validation on a form
        initForm: function (formSelector) {
            const form = document.querySelector(formSelector);
            if (form) {
                return new FormValidator(form);
            }
            return null;
        },

        // Validate a specific field
        validateField: function (fieldSelector) {
            const field = document.querySelector(fieldSelector);
            if (field && field.form) {
                const validator = field.form._validator;
                if (validator) {
                    return validator.validateField(field);
                }
            }
            return false;
        },

        // Clear all errors on a form
        clearErrors: function (formSelector) {
            const form = document.querySelector(formSelector);
            if (form && form._validator) {
                form._validator.clearAllErrors();
            }
        }
    };

})(jQuery);


// ================= CART QTY CONTROL =================
(function ($) {
    'use strict';

    class CartQuantity {
        constructor(container, options = {}) {
            this.$container = $(container);
            this.$decrease = this.$container.find('[data-cart-decrease]');
            this.$increase = this.$container.find('[data-cart-increase]');
            this.$value = this.$container.find('[data-cart-value]');
            this.min = options.min || 0;
            this.max = options.max || Infinity;
            this.step = options.step || 1;

            // Initialize value
            this.value = parseInt(this.$value.text(), 10) || 0;

            this.bindEvents();
        }

        bindEvents() {
            this.$decrease.on('click', () => this.decrement());
            this.$increase.on('click', () => this.increment());
        }

        updateDisplay() {
            this.$value.text(this.value);
            this.$container.trigger('cart:change', [this.value]); 
        }

        increment() {
            if (this.value < this.max) {
                this.value += this.step;
                this.updateDisplay();
            }
        }

        decrement() {
            if (this.value > this.min) {
                this.value -= this.step;
                this.updateDisplay();
            }
        }

        setValue(val) {
            this.value = Math.min(Math.max(val, this.min), this.max);
            this.updateDisplay();
        }

        getValue() {
            return this.value;
        }
    }

    // jQuery plugin wrapper
    $.fn.cartQuantity = function (options) {
        return this.each(function () {
            if (!this._cartQuantity) {
                this._cartQuantity = new CartQuantity(this, options);
            }
        });
    };

    // Helper to get instance
    $.fn.getCartQuantity = function () {
        return this[0]?._cartQuantity || null;
    };

    // Auto-init
    $(function () {
        $('[data-cart]').cartQuantity();
    });

})(jQuery);

