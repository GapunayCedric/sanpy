# SA Tourism – API Routes

Base path: `/api/v1`

## Auth (public)

| Method | Path | Description |
|--------|------|-------------|
| POST | `/auth/login` | Login (email, password). Returns JWT + user. |
| POST | `/auth/register` | Business registration (multipart: fields + permitFile, validIdFile). Status = pending. |
| POST | `/auth/forgot-password` | Request password reset (email). |
| POST | `/auth/reset-password` | Reset password (token, newPassword). |
| GET | `/auth/me` | Current user (Bearer token). |

## Business (Bearer, role: business)

| Method | Path | Description |
|--------|------|-------------|
| GET | `/business/dashboard` | Stats: guests this month/year, nationality pie, monthly bar, gender, avg stay, top transport. |
| GET | `/business/guest-records` | List guest records (optional query: month, year). |
| POST | `/business/guest-records` | Create guest record. Body may include either simple demographics (checkIn, checkOut, nationality, gender, age, transportationMode, purpose, numberOfGuests, isLocalTourist?, festivalRelated?) **or** a `guests` array containing objects with `nationality`, `gender` (male/female) and `ageRange` (e.g. "10-15"). Number of guests is derived from the length of the `guests` array. |
| GET | `/business/submissions` | List monthly submission status. |
| POST | `/business/submissions` | Submit & lock month (body: month, year). |
| GET | `/business/messages` | Inbox. |
| PATCH | `/business/messages/:id/read` | Mark message read. |

## Admin (Bearer, role: admin)

| Method | Path | Description |
|--------|------|-------------|
| GET | `/admin/dashboard` | System stats: active businesses, tourists month/year, pending reg, compliance rate, top nationalities, 12-month trend. |
| GET | `/admin/registrations` | List registrations (query: status?, search?). |
| GET | `/admin/registrations/:id` | Registration detail + document URLs. |
| POST | `/admin/registrations/:id/approve` | Approve (body: remarks?). |
| POST | `/admin/registrations/:id/reject` | Reject (body: remarks?). |
| GET | `/admin/reports` | Report data (query: month?, year?, nationality?, gender?, ageMin?, ageMax?, transportationMode?, businessId?). |
| GET | `/admin/reports/filters` | Meta: nationalities, businesses (for filter dropdowns). |
| GET | `/admin/businesses` | List businesses (id, email, business_name) for messaging. |
| POST | `/admin/messages` | Send message (body: receiverId, subject, message). |

## Static

- `GET /uploads/*` – Serve uploaded permit/ID files.
