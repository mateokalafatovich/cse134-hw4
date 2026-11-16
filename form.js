const form = document.querySelector("form");
const fields = [...form.elements].filter(
    (el) => el.willValidate && el.matches("input, textarea")
);
const editedFields = new Set();

/* Error History */
const errorField = form.elements["form-errors"];
const form_errors = [];
let isSubmitting = false;

/* Validation and feedback */

// Custom messages for each type of error
const messages = {
    name: {
        valueMissing: "Name is required. Please enter your name.",
    },
    email: {
        valueMissing: "Email is required. Please enter your email.",
        typeMismatch: "Email must be of the form john.pork@email.com"
    },
    comments: {
        valueMissing: "Comments are required. Make sure to leave a comment!",
        tooShort: "Comments must be at least 10 characters long."
    }
}

const checks = ["valueMissing", "typeMismatch", "tooShort"];

// Set the fields custom validity message
function validate(field) {
    field.setCustomValidity("");
    const failedCheck = checks.find((check) => field.validity[check]);
    const message = messages[field.id]?.[failedCheck];
    if (message) field.setCustomValidity(message);
    return field.validity.valid;
}

function showError(field) {
    const errorElement = document.getElementById(`${field.id}-error`);
    if (field.validity.valid) {
        field.removeAttribute("aria-invalid");
        errorElement.textContent = "";
    } else {
        field.setAttribute("aria-invalid", "true");
        errorElement.textContent = field.validationMessage;
    }
}

function checkField(field) {
    const isValid = validate(field);
    showError(field);
    return isValid;
}

form.noValidate = true;

form.addEventListener("input", (event) => {
    const field = event.target;
    if (!fields.includes(field)) return;

    editedFields.add(field);
    if (field.getAttribute("aria-invalid") === "true") {
        checkField(field);
    }
});

form.addEventListener("focusout", (event) => {
    if(editedFields.has(event.target)) {
        checkField(event.target);
    }
});

form.addEventListener("submit", (event) => {
    const invalidFields = fields.filter((field) => !checkField(field));
    isSubmitting = true;
    form.checkValidity();
    isSubmitting = false;
    if (invalidFields.length > 0) {
        event.preventDefault();
        invalidFields[0].focus();
        return;
    }
    errorField.value = JSON.stringify(form_errors);
});

// Check for submissions with invalid fields
form.addEventListener("invalid", (event) => {
    if (!isSubmitting) return;

    const field = event.target;
    const error = checks.find((check) => field.validity[check]) ?? "customError";

    form_errors.push({
        field: field.name,
        message: messages[field.id]?.[error] ?? "Invalid value",
        time: new Date().toISOString(),
    });
}, true);

/* Character Count functionality */

// Character count for the comments field
const comments = document.getElementById("comments");
const commentsInfo = document.getElementById("comments-info");
const commentsCount = document.getElementById("comments-count");
const commentsStatus = document.getElementById("comments-status");
const WARNING_THRESHOLD = 100; // warn when 100 or fewer characters remain

function updateCharacterCount() {
    const limit = comments.maxLength;
    const remaining = limit - comments.value.length;
    const unit = remaining === 1 ? "character" : "characters";

    // updated count on every change
    commentsCount.textContent = `${remaining} ${unit} remaining.`;

    let state = "ok";
    let status = "";
    if (remaining <= 0) {
        state = "limit";
        status = `Limit reached: comments can be at most ${limit} characters.`;
    } else if (remaining <= WARNING_THRESHOLD) {
        state = "warning";
        status = `Warning: you are close to the ${limit}-character limit.`;
    }

    commentsInfo.dataset.state = state;
    if (commentsStatus.textContent !== status) {
        commentsStatus.textContent = status;
    }
}

comments.addEventListener("input", updateCharacterCount);

commentsInfo.hidden = false;
updateCharacterCount(); 