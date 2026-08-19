# Public Registration API Integration Guide

This guide explains how external developers can integrate their public-facing event registration forms with our Public Registration API.

## Overview

The Public Registration API allows external websites to submit event registrations directly.
- **Authentication**: None required.
- **CORS**: Completely open (`Access-Control-Allow-Origin: *`). You do not need to register your domain with us.

---

## Endpoint Details

- **URL**: `/api/register`
- **Base URL (Production)**: `https://registration-portal-backend.onrender.com` (or `http://localhost:5000` in development)
- **HTTP Method**: `POST`
- **Content-Type**: `application/json`

---

## Registration Fields

### Required Fields

| Field Name | Type | Description | Max Length |
|---|---|---|---|
| `name` | String | Full name of the participant | 100 chars |
| `email` | String | Valid email address | 255 chars |
| `eventName` | String | Name of the event being registered for | 100 chars |

### Optional Fields

| Field Name | Type | Description | Max Length |
|---|---|---|---|
| `mobileNumber` | String | Contact phone number | 20 chars |
| `rollNo` | String | University/College Roll or ID Number | 50 chars |

---

## Example Request Payloads

### Complete Payload (with optional fields)

```json
{
  "name": "Ayush Singla",
  "email": "ayush@example.com",
  "eventName": "Tech Hackathon 2026",
  "mobileNumber": "9876543210",
  "rollNo": "102303001"
}
```

### Minimal Payload (required fields only)

```json
{
  "name": "Ayush Singla",
  "email": "ayush@example.com",
  "eventName": "Tech Hackathon 2026"
}
```

---

## Response Formats

### 1. Success Response (`201 Created`)

```json
{
  "success": true,
  "message": "Registration successful"
}
```

### 2. Validation Error (`400 Bad Request`)

```json
{
  "success": false,
  "message": "Name is required and cannot be empty."
}
```

Other potential 400 error messages:
- `"A valid email address is required."`
- `"Event name is required and cannot be empty."`
- `"Input length exceeds maximum allowed limit."`

### 3. Rate Limited (`429 Too Many Requests`)

```json
{
  "success": false,
  "message": "Too many registration requests. Please try again later."
}
```

---

## Integration Code Examples

### JavaScript / Fetch API

```javascript
async function registerUser(registrationData) {
  const API_URL = 'http://localhost:5000/api/register';

  try {
    const response = await fetch(API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(registrationData),
    });

    const result = await response.json();

    if (response.ok && result.success) {
      alert('Registration successful!');
    } else {
      alert(`Registration failed: ${result.message}`);
    }
  } catch (error) {
    console.error('Network error during registration:', error);
    alert('Unable to connect to registration server.');
  }
}

// Example usage:
registerUser({
  name: 'Ayush Singla',
  email: 'ayush@example.com',
  eventName: 'Tech Hackathon 2026',
  mobileNumber: '9876543210',
  rollNo: '102303001'
});
```

### HTML Form Integration

```html
<form id="eventForm">
  <input type="text" id="name" placeholder="Full Name" required />
  <input type="email" id="email" placeholder="Email Address" required />
  <input type="text" id="eventName" value="Tech Hackathon 2026" readonly required />
  <input type="tel" id="mobileNumber" placeholder="Mobile Number (Optional)" />
  <input type="text" id="rollNo" placeholder="Roll Number (Optional)" />
  
  <button type="submit">Register Now</button>
</form>

<script>
  document.getElementById('eventForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const payload = {
      name: document.getElementById('name').value,
      email: document.getElementById('email').value,
      eventName: document.getElementById('eventName').value,
      mobileNumber: document.getElementById('mobileNumber').value,
      rollNo: document.getElementById('rollNo').value,
    };

    const res = await fetch('http://localhost:5000/api/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
    
    const data = await res.json();
    if (data.success) {
      alert('Registration Completed!');
      e.target.reset();
    } else {
      alert('Error: ' + data.message);
    }
  });
</script>
```