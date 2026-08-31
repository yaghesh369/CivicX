# CivicX Backend — API Documentation

Base URL: `http://localhost:5000` (or your deployed URL)
All protected routes require header: `Authorization: Bearer <access_token>`

---

## Auth

### Register
**Method:** POST
**URL:** `/api/auth/register`
**Authentication:** Not required
**Body:**
```json
{
  "name": "Yaghesh",
  "email": "yaghesh@gmail.com",
  "password": "password123",
  "phone": "9999999999",
  "language": "Marathi",
  "ward": "Ward 3"
}
```
**Query Parameters:** None
**Response (201):**
```json
{
  "user": { "id": "...", "name": "Yaghesh", "email": "yaghesh@gmail.com", "role": "CITIZEN", "ward": "Ward 3" },
  "access": "...",
  "refresh": "..."
}
```
**Possible Errors:**
- `400` — name, email or password missing / password under 8 characters
- `409` — email already registered

---

### Login
**Method:** POST
**URL:** `/api/auth/login`
**Authentication:** Not required
**Body:**
```json
{ "email": "yaghesh@gmail.com", "password": "password123" }
```
**Response (200):**
```json
{ "access": "...", "refresh": "..." }
```
**Possible Errors:**
- `400` — email or password missing
- `401` — invalid email or password
- `403` — account deactivated

---

### Refresh Token
**Method:** POST
**URL:** `/api/auth/refresh`
**Authentication:** Not required (refresh token sent in body)
**Body:**
```json
{ "refresh": "<refresh_token>" }
```
**Response (200):**
```json
{ "access": "..." }
```
**Possible Errors:**
- `400` — refresh token missing
- `401` — invalid or expired refresh token

---

### Logout
**Method:** POST
**URL:** `/api/auth/logout`
**Authentication:** Required
**Body:** None
**Response (200):**
```json
{ "message": "Logged out successfully. Discard your tokens client-side." }
```
**Possible Errors:**
- `401` — missing/invalid/expired access token

---

## Complaints

### Create Complaint
**Method:** POST
**URL:** `/api/complaints`
**Authentication:** Required (any role)
**Body:**
```json
{
  "title": "Large pothole on MG Road",
  "description": "Deep pothole causing traffic issues",
  "category": "POTHOLE",
  "latitude": 19.455,
  "longitude": 72.811,
  "address": "MG Road, near signal",
  "ward": "Ward 3"
}
```
**Response (201):** the created Complaint object, including `complaintNumber` (e.g. `CIV-000001`) and `status: "SUBMITTED"`.
**Possible Errors:**
- `400` — title/description/category missing, or latitude/longitude missing
- `401` — unauthorized

---

### List Complaints
**Method:** GET
**URL:** `/api/complaints`
**Authentication:** Required (Citizens see only their own; staff see all)
**Query Parameters:**
| Param | Example | Notes |
|---|---|---|
| category | `POTHOLE` | one of the 10 category enums |
| status | `IN_PROGRESS` | one of the 8 status enums |
| ward | `3` | |
| priority | `HIGH` | LOW/MEDIUM/HIGH/CRITICAL |
| department | `<departmentId>` | |
| search | `pothole` | matches complaint number, title, description, address |
| page | `1` | default 1 |
| page_size | `20` | default 20, max 100 |

**Response (200):**
```json
{
  "count": 42,
  "page": 1,
  "page_size": 20,
  "total_pages": 3,
  "results": [ { "...complaint fields..." } ]
}
```
**Possible Errors:**
- `401` — unauthorized

---

### My Complaints
**Method:** GET | **URL:** `/api/complaints/my` | **Authentication:** Required
**Response (200):** array of the logged-in user's complaints.
**Possible Errors:** `401` — unauthorized

---

### Nearby Complaints (duplicate detection)
**Method:** GET
**URL:** `/api/complaints/nearby`
**Authentication:** Required
**Query Parameters:** `latitude` (required), `longitude` (required), `category` (optional), `radius_km` (optional, default 1)
**Response (200):** array of nearby complaints sorted by distance, each with a `distanceKm` field.
**Possible Errors:**
- `400` — latitude/longitude missing

---

### Complaint Details
**Method:** GET | **URL:** `/api/complaints/:id` | **Authentication:** Required (owner or staff only)
**Response (200):** full complaint object with `images`, `assignment`, `aiAnalysis`, `department`, `user`.
**Possible Errors:**
- `403` — citizen accessing someone else's complaint
- `404` — complaint not found

---

### Update Complaint
**Method:** PATCH | **URL:** `/api/complaints/:id` | **Authentication:** Required (owner, Officer or Admin)
**Body (owner):** `{ "title": "...", "description": "..." }`
**Body (staff):** `{ "title", "description", "category", "priority", "departmentId" }` (any subset)
**Response (200):** updated complaint object.
**Possible Errors:**
- `403` — not the owner and not staff
- `404` — complaint not found

---

### Delete Complaint
**Method:** DELETE | **URL:** `/api/complaints/:id` | **Authentication:** Required (owner or Admin)
**Response:** `204 No Content`
**Possible Errors:**
- `403` — not the owner and not admin
- `404` — complaint not found

---

### Complaint Timeline
**Method:** GET | **URL:** `/api/complaints/:id/timeline` | **Authentication:** Required (owner or staff)
**Response (200):** array of status-history entries in chronological order, each with `oldStatus`, `newStatus`, `changedBy`, `comment`, `createdAt`.
**Possible Errors:**
- `403` — citizen accessing someone else's complaint
- `404` — complaint not found

---

### Update Status
**Method:** PATCH
**URL:** `/api/complaints/:id/status`
**Authentication:** Required (Worker, Officer or Admin)
**Body:**
```json
{ "status": "VERIFIED", "comment": "Confirmed on site" }
```
**Response (200):** updated complaint object.
**Possible Errors:**
- `400` — status missing, or the transition isn't allowed from the complaint's current status (response includes `allowedTransitions`)
- `404` — complaint not found

**Valid workflow:** `SUBMITTED → VERIFIED → ASSIGNED → IN_PROGRESS → RESOLVED → CITIZEN_VERIFIED`, plus `REJECTED` (from SUBMITTED/VERIFIED) and `REOPENED` (from RESOLVED/CITIZEN_VERIFIED).

---

### Assign Worker
**Method:** POST
**URL:** `/api/complaints/:id/assign`
**Authentication:** Required (Officer or Admin)
**Body:** `{ "workerId": "<workerId>" }`
**Response (200):** updated complaint (status becomes `ASSIGNED`).
**Possible Errors:**
- `400` — workerId missing, or worker is inactive
- `404` — complaint or worker not found

---

### Verify Complaint
**Method:** POST | **URL:** `/api/complaints/:id/verify` | **Authentication:** Required (Officer or Admin)
**Body:** `{ "comment": "optional" }`
**Response (200):** updated complaint (status becomes `VERIFIED`).
**Possible Errors:**
- `400` — complaint isn't in `SUBMITTED` or `REOPENED` status
- `404` — complaint not found

---

### Reopen Complaint
**Method:** POST | **URL:** `/api/complaints/:id/reopen` | **Authentication:** Required (complaint owner only)
**Body:** `{ "comment": "optional" }`
**Response (200):** updated complaint (status becomes `REOPENED`).
**Possible Errors:**
- `403` — not the complaint owner
- `400` — complaint isn't in `RESOLVED` or `CITIZEN_VERIFIED` status
- `404` — complaint not found

---

### Upload Complaint Image
**Method:** POST
**URL:** `/api/complaints/:id/images`
**Authentication:** Required
**Body:** `multipart/form-data` — field `image` (file), field `imageType` (`BEFORE` | `AFTER` | `EVIDENCE`)
**Response (201):** created ComplaintImage object with `imageUrl`.
**Possible Errors:**
- `400` — no file uploaded, invalid file type (only JPEG/PNG/WEBP), or file over 5MB
- `404` — complaint not found

---

### Save AI Analysis
**Method:** POST
**URL:** `/api/complaints/:id/ai-analysis`
**Authentication:** Required (called by Member 2's AI service)
**Body:**
```json
{ "category": "POTHOLE", "priority": "HIGH", "department": "ROAD", "confidence": 0.94, "reason": "Detected pothole pattern" }
```
**Response (201):** the stored AIAnalysis object.
**Possible Errors:**
- `404` — complaint not found

---

### Get AI Analysis
**Method:** GET | **URL:** `/api/complaints/:id/ai-analysis` | **Authentication:** Required
**Response (200):** the stored AIAnalysis object.
**Possible Errors:** `404` — no AI analysis found for this complaint

---

### Create Duplicate Group
**Method:** POST
**URL:** `/api/complaints/:id/duplicate-group`
**Authentication:** Required
**Body:** `{ "duplicateComplaintIds": ["<id1>", "<id2>"] }`
**Response (201):** the created DuplicateGroup object.
**Possible Errors:**
- `400` — duplicateComplaintIds missing or empty

---

### Submit Feedback
**Method:** POST
**URL:** `/api/complaints/:id/feedback`
**Authentication:** Required (complaint owner only)
**Body:** `{ "rating": 5, "comment": "Issue was resolved quickly." }`
**Response (201):** created Feedback object. Also auto-advances complaint status to `CITIZEN_VERIFIED`.
**Possible Errors:**
- `400` — rating outside 1–5, or complaint not yet resolved
- `403` — not the complaint owner
- `409` — feedback already submitted for this complaint

---

### Get Feedback
**Method:** GET | **URL:** `/api/complaints/:id/feedback` | **Authentication:** Required
**Response (200):** the Feedback object.
**Possible Errors:** `404` — no feedback found

---

## Departments & Workers

### List Departments
**Method:** GET | **URL:** `/api/departments` | **Authentication:** Required
**Response (200):** array of departments.

### Create Department
**Method:** POST | **URL:** `/api/departments` | **Authentication:** Required (Admin)
**Body:** `{ "name", "description", "contactEmail", "ward" }`
**Response (201):** created department.
**Possible Errors:** `400` — name missing

### Update Department
**Method:** PATCH | **URL:** `/api/departments/:id` | **Authentication:** Required (Admin)
**Body:** any subset of `{ "name", "description", "contactEmail", "ward", "isActive" }`
**Response (200):** updated department.

### List Department Workers
**Method:** GET | **URL:** `/api/departments/:id/workers` | **Authentication:** Required (Officer/Admin)
**Response (200):** array of workers in the department, each including user info.

### Create Worker
**Method:** POST | **URL:** `/api/workers` | **Authentication:** Required (Officer/Admin)
**Body:** `{ "name", "email", "password", "phone", "departmentId", "employeeId", "ward" }`
**Response (201):** created worker (also creates a WORKER-role user).
**Possible Errors:**
- `400` — required fields missing
- `409` — email already registered

### Update Worker
**Method:** PATCH | **URL:** `/api/workers/:id` | **Authentication:** Required (Officer/Admin)
**Body:** any subset of `{ "departmentId", "ward", "isActive" }`
**Response (200):** updated worker. Used for activation/deactivation and reassignment.

---

## Notifications

### List Notifications
**Method:** GET | **URL:** `/api/notifications`
**Authentication:** Required | **Query Parameters:** `is_read` (`true`/`false`, optional)
**Response (200):** array of the logged-in user's notifications.

### Mark One as Read
**Method:** PATCH | **URL:** `/api/notifications/:id/read` | **Authentication:** Required (own notifications only)
**Response (200):** updated notification.
**Possible Errors:** `403` — not your notification | `404` — not found

### Mark All as Read
**Method:** PATCH | **URL:** `/api/notifications/read-all` | **Authentication:** Required
**Response (200):** `{ "message": "All notifications marked as read." }`

---

## Admin

All routes below require **Officer or Admin** role.

| Method | URL | Response |
|---|---|---|
| GET | `/api/admin/dashboard` | Totals: complaints, submitted, in-progress, resolved, citizens, workers, departments |
| GET | `/api/admin/complaints` | Paginated full complaint list (filters: `status`, `category`, `ward`, `page`, `page_size`) |
| GET | `/api/admin/statistics` | Breakdown by category, status, priority + average feedback rating |
| GET | `/api/admin/categories` | Complaint count per category |
| GET | `/api/admin/wards` | Complaint count per ward |
| GET | `/api/admin/heatmap` | All complaint lat/lng + category/status/priority for map plotting |

**Possible Errors (all admin routes):** `403` — logged in but not Officer/Admin

---

## Global Error Format

All errors return:
```json
{ "error": "Human readable message" }
```
Common status codes used throughout: `400` (bad input), `401` (missing/invalid/expired token), `403` (role/ownership denied), `404` (not found), `409` (conflict, e.g. duplicate email or duplicate feedback), `500` (server error).
