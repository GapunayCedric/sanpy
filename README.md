# SA – Mobile-based App Demographic Study and Data Gathering for Tourists in San Pablo City, Laguna

A government system for collecting and analyzing tourist demographic data from accommodation establishments in San Pablo City, Laguna.

## Tech Stack

- **Frontend:** React 18, TypeScript, Vite, TailwindCSS, React Router, Recharts, React Hook Form, Zod, Axios
- **Backend:** Node.js, Express, MySQL
- **Auth:** JWT, bcrypt, Role-based Access Control (business | admin)

## Project Structure

```
sanpy/
├── backend/          # Express REST API
├── frontend/         # React + Vite app
├── database/         # SQL schema & migrations
└── docs/             # Architecture, deployment
```

## Quick Start

### 1. Database
```bash
mysql -u root -p < database/schema.sql
```
Create the first admin user (replace the bcrypt hash with one generated for your password):
```sql
INSERT INTO users (email, password_hash, role, status) VALUES
('admin@tourism.sanpablo.gov.ph', '$2b$10$...', 'admin', 'approved');
```
Use a bcrypt generator or a small script to hash the admin password.

### 2. Backend
```bash
cd backend
npm install
cp .env.example .env   # Configure DB and JWT_SECRET
npm run dev
```

### 3. Frontend
```bash
cd frontend
npm install
npm run dev
```

## User Roles

- **Accommodation Business** – Register (pending approval), enter guest data, submit monthly, view dashboard
- **Tourism Office Admin** – Approve registrations, view reports, send messages, manage compliance

## Security

- JWT authentication, bcrypt password hashing
- Pending approval for new business accounts
- File upload validation, Zod input validation
- Rate limiting, CORS, protected routes
