# ISTE Orientation Registration & Admin Dashboard

An upgraded, high-performance web application built for **ISTE Thapar Chapter Orientation Registration** featuring a glassmorphic design system, real-time input validation, celebration confetti, a PIN-protected live Admin Dashboard with CSV exporting, and Supabase backend integration.

---

## 🚀 Quick Setup Instructions

### 1. Install Dependencies
Run the following command in your terminal inside the project folder:
```bash
npm install
```

### 2. Configure Supabase Backend
1. Go to your [Supabase Dashboard](https://supabase.com/dashboard) and open/create a project.
2. Open the **SQL Editor** tab on the left navigation bar.
3. Click **New Query** and copy-paste the contents of [`supabase/schema.sql`](./supabase/schema.sql).
4. Click **Run** to automatically create:
   - The `Registrations` table with required columns (`Name`, `Admission Number`, `E-Mail ID`, `Phone Number`, `created_at`).
   - Row Level Security (RLS) policies allowing public registration inserts and admin read/delete access.
5. In your Supabase Project Settings -> API, copy your **Project URL** and **anon public key**.
6. Update `.env` in the root directory:
   ```env
   VITE_SUPABASE_URL=https://your-project.supabase.co
   VITE_SUPABASE_ANON_KEY=your_anon_key_here
   ```
   *(Note: You can also update credentials directly in the live app UI by clicking the Settings gear icon in the top right header!)*

---

## 💻 Running the App Locally

Start the local development server:
```bash
npm run dev
```

Open the URL provided in the terminal (usually `http://localhost:5173`) in your web browser.

---

## 🔑 Admin Panel Access

- **Admin Tab**: Click the **Admin Panel** tab in the top navigation header.
- **Default PIN**: `admin123`
- **Admin Features**:
  - **Metrics Summary**: Real-time counter of total registrations and today's new entries.
  - **Live Search**: Search entries instantly by full name, admission number, email, or phone number.
  - **CSV Export**: One-click download of all registration data as a `.csv` file.
  - **Record Management**: Delete individual entries directly from the dashboard.

---

## 📁 File Structure

```text
├── index.html            # Main HTML layout (Registration Form, Success View, Admin Panel, Settings Modal)
├── src/
│   ├── style.css         # Glassmorphism Design System, CSS variables, dark mode aesthetics
│   ├── supabase.js       # Supabase JS client initializer with localStorage overrides
│   └── main.js           # Core JavaScript logic (Validations, Confetti, Admin search/export, RLS query engine)
├── supabase/
│   └── schema.sql        # Copy-paste SQL setup script for Supabase database
├── .env.example          # Environment variables template
├── .env                  # Local environment credentials
├── package.json          # Vite & Supabase dependencies
└── README.md             # Project documentation
```
