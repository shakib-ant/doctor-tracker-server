# 🏥 Doctor Tracker — Backend REST API Server

> **High-performance, secure Node.js & Express RESTful API server for the Doctor Tracker Healthcare Administration System.**  
> Built with **MongoDB Atlas**, **Mongoose 7**, compound database indexing, aggregation analytics pipelines, **JWT (JSON Web Token)** stateless security, and Role-Based Access Control (RBAC).

---

## 📑 Table of Contents
1. [Backend Overview](#-backend-overview)
2. [Why Each Backend Technology Was Chosen (প্রযুক্তিসমূহের যৌক্তিকতা)](#-why-each-backend-technology-was-chosen-প্রযুক্তিসমূহের-যৌক্তিকতা)
3. [Architecture & Request Lifecycle](#-architecture--request-lifecycle)
4. [Database Schemas, Compound Indexes & Aggregations](#-database-schemas-compound-indexes--aggregations)
5. [Authentication, Security & RBAC](#-authentication-security--rbac)
6. [Complete REST API Reference](#-complete-rest-api-reference)
7. [Installation & Setup Guide](#-installation--setup-guide)
8. [Database Seeding (500+ Verified Clinical Records)](#-database-seeding-500-verified-clinical-records)
9. [Error Handling & Code Quality](#-error-handling--code-quality)

---

## 🌟 Backend Overview

The **Doctor Tracker Server** powers all clinical, administrative, and analytical operations for the hospital dashboard. It is architected for zero data simulation: every patient record, specialist workload metric, 30-day chronological admission timeline, and role permission check is processed natively via MongoDB aggregation pipelines and compound indexes.

### Core Capabilities:
- **Stateless JWT Authentication**: Secure bearer token issuing and verification with salted bcrypt password hashing.
- **Three-Tier Role-Based Access Control (RBAC)**: Enforces boundaries between `superAdmin`, `admin`, and `viewer`.
- **Parallel Analytics Pipelines**: MongoDB `$group`, `$lookup`, and `$dateToString` pipelines compute real-time hospital triage metrics directly at the database engine level.
- **Full Clinical CRUD**: REST endpoints for managing USA specialists and patient rosters with full-text search, multi-field filters, and soft-delete/archival auditing.
- **Robust Error Handling & Validation**: Centralized middleware and `express-validator` sanitize payloads to prevent NoSQL injection and malformed requests.

---

## 💡 Why Each Backend Technology Was Chosen (প্রযুক্তিসমূহের যৌক্তিকতা)

| Package / Technology | Version | Why It Was Chosen (কেন ব্যবহার করা হয়েছে) |
| :--- | :---: | :--- |
| **Node.js (ES Modules)** | `v18+` | Fast, event-driven, non-blocking asynchronous runtime. Native ES Module support (`import`/`export`) ensures clean, modern syntax matching the Next.js frontend without Babel transpilation. |
| **Express.js** | `4.18.x` | Minimalist, battle-tested, unopinionated HTTP framework. Enables flexible modular routing, clean middleware pipelines (`cors`, `morgan`, `auth`), and sub-millisecond route dispatching. |
| **MongoDB Atlas + Mongoose**| `7.8.x` | Industry-leading document database. Mongoose provides robust schema validation, relational population (`ref: "Doctor"`), and complex aggregation pipelines that eliminate Node.js in-memory filtering. |
| **jsonwebtoken (JWT)** | `9.0.x` | Stateless, distributed authentication. Embeds encrypted claims (`id`, `email`, `level`) in signed HTTP Bearer tokens, eliminating database session lookups on every request. |
| **bcryptjs** | `2.4.x` | Salted one-way password hashing (10 salt rounds). Protects administrative credentials against rainbow table and brute-force attacks. |
| **express-validator** | `7.2.x` | Sanitizes and validates request bodies, headers, and query params before reaching controllers, neutralizing malformed input and NoSQL injection attempts. |
| **express-async-handler** | `1.2.x` | Eliminates verbose `try/catch` boilerplate across async controller methods by automatically catching and passing rejected promises to Express error-handling middleware. |
| **cors** | `2.8.x` | Configures Cross-Origin Resource Sharing to securely allow requests from the Next.js client (`http://localhost:3000`) while restricting unauthorized origins. |
| **morgan** | `1.10.x` | HTTP request logger providing real-time visibility into route status codes, response times, and method traces during development. |
| **dotenv** | `16.0.x` | Loads environmental configuration variables (`PORT`, `MONGO_URI`, `JWT_SECRET`) safely from `.env` files outside source control. |

---

## 🏗 Architecture & Request Lifecycle

```
[ HTTP Request from Next.js Admin ]
               │
               ▼
   [ CORS & Morgan Logging ]
               │
               ▼
    [ Express JSON Parser ]
               │
               ▼
 ┌─────────────┴─────────────┐
 │                           │
 ▼                           ▼
[ Public Routes ]    [ Protected Routes ]
- /public/auth/login         │
- /public/auth/request-access│
                             ▼
                  [ authMiddleware (JWT Verification) ]
                             │
                             ▼
                  [ Role-Check: requireSuperAdmin ] (If privileged)
                             │
                             ▼
                  [ express-validator Payload Check ]
                             │
                             ▼
                  [ Controller Logic & Mongoose ODM ]
                             │
                             ▼
                  [ MongoDB Atlas Cluster ]
                  (Compound Indexes / Aggregation Engine)
                             │
                             ▼
                  [ JSON Response / Error Middleware ]
```

### Folder Architecture
```
doctorTrackerServer/
├── config/             # Database connection (db.js) & CORS setup
├── controllers/        # Business logic handlers
│   ├── protected/      # Doctor, Patient, Analytics, Access controllers
│   └── public/         # Authentication & Access Request controllers
├── middlewares/        # JWT auth, RBAC permissions, error handlers
├── models/             # Mongoose schemas (Doctor, Patient, Employee, Tag)
├── routes/             # Modular route definitions
│   ├── employeeAppRoutes/
│   │   ├── protectedRoutes/   # doctors, patients, analytics, access routes
│   │   └── publicRoutes/      # login, request-access routes
│   └── routes.js       # Master route mount
├── scripts/            # Database seeders (seed500Data.js)
├── utils/              # Helper utilities and token generators
├── .env.example        # Environment variable blueprint
├── eslint.config.js    # ESLint configuration
├── package.json        # Dependencies and scripts
└── server.js           # Server entry point
```

---

## 🗄 Database Schemas, Compound Indexes & Aggregations

### 1. `Doctor` Model (`models/doctorModel.js`)
Represents licensed USA medical specialists.
```javascript
{
  name: { type: String, required: true, trim: true },
  specialization: { type: String, required: true },
  hospital: { type: String, required: true },
  department: { type: String, default: "Clinical Medicine" },
  designation: { type: String, default: "Attending Specialist" },
  qualifications: { type: String, default: "MD, Board Certified" },
  experienceYears: { type: Number, default: 10 },
  consultationFee: { type: Number, default: 250 },
  phone: { type: String, required: true },
  email: { type: String, required: true },
  about: { type: String },
  image: { type: String },
  availableDays: [{ type: String }],
  isActive: { type: Boolean, default: true }
}
```
**Database Indexes**:
- `{ name: "text", specialization: "text", hospital: "text" }` &rarr; Full-text search across physician directory.
- `{ specialization: 1, isActive: 1 }` &rarr; Fast clinical department filtering.
- `{ createdAt: -1 }` &rarr; Instant reverse-chronological pagination.

---

### 2. `Patient` Model (`models/patientModel.js`)
Represents admitted inpatients and clinical outpatient records.
```javascript
{
  name: { type: String, required: true, trim: true },
  age: { type: Number, required: true },
  gender: { type: String, enum: ["Male", "Female", "Other"], required: true },
  phone: { type: String, required: true },
  email: { type: String },
  condition: { type: String, required: true },
  admissionDate: { type: Date, default: Date.now },
  status: { 
    type: String, 
    enum: ["Active", "Under Observation", "Recovered", "Critical"], 
    default: "Active" 
  },
  doctor: { type: mongoose.Schema.Types.ObjectId, ref: "Doctor", required: true },
  isArchived: { type: Boolean, default: false },
  notes: { type: String }
}
```
**Compound Indexes for High Performance**:
- `{ doctor: 1, createdAt: -1 }` &rarr; Instant retrieval of all patients assigned to a doctor without collection scans.
- `{ isArchived: 1, status: 1 }` &rarr; High-speed active inpatient vs. archived record segmentation.
- `{ condition: 1 }` &rarr; Fast medical diagnosis filtering.
- `{ admissionDate: -1 }` &rarr; High-speed time-series timeline aggregation.
- `{ name: "text", condition: "text" }` &rarr; Full-text patient search indexing.

---

### 3. `Employee` Model (`models/authModels/employeeModel.js`)
Represents hospital portal administrators.
```javascript
{
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true, lowercase: true },
  password: { type: String, required: true },
  level: { type: String, enum: ["superAdmin", "admin", "viewer"], default: "admin" },
  department: { type: String, default: "Clinical Administration" },
  isActive: { type: Boolean, default: true },
  requestNote: { type: String }
}
```
**Index**: `{ email: 1 }` (unique constraint).

---

### 4. Parallel Aggregation Pipelines (`controllers/protected/analyticsController.js`)
All dashboard metrics run concurrently using MongoDB aggregation pipelines:
1. **Workload per Specialist**:
   ```javascript
   Patient.aggregate([
     { $group: { _id: "$doctor", patientCount: { $sum: 1 } } },
     { $sort: { patientCount: -1 } },
     { $limit: 8 },
     { $lookup: { from: "doctors", localField: "_id", foreignField: "_id", as: "doctor" } },
     { $unwind: "$doctor" },
     { $project: { doctorId: "$doctor._id", name: "$doctor.name", specialization: "$doctor.specialization", patientCount: 1 } }
   ]);
   ```
2. **30-Day Admissions Trend**:
   ```javascript
   Patient.aggregate([
     { $match: { admissionDate: { $gte: thirtyDaysAgo } } },
     { $group: { _id: { $dateToString: { format: "%Y-%m-%d", date: "$admissionDate" } }, count: { $sum: 1 } } },
     { $sort: { _id: 1 } }
   ]);
   ```
3. **Condition Distribution**:
   ```javascript
   Patient.aggregate([
     { $group: { _id: "$condition", count: { $sum: 1 } } },
     { $sort: { count: -1 } },
     { $limit: 6 }
   ]);
   ```

---

## 🔒 Authentication, Security & RBAC

| Role | Access Level | Description |
| :---: | :---: | :--- |
| **`superAdmin`** | **Full Privilege** | Full CRUD on Doctors & Patients, manage staff roles (`/access`), approve/reject portal access requests, delete staff. |
| **`admin`** | **Operational** | Full CRUD on Doctors & Patients, inspect dashboard analytics. Cannot alter administrative staff roles. |
| **`viewer`** | **Read-Only** | Read-only inspection of Doctor rosters, Patient tables, and analytics. Mutation endpoints reject with `403 Forbidden`. |

### Security Implementations:
1. **Password Hashing**: `bcrypt.hash(password, 10)` ensures irreversible password storage.
2. **JWT Invalidation & Expiry**: Tokens are signed with custom secrets and expiration limits.
3. **Sanitization**: All input fields pass through `express-validator` to eliminate script injections.

---

## 📡 Complete REST API Reference

### Base URL: `http://localhost:5000/api/employeeApp`

### 1. Public Authentication Routes (`/public/auth`)
| Method | Endpoint | Description | Request Body | Response |
| :--- | :--- | :--- | :--- | :--- |
| `POST` | `/public/auth/login` | Authenticate admin | `{ email, password }` | `{ success, token, user }` |
| `POST` | `/public/auth/request-access` | Request portal join | `{ name, email, password, department, requestNote }` | `{ success, message }` |

---

### 2. Protected Analytics Routes (`/protected/analytics`) *(Bearer Token Required)*
| Method | Endpoint | Description | Query / Response |
| :--- | :--- | :--- | :--- |
| `GET` | `/protected/analytics/dashboard` | Aggregated dashboard stats | Returns counts, admissions trend, workload, condition breakdown |

---

### 3. Protected Doctor Routes (`/protected/doctors`) *(Bearer Token Required)*
| Method | Endpoint | Description | Query Parameters / Body |
| :--- | :--- | :--- | :--- |
| `GET` | `/protected/doctors` | Paginated doctors list | `?page=1&limit=10&search=john&specialty=Cardiology&status=active\|archived\|all` |
| `GET` | `/protected/doctors/:id` | Get single doctor details | Returns full doctor profile |
| `GET` | `/protected/doctors/:id/patients` | Get patients of a doctor | Returns array of assigned patient records |
| `POST` | `/protected/doctors` | Register new doctor | `{ name, specialization, hospital, phone, email, fee, availableDays }` |
| `PUT` | `/protected/doctors/:id` | Update doctor info | `{ name, specialization, hospital, ... }` |
| `DELETE`| `/protected/doctors/:id`| Toggle archive status | Soft-deletes or archives doctor |

---

### 4. Protected Patient Routes (`/protected/patients`) *(Bearer Token Required)*
| Method | Endpoint | Description | Query Parameters / Body |
| :--- | :--- | :--- | :--- |
| `GET` | `/protected/patients` | Paginated patient records | `?page=1&limit=10&search=smith&condition=Asthma&status=Active&startDate=&endDate=&archived=active\|archived\|all` |
| `GET` | `/protected/patients/:id`| Get single patient | Returns complete patient record with populated doctor |
| `POST` | `/protected/patients` | Register new patient | `{ name, age, gender, phone, condition, doctor, status, admissionDate }` |
| `PUT` | `/protected/patients/:id`| Update patient data | Updated fields |
| `DELETE`| `/protected/patients/:id`| Archive / Restore patient | Soft-delete toggle |

---

### 5. Privileged Access Management (`/protected/access`) *(Requires `superAdmin`)*
| Method | Endpoint | Description | Body / Response |
| :--- | :--- | :--- | :--- |
| `GET` | `/protected/access/users` | List staff & pending access requests | Returns all staff accounts grouped by status |
| `POST` | `/protected/access/users` | Create staff account directly | `{ name, email, password, level, department }` |
| `PATCH`| `/protected/access/users/:id/role` | Change role level | `{ level: "superAdmin" \| "admin" \| "viewer" }` |
| `PATCH`| `/protected/access/users/:id/status`| Approve / activate request | `{ isActive: true }` |
| `DELETE`| `/protected/access/users/:id` | Delete / revoke staff access | Revokes account permanently |

---

## 🚀 Installation & Setup Guide

### 1. Prerequisites
- **Node.js**: `v18.0.0` or higher (verified on Node 20 & 22)
- **MongoDB Atlas** cluster URI (or local MongoDB on port 27017)

### 2. Setup Steps
```bash
# 1. Enter the backend directory
cd doctorTrackerServer

# 2. Install dependencies
npm install

# 3. Create .env file
cp .env.example .env

# 4. Configure .env file with your credentials:
# PORT=5000
# MONGO_URI=mongodb+srv://<username>:<password>@cluster0.mongodb.net/doctorTracker?retryWrites=true&w=majority
# JWT_SECRET=your_super_secret_jwt_key_here
```

### 3. Start Server
```bash
# Start in production mode:
npm run start

# Start in development mode with auto-reload:
npm run server
```
*Server runs on `http://localhost:5000`.*

---

## 📊 Database Seeding (500+ Verified Clinical Records)

To populate MongoDB Atlas with a complete, production-grade medical dataset:
```bash
npm run seed:500
```

### What this script creates:
1. **60 Verified USA Medical Specialists**:
   - Spans Cardiology, Oncology, Neurology, Pediatrics, Orthopedics, Nephrology, Dermatology, Gastroenterology, General Surgery.
   - Real USA hospital chambers, consultation fee schedules, and verified Unsplash medical portraits.
2. **450+ Patient Inpatient & Outpatient Records**:
   - Complete with clinical care statuses (`Critical`, `Under Observation`, `Recovered`, `Active`), diagnoses, and admission dates spanning the past 30 days.
3. **Default Super Administrator Account**:
   - **Email**: `admin@doctortracker.com`
   - **Password**: `Password@123`
   - **Role**: `superAdmin`

---

## 🛡 Error Handling & Code Quality

- **ESLint Clean**: Verified via `npm run lint` — **0 warnings, 0 errors**.
- **Centralized Error Boundary**: Unknown routes trigger standard 404 handlers, and unhandled exceptions are converted to formatted JSON responses with stack traces hidden in production.
- **Graceful Shutdown**: Intercepts `SIGINT` and `SIGTERM` signals to cleanly disconnect MongoDB Atlas client pools before exiting.

---

### 💙 Maintained by
**Doctor Tracker Backend Engineering Team**
