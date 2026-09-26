# UniStay - Boarding Accommodation Management System (BAMS)

> A full-stack MERN monolithic web application designed to connect Sri Lankan university students with verified boarding accommodations, landlords, and wardens.

---

## 🌟 Key Highlights & Portfolio Engineering Features

1. **Clean MERN Monolith (MVC Architecture):**
   * Clear separation of concerns: Node.js/Express backend paired with React 19 SPA frontend (Vite), MongoDB database with Mongoose schemas.
2. **Security & Authentication Hardening:**
   * **Dual-Token Refresh Rotation (Silent Re-Auth):** Short-lived Access Token (15m) + long-lived Refresh Token (7d) stored in separate `httpOnly`, `Secure`, `SameSite` cookies with `/api/v1/auth/refresh` rotation.
   * **Role-Based Access Control (RBAC):** Strict role guards (`student` vs. `landlord` vs. `admin`) enforced at middleware and controller levels.
   * **Route-Level Zod Validation:** Strict payload and query parameter validation preventing malformed requests.
   * **Defense-in-Depth:** `helmet` security headers, strict CORS policy with credentials support, and `express-rate-limit` brute-force protection.
3. **Domain Modeling for University Boarding Hubs:**
   * **Shared Room Bed-Capacity Engine:** Tracks `totalBeds` and `availableBeds`.
   * **Concurrency-Safe Atomic Bed Decrement:** When a landlord accepts a booking, atomic `Listing.findOneAndUpdate({ _id, availableBeds: { $gt: 0 } }, { $inc: { availableBeds: -1 } })` is executed to eliminate race conditions.
   * **Cancellation Reversal:** If an accepted booking is cancelled or tenancy concluded, bed slots are incremented back up and availability restored automatically.
   * **University Proximity Presets:** Standardized catalogue of Sri Lankan university hubs (SLIIT, NSBM, Moratuwa, Colombo, Kelaniya, CINEC, Horizon) with travel distance badges.
   * **Verified Tenancy Reviews:** Only students with an accepted or completed stay can post a review, preventing fake reviews. Review post-save hooks recalculate listing aggregate ratings automatically.
4. **Tenancy Lifecycle Management:**
   * **Monthly Rent Ledger:** Landlords issue rent invoices; students upload bank transfer slips (JPEG, PNG, WebP, PDF); landlords inspect slips in a dedicated modal and verify payments.
   * **Maintenance Issue Desk:** 3-stage visual progress stepper (`Reported` &rarr; `In Progress` &rarr; `Resolved`) with landlord status notes.
   * **Dual Storage Pipeline:** Cloudinary media storage with automatic fallback to local disk storage (`/uploads/`) with automated directory creation.

---

## 🚀 Getting Started

### Prerequisites
* **Node.js**: v18+ (tested on Node v24)
* **MongoDB**: Local MongoDB instance (`mongodb://127.0.0.1:27017/boarding_db`) or MongoDB Atlas URI in `server/.env`.

### Installation

Clone the repository and install all dependencies:

```bash
# Install root, server, and client dependencies concurrently
npm run install-all
```

### Seed Realistic Demo Data

Populate the database with sample university listings, demo students, landlords, bookings, invoices, and maintenance tickets:

```bash
npm run seed
```

#### Demo Credentials:
| Role | Email | Password | Details |
| :--- | :--- | :--- | :--- |
| **Student** | `kamal@sliit.lk` | `password123` | SLIIT Undergraduate (Active Tenancy at Green Villa) |
| **Student** | `chamari@nsbm.lk` | `password123` | NSBM Undergraduate (Pending Booking) |
| **Landlord** | `nimal@landlord.lk` | `password123` | Malabe Property Landlord (Green Villa & Sunflower) |
| **Landlord** | `sunil@landlord.lk` | `password123` | Katubedda / Moratuwa Landlord |
| **Admin** | `admin@bams.lk` | `adminpassword123` | Platform Administrator |

---

### Running the Application

Start both the Node.js/Express backend server and Vite React frontend concurrently:

```bash
npm run dev
```

* **Frontend Client:** [http://localhost:5173](http://localhost:5173)
* **Backend API:** [http://localhost:5000](http://localhost:5000)
* **Health Check:** [http://localhost:5000/api/health](http://localhost:5000/api/health)

---

## 📁 Project Architecture & File Structure

```text
boarding-system/
├── client/                     # React 19 Frontend (Vite)
│   ├── src/
│   │   ├── components/         # Reusable UI (Navbar, Footer, ListingCard, FilterSidebar, Modal, Badges)
│   │   ├── context/            # AuthContext (global user state, login/logout, session init)
│   │   ├── hooks/              # useDebounce, custom utilities
│   │   ├── pages/              # Lazy-loaded views (Home, BrowseListings, ListingDetail, Dashboards)
│   │   ├── services/           # Axios API modules with silent refresh interceptors
│   │   ├── index.css           # Premium vanilla CSS design system & tokens
│   │   └── App.jsx             # Route definitions & Suspense boundaries
│   ├── index.html
│   └── vite.config.js          # API & static uploads proxy
│
├── server/                     # Node.js + Express Monolithic Backend
│   ├── src/
│   │   ├── config/             # DB connection, Cloudinary config, Zod env validator
│   │   ├── constants/          # Roles, statuses, university presets
│   │   ├── controllers/        # auth, listing, booking, invoice, maintenance, review
│   │   ├── middlewares/        # auth (protect, restrictTo), validate(Zod), upload, errorHandler
│   │   ├── models/             # User, Listing, Booking, Invoice, MaintenanceRequest, Review
│   │   ├── routes/             # authRoutes, listingRoutes, bookingRoutes, etc.
│   │   ├── utils/              # AppError, asyncHandler, Winston logger, token helpers
│   │   └── validations/        # Zod request payload schemas
│   ├── seeds/                  # Comprehensive Sri Lankan boarding seeder script
│   ├── server.js               # Express application entry & security pipeline
│   └── package.json
│
├── package.json                # Root orchestrator with concurrently scripts
└── README.md
```

---

## 🛡️ API Endpoints Summary

### Authentication (`/api/v1/auth`)
* `POST /register` - Register student or landlord
* `POST /login` - Log in with email/password (sets httpOnly cookies)
* `POST /refresh` - Silent refresh token rotation
* `POST /logout` - Invalidate session & clear cookies
* `GET /me` - Get current authenticated user profile
* `PATCH /profile` - Update user profile information

### Listings (`/api/v1/listings`)
* `GET /` - Public multi-criteria filtered search with pagination & keyword text search
* `GET /:id` - Get accommodation details & landlord profile
* `GET /my/properties` - Landlord's listed properties
* `POST /` - Create property listing (Landlord only, handles image uploads)
* `PATCH /:id` - Update listing details
* `DELETE /:id` - Remove listing

### Bookings (`/api/v1/bookings`)
* `POST /` - Request room booking with move-in date (Student only)
* `GET /my` - Student's requested bookings and active tenancies
* `GET /incoming` - Landlord's incoming booking inquiries
* `PATCH /:id/status` - Accept or reject request (atomic bed decrement & cancellation reversal)
* `PATCH /:id/cancel` - Cancel booking request

### Rent Ledger & Invoices (`/api/v1/invoices`)
* `POST /` - Issue monthly rent invoice (Landlord only)
* `GET /my` - Student's rent invoices & payment slips history
* `GET /landlord` - Landlord's issued rent ledger
* `PATCH /:id/slip` - Upload payment slip (JPEG/PNG/PDF)
* `PATCH /:id/verify` - Verify or reject payment slip (Landlord only)

### Maintenance Desk (`/api/v1/maintenance`)
* `POST /` - Report repair issue (Verified tenant only)
* `GET /my` - Student's reported tickets with 3-stage progress tracking
* `GET /landlord` - Landlord's maintenance issues queue
* `PATCH /:id/status` - Update ticket status (`pending` &rarr; `in_progress` &rarr; `resolved`) and add note

### Reviews (`/api/v1/reviews`)
* `GET /listing/:listingId` - Public verified reviews for accommodation
* `POST /` - Submit verified review (enforces accepted/completed stay check)
* `GET /my` - Student's submitted reviews
