# Run SA Tourism with XAMPP

## 1. Start XAMPP

1. Open **XAMPP Control Panel**.
2. Start **Apache** (optional, only if you need it for something else).
3. Start **MySQL**.

## 2. Create database in XAMPP

**Option A – Using phpMyAdmin (easiest)**

1. Open browser: **http://localhost/phpmyadmin**
2. Click **Import**.
3. Click **Choose File** and select: `sanpy/database/schema.sql`
4. Click **Go**.  
   This creates the database `sanpy_tourism` and all tables.

**Option B – Using MySQL command line**

1. Open Command Prompt or PowerShell.
2. Go to project folder, then run:
   ```bash
   cd C:\Users\cedri\OneDrive\Desktop\sanpy
   "C:\xampp\mysql\bin\mysql.exe" -u root -p < database/schema.sql
   ```
   (If XAMPP is elsewhere, use that path. Leave password empty if you didn’t set one for `root`.)

## 3. Backend setup

1. Open a terminal in the project folder.
2. Run:
   ```bash
   cd backend
   npm install
   node scripts/seed-admin.js
   ```
   This creates the admin user: **admin@sanpy.local** / **Admin@123**.

3. If your XAMPP MySQL has a password for `root`, edit `backend/.env` and set:
   ```env
   DB_PASSWORD=your_mysql_password
   ```
   Then run `node scripts/seed-admin.js` again if the admin was not created.

## 4. Start backend and frontend

**Terminal 1 – Backend**

```bash
cd backend
npm run dev
```

Wait until you see: `SA Tourism API running on port 5000`.

**Terminal 2 – Frontend**

```bash
cd frontend
npm install
npm run dev
```

Wait until you see the local URL (e.g. `http://localhost:5173` or `http://localhost:3000`).

## 5. Open the app

1. In the browser go to the URL shown by the frontend (e.g. **http://localhost:5173**).
2. Click **Sign in** and use:
   - **Email:** `admin@sanpy.local`
   - **Password:** `Admin@123`
3. You will be in the **Admin** dashboard.

To test as a business: use **“Request registration”** on the login page, then approve that registration in the Admin **Registrations** page and log in with the business account.
