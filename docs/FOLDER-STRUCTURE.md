# SA Tourism – Folder Structure

## Root

```
sanpy/
├── backend/           # Express REST API
├── frontend/          # React + Vite SPA
├── database/          # SQL schema
├── docs/              # Documentation
└── README.md
```

## Backend

```
backend/
├── src/
│   ├── config/        # Environment & app config
│   ├── db/            # MySQL pool & query helper
│   ├── middleware/    # auth, validate, upload
│   ├── validations/   # Zod schemas (auth, guest, report, message, submission)
│   ├── controllers/   # auth, guest, submission, admin, analytics, reports, messages
│   ├── routes/        # authRoutes, businessRoutes, adminRoutes
│   └── index.ts       # App entry, CORS, rate limit, routes
├── uploads/           # Uploaded permits & IDs (created at runtime)
├── package.json
├── tsconfig.json
└── .env.example
```

## Frontend

```
frontend/
├── src/
│   ├── api/           # Axios client (base URL, JWT interceptor)
│   ├── contexts/      # AuthContext
│   ├── layouts/       # BusinessLayout, AdminLayout (sidebar + bottom nav)
│   ├── pages/         # Login, Register, ForgotPassword
│   │   ├── business/  # Dashboard, GuestEntry, Submissions, Inbox
│   │   └── admin/     # Dashboard, RegistrationApproval, Reports, Messages
│   ├── App.tsx        # Routes, ProtectedRoute
│   ├── main.tsx
│   └── index.css      # Tailwind
├── public/
├── index.html
├── vite.config.ts
├── tailwind.config.js
├── postcss.config.js
├── tsconfig.json
└── package.json
```

## Database

```
database/
└── schema.sql        # users, businesses, guest_records, monthly_submissions, messages, password_reset_tokens
```
