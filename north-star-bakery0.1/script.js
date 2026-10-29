(function () {
    const categoryControls = Array.from(document.querySelectorAll("[data-category-filter]"));
    const categorySections = Array.from(document.querySelectorAll("[data-product-category]"));
    const categoryStorageKey = "north-star-bakery-product-category";

    function setProductCategory(category, saveSelection) {
        const knownCategory = categoryControls.some(function (control) {
            return control.dataset.categoryFilter === category;
        });
        const selectedCategory = knownCategory ? category : "all";

        categorySections.forEach(function (section) {
            section.hidden = selectedCategory !== "all" &&
                section.dataset.productCategory !== selectedCategory;
        });

        categoryControls.forEach(function (control) {
            const isSelected = control.dataset.categoryFilter === selectedCategory;
            control.setAttribute("aria-pressed", String(isSelected));
        });

        if (saveSelection) {
            try {
                localStorage.setItem(categoryStorageKey, selectedCategory);
            } catch (error) {
                // The filter still works when browser storage is unavailable.
            }
        }
    }

    if (categoryControls.length && categorySections.length) {
        let savedCategory = "all";
        try {
            savedCategory = localStorage.getItem(categoryStorageKey) || "all";
        } catch (error) {
            // Use the default category when browser storage is unavailable.
        }

        setProductCategory(savedCategory, false);
        categoryControls.forEach(function (control) {
            control.addEventListener("click", function () {
                setProductCategory(control.dataset.categoryFilter, true);
            });
        });
    }

    const form = document.querySelector("form");
    if (!form) {
        return;
    }

    const formStorageKey = "north-star-bakery-contact-form";

    function saveForm() {
        const formData = {};
        Array.from(form.elements).forEach(function (element) {
            if (element.name) {
                formData[element.name] = element.value;
            }
        });

        try {
            localStorage.setItem(formStorageKey, JSON.stringify(formData));
        } catch (error) {
            // The form still works when browser storage is unavailable.
        }
    }

    try {
        const savedForm = JSON.parse(localStorage.getItem(formStorageKey) || "{}");
        Object.keys(savedForm).forEach(function (name) {
            const element = form.elements.namedItem(name);
            if (element) {
                element.value = savedForm[name];
            }
        });
    } catch (error) {
        // Use an empty form if saved browser data is unavailable or invalid.
    }

    form.addEventListener("input", saveForm);
    form.addEventListener("change", saveForm);

    const fields = [
        {
            input: form.querySelector("#name"),
            error: form.querySelector("#name-error"),
            requiredMessage: "Please enter your name.",
            invalidMessage: "Please enter at least 2 characters.",
            isValid: function (input) {
                return input.value.trim().length >= 2;
            }
        },
        {
            input: form.querySelector("#email"),
            error: form.querySelector("#email-error"),
            requiredMessage: "Please enter your email address.",
            invalidMessage: "Please enter a valid email address.",
            isValid: function (input) {
                return input.validity.valid;
            }
        },
        {
            input: form.querySelector("#pickup-date"),
            error: form.querySelector("#pickup-date-error"),
            requiredMessage: "Please choose a pickup date.",
            invalidMessage: "Please choose a valid pickup date.",
            isValid: function (input) {
                return input.validity.valid;
            }
        },
        {
            input: form.querySelector("#request-type"),
            error: form.querySelector("#request-type-error"),
            requiredMessage: "Please choose a request type.",
            invalidMessage: "Please choose a request type.",
            isValid: function (input) {
                return input.value !== "";
            }
        },
        {
            input: form.querySelector("#item-details"),
            error: form.querySelector("#item-details-error"),
            requiredMessage: "Please add a few details about your request.",
            invalidMessage: "Please enter at least 5 characters.",
            isValid: function (input) {
                return input.value.trim().length >= 5;
            }
        }
    ];
    const status = form.querySelector(".form-status");

    function validateField(field) {
        let message = "";
        if (!field.input.value.trim()) {
            message = field.requiredMessage;
        } else if (!field.isValid(field.input)) {
            message = field.invalidMessage;
        }

        field.error.textContent = message;
        field.input.setAttribute("aria-invalid", String(Boolean(message)));
        return message === "";
    }

    fields.forEach(function (field) {
        ["input", "change"].forEach(function (eventName) {
            field.input.addEventListener(eventName, function () {
                if (form.dataset.attempted === "true") {
                    validateField(field);
                    status.textContent = "";
                }
            });
        });
    });

    form.addEventListener("submit", function (event) {
        event.preventDefault();
        form.dataset.attempted = "true";

        const invalidFields = fields.filter(function (field) {
            return !validateField(field);
        });

        if (invalidFields.length) {
            status.textContent = "Please correct the highlighted fields.";
            invalidFields[0].input.focus();
            return;
        }

        status.textContent = "Your details are valid. This demo cannot send requests yet; please call or visit us to confirm your order.";
    });

    form.addEventListener("reset", function () {
        form.dataset.attempted = "false";
        fields.forEach(function (field) {
            field.error.textContent = "";
            field.input.setAttribute("aria-invalid", "false");
        });
        status.textContent = "";
        try {
            localStorage.removeItem(formStorageKey);
        } catch (error) {
            // The form can still be reset when browser storage is unavailable.
        }
    });
})();