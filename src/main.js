import confetti from 'canvas-confetti';

// API Endpoint configuration
const API_URL = import.meta.env.VITE_API_URL || 'https://registration-portal-backend.onrender.com/api/register/register';
const EVENT_NAME = 'ISTE Orientation 2026';

// DOM Elements - Form & Success
const regForm = document.getElementById('regForm');
const formContent = document.getElementById('formContent');
const successContent = document.getElementById('successContent');
const submitBtn = document.getElementById('submitBtn');
const btnSpinner = document.getElementById('btnSpinner');
const btnText = document.getElementById('btnText');
const formErrorMessage = document.getElementById('formErrorMessage');
const registerAnotherBtn = document.getElementById('registerAnotherBtn');

// Form Inputs
const fields = {
  name: {
    el: document.getElementById('name'),
    group: document.getElementById('group-name'),
    validate: val => val.trim().length > 0
  },
  admission: {
    el: document.getElementById('admission'),
    group: document.getElementById('group-admission'),
    validate: val => val.trim().length > 0
  },
  email: {
    el: document.getElementById('email'),
    group: document.getElementById('group-email'),
    validate: val => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(val.trim())
  },
  phone: {
    el: document.getElementById('phone'),
    group: document.getElementById('group-phone'),
    validate: val => /^\d{10}$/.test(val.trim().replace(/[-\s]/g, ''))
  }
};

// ================= INITIALIZATION =================
function init() {
  setupEventListeners();
  validateRealtime();
}

function setupEventListeners() {
  // Registration Form Submit
  regForm.addEventListener('submit', handleRegistrationSubmit);
  registerAnotherBtn.addEventListener('click', resetFormView);
}

// ================= FORM VALIDATION & SUBMISSION =================
function validateField(fieldKey) {
  const field = fields[fieldKey];
  const isValid = field.validate(field.el.value);
  if (!isValid) {
    field.group.classList.add('invalid');
  } else {
    field.group.classList.remove('invalid');
  }
  return isValid;
}

function validateRealtime() {
  Object.keys(fields).forEach(key => {
    fields[key].el.addEventListener('input', () => validateField(key));
  });
}

async function handleRegistrationSubmit(e) {
  e.preventDefault();

  let isFormValid = true;
  Object.keys(fields).forEach(key => {
    if (!validateField(key)) isFormValid = false;
  });

  if (!isFormValid) return;

  submitBtn.disabled = true;
  btnSpinner.style.display = 'inline-block';
  btnText.innerText = 'Submitting...';
  formErrorMessage.style.display = 'none';

  const nameVal = fields.name.el.value.trim();
  const admissionVal = fields.admission.el.value.trim();
  const emailVal = fields.email.el.value.trim();
  const phoneVal = fields.phone.el.value.trim();

  // Payload required by Public Registration API (backend.md)
  const payload = {
    name: nameVal,
    email: emailVal,
    eventName: EVENT_NAME,
    mobileNumber: phoneVal,
    rollNo: admissionVal
  };

  try {
    const response = await fetch(API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    });

    const result = await response.json().catch(() => ({}));

    if (response.ok && result.success) {
      // Trigger Confetti Celebration
      triggerConfetti();

      // Populate Success Summary
      document.getElementById('sumName').innerText = nameVal;
      document.getElementById('sumAdmission').innerText = admissionVal;
      document.getElementById('sumEmail').innerText = emailVal;
      document.getElementById('sumPhone').innerText = phoneVal;

      // Transition to Success View
      formContent.style.display = 'none';
      successContent.style.display = 'block';
      regForm.reset();
    } else {
      const errorMsg = result.message || 'Registration failed. Please try again.';
      throw new Error(errorMsg);
    }
  } catch (err) {
    console.error('Registration Submission Error:', err);
    let errMsg = err.message || 'An error occurred during submission.';
    if (errMsg.includes('Registrations_pkey')) {
      errMsg = 'Database Sequence Sync Required: The primary key ID sequence in your Supabase table needs a reset. Please run the SQL reset script in your Supabase SQL Editor.';
    }
    formErrorMessage.innerText = errMsg;
    formErrorMessage.style.display = 'block';
  } finally {
    submitBtn.disabled = false;
    btnSpinner.style.display = 'none';
    btnText.innerText = 'Register Now';
  }
}

function resetFormView() {
  successContent.style.display = 'none';
  formContent.style.display = 'block';
  Object.keys(fields).forEach(key => fields[key].group.classList.remove('invalid'));
}

function triggerConfetti() {
  try {
    confetti({
      particleCount: 100,
      spread: 70,
      origin: { y: 0.6 }
    });
  } catch (e) {
    // Ignore if confetti library fails
  }
}

// Initialize application
init();

