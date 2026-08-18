import confetti from 'canvas-confetti';
import { getSupabaseClient } from './supabase.js';

// Table Name in Supabase
const TABLE_NAME = 'Registrations';
let isAdminUnlocked = false;
let currentRegistrations = [];

// SHA-256 Hash of admin password '07@ISTEBoss' for zero plain-text client exposure
const ADMIN_PASS_HASH = 'f916a6d7d3a31aa060a0989d2788c38c8ecfb3bc1b31e55e15aa2dc458d98627';

// DOM Elements - Navigation & Views
const tabForm = document.getElementById('tabForm');
const tabAdmin = document.getElementById('tabAdmin');
const viewRegistration = document.getElementById('viewRegistration');
const viewAdmin = document.getElementById('viewAdmin');

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

// DOM Elements - Admin Panel
const adminPinGate = document.getElementById('adminPinGate');
const adminMainContent = document.getElementById('adminMainContent');
const adminPinForm = document.getElementById('adminPinForm');
const adminPinInput = document.getElementById('adminPinInput');
const pinError = document.getElementById('pinError');
const lockAdminBtn = document.getElementById('lockAdminBtn');

// Admin Table & Stats
const statTotalCount = document.getElementById('statTotalCount');
const statTodayCount = document.getElementById('statTodayCount');
const statLastUpdated = document.getElementById('statLastUpdated');
const adminSearchInput = document.getElementById('adminSearchInput');
const adminTableBody = document.getElementById('adminTableBody');
const tableLoadingState = document.getElementById('tableLoadingState');
const tableEmptyState = document.getElementById('tableEmptyState');
const recordCountLabel = document.getElementById('recordCountLabel');
const btnRefreshData = document.getElementById('btnRefreshData');
const btnExportCsv = document.getElementById('btnExportCsv');

// ================= INITIALIZATION & TAB SWITCHING =================
function init() {
  setupEventListeners();
  validateRealtime();
}

function setupEventListeners() {
  // Tab Switching
  tabForm.addEventListener('click', () => switchTab('form'));
  tabAdmin.addEventListener('click', () => switchTab('admin'));

  // Registration Form Submit
  regForm.addEventListener('submit', handleRegistrationSubmit);
  registerAnotherBtn.addEventListener('click', resetFormView);

  // Admin Pin Submit
  adminPinForm.addEventListener('submit', handleAdminPinSubmit);
  lockAdminBtn.addEventListener('click', lockAdminPanel);
  btnRefreshData.addEventListener('click', fetchRegistrations);
  btnExportCsv.addEventListener('click', exportToCSV);

  // Admin Table Search
  adminSearchInput.addEventListener('input', renderAdminTable);
}

function switchTab(tab) {
  if (tab === 'form') {
    tabForm.classList.add('active');
    tabAdmin.classList.remove('active');
    viewRegistration.classList.add('active');
    viewAdmin.classList.remove('active');
  } else {
    tabAdmin.classList.add('active');
    tabForm.classList.remove('active');
    viewAdmin.classList.add('active');
    viewRegistration.classList.remove('active');

    if (isAdminUnlocked) {
      fetchRegistrations();
    } else {
      adminPinGate.style.display = 'block';
      adminMainContent.style.display = 'none';
      adminPinInput.focus();
    }
  }
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

  const payload = {
    id: Date.now(),
    'Name': nameVal,
    'Admission Number': admissionVal,
    'E-Mail ID': emailVal,
    'Phone Number': phoneVal
  };

  try {
    const supabase = getSupabaseClient();
    
    // Primary attempt: Insert with unique timestamp ID
    let { data, error } = await supabase
      .from(TABLE_NAME)
      .insert([payload]);

    // Fallback 1: If database rejects explicit id, insert without explicit id
    if (error && error.message && (error.message.includes('id') || error.message.includes('pkey'))) {
      const payloadWithoutId = {
        'Name': nameVal,
        'Admission Number': admissionVal,
        'E-Mail ID': emailVal,
        'Phone Number': phoneVal
      };
      const retry = await supabase.from(TABLE_NAME).insert([payloadWithoutId]);
      error = retry.error;
    }

    // Fallback 2: Retry with lowercase table name 'registrations' if needed
    if (error && error.message && error.message.includes('does not exist')) {
      const fallback = await supabase
        .from('registrations')
        .insert([payload]);
      error = fallback.error;
    }

    if (error) throw error;

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

// Utility to Hash Passwords with Web Crypto API
async function sha256Hash(str) {
  const buf = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(str));
  return Array.from(new Uint8Array(buf)).map(b => b.toString(16).padStart(2, '0')).join('');
}

// ================= ADMIN PANEL AUTHORIZATION & TABLE =================
async function handleAdminPinSubmit(e) {
  e.preventDefault();
  const inputPass = adminPinInput.value.trim();
  const hashedInput = await sha256Hash(inputPass);

  if (hashedInput === ADMIN_PASS_HASH) {
    isAdminUnlocked = true;
    pinError.style.display = 'none';
    adminPinGate.style.display = 'none';
    adminMainContent.style.display = 'block';
    adminPinInput.value = '';
    fetchRegistrations();
  } else {
    pinError.style.display = 'block';
    adminPinInput.classList.add('invalid');
  }
}

function lockAdminPanel() {
  isAdminUnlocked = false;
  adminMainContent.style.display = 'none';
  adminPinGate.style.display = 'block';
}

async function fetchRegistrations() {
  if (!isAdminUnlocked) return;

  tableLoadingState.style.display = 'flex';
  tableEmptyState.style.display = 'none';
  adminTableBody.innerHTML = '';

  try {
    const supabase = getSupabaseClient();
    let response = await supabase
      .from(TABLE_NAME)
      .select('*')
      .order('created_at', { ascending: false });

    // Fallback if lowercase table is used
    if (response.error && response.error.message && response.error.message.includes('does not exist')) {
      response = await supabase
        .from('registrations')
        .select('*')
        .order('created_at', { ascending: false });
    }

    if (response.error) throw response.error;

    currentRegistrations = response.data || [];
    updateMetrics(currentRegistrations);
    renderAdminTable();
  } catch (err) {
    console.error('Fetch Registrations Error:', err);
    tableLoadingState.style.display = 'none';
    adminTableBody.innerHTML = `<tr><td colspan="7" style="text-align:center; color: var(--error); padding: 24px;">Failed to load data: ${err.message}</td></tr>`;
  }
}

function updateMetrics(data) {
  statTotalCount.innerText = data.length;

  const todayStr = new Date().toISOString().split('T')[0];
  const todayCount = data.filter(item => {
    if (!item.created_at) return false;
    return new Date(item.created_at).toISOString().split('T')[0] === todayStr;
  }).length;

  statTodayCount.innerText = todayCount;
  statLastUpdated.innerText = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
}

function renderAdminTable() {
  tableLoadingState.style.display = 'none';

  const query = adminSearchInput.value.toLowerCase().trim();
  const filtered = currentRegistrations.filter(item => {
    const name = (item.Name || item.name || '').toLowerCase();
    const admission = (item['Admission Number'] || item.admission_number || '').toLowerCase();
    const email = (item['E-Mail ID'] || item.email || '').toLowerCase();
    const phone = (item['Phone Number'] || item.phone_number || '').toLowerCase();
    return name.includes(query) || admission.includes(query) || email.includes(query) || phone.includes(query);
  });

  if (filtered.length === 0) {
    adminTableBody.innerHTML = '';
    tableEmptyState.style.display = 'flex';
    recordCountLabel.innerText = 'Showing 0 entries';
    return;
  }

  tableEmptyState.style.display = 'none';
  recordCountLabel.innerText = `Showing ${filtered.length} of ${currentRegistrations.length} entries`;

  adminTableBody.innerHTML = filtered.map((row, index) => {
    const name = row.Name || row.name || '-';
    const admission = row['Admission Number'] || row.admission_number || '-';
    const email = row['E-Mail ID'] || row.email || '-';
    const phone = row['Phone Number'] || row.phone_number || '-';
    const dateStr = row.created_at ? new Date(row.created_at).toLocaleString([], { dateStyle: 'short', timeStyle: 'short' }) : '-';
    const rowId = row.id;

    return `
      <tr>
        <td><strong>${index + 1}</strong></td>
        <td><strong>${escapeHtml(name)}</strong></td>
        <td><span class="badge-admission">${escapeHtml(admission)}</span></td>
        <td>${escapeHtml(email)}</td>
        <td>${escapeHtml(phone)}</td>
        <td>${dateStr}</td>
        <td class="text-right">
          <button class="btn-delete-row" onclick="window.deleteRecord('${rowId}')">Delete</button>
        </td>
      </tr>
    `;
  }).join('');
}

// Global Delete Function for Inline Button
window.deleteRecord = async function(id) {
  if (!confirm('Are you sure you want to delete this registration record?')) return;

  try {
    const supabase = getSupabaseClient();
    let { error } = await supabase.from(TABLE_NAME).delete().eq('id', id);
    if (error && error.message && error.message.includes('does not exist')) {
      const fallback = await supabase.from('registrations').delete().eq('id', id);
      error = fallback.error;
    }
    if (error) throw error;
    fetchRegistrations();
  } catch (err) {
    alert('Failed to delete record: ' + err.message);
  }
};

// ================= CSV EXPORT =================
function exportToCSV() {
  if (currentRegistrations.length === 0) {
    alert('No registration data available to export.');
    return;
  }

  const headers = ['ID', 'Full Name', 'Admission Number', 'E-Mail ID', 'Phone Number', 'Registered At'];
  const rows = currentRegistrations.map(r => [
    r.id || '',
    `"${(r.Name || r.name || '').replace(/"/g, '""')}"`,
    `"${(r['Admission Number'] || r.admission_number || '').replace(/"/g, '""')}"`,
    `"${(r['E-Mail ID'] || r.email || '').replace(/"/g, '""')}"`,
    `"${(r['Phone Number'] || r.phone_number || '').replace(/"/g, '""')}"`,
    `"${r.created_at || ''}"`
  ]);

  const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
  const encodedUri = encodeURI(csvContent);
  const link = document.createElement('a');
  link.setAttribute('href', encodedUri);
  link.setAttribute('download', `ISTE_Registrations_${new Date().toISOString().split('T')[0]}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

function escapeHtml(str) {
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

// Initialize application
init();
