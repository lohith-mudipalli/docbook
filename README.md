# DocBook — Secure Medical Appointment Platform

A production-style healthcare appointment scheduling system built with **Spring Boot + React**, designed to showcase **enterprise backend architecture**, **secure booking workflows**, and a polished **admin/doctor/patient UI**.

> **Why this project matters:** Scheduling + RBAC + concurrency safety are real business problems. DocBook demonstrates the kind of backend logic and system design expected from enterprise Software Engineers.

---

## Demo (Local)
- **Frontend:** http://localhost:5173  
- **Backend health:** http://localhost:8080/health  
- **MailHog (Email Inbox):** http://localhost:8025  

---

## Tech Stack

### Backend
- **Java + Spring Boot** (REST API)
- **Spring Security + JWT** (stateless auth)
- **JPA/Hibernate**
- **Async email queue + worker** (`@Scheduled` + retries)

### Frontend
- **React (Vite)**
- **FullCalendar** (scheduling UI)
- **Axios** (API client w/ JWT interceptor)

### Database & DevOps
- **MySQL**
- **Docker + Docker Compose**
- **GitHub Actions CI** (backend tests on push/PR)

---

## Core Features (Enterprise Highlights)

### 🛡️ Double-booking prevention (Concurrency Control)
Booking is protected with **transaction + row-level locking** on the selected timeslot so two users clicking *Book* at the same moment cannot both succeed.

### ⏱️ Time overlap conflict detection
Appointments use a proper **overlap rule** (not only equality checks):
- conflict if `newStart < existingEnd AND newEnd > existingStart`

### 🔒 RBAC Security (Role-Based Access Control)
Backend enforces access rules for:
- **PATIENT**
- **DOCTOR**
- **ADMIN**

### 🧾 Audit Logging
Key actions are recorded (booking/cancellation) with timestamps for traceability.

### 📨 Async Email Notifications (Queue + Worker + Retry)
Booking triggers an email job in DB; a background worker processes the queue with **retry/backoff**.  
MailHog is used for local testing.

### 🌍 Timezone-safe design
All times are stored as **UTC** in the database and displayed in UI safely.

---

## System Design (How Scheduling Works)

### 1) Availability Layer (Rules)
Admin defines weekly availability rules (example):
- MONDAY → 09:00–17:00 → 30 min slots  
Stored as: `DoctorAvailability`

### 2) Timeslot Layer (Generated Bookable Slots)
Backend generates real bookable timeslots for a date range:
- 2026-03-23 09:00–09:30
- 2026-03-23 09:30–10:00  
Stored as: `Timeslot`

**Why it’s scalable:** availability rules are small, while timeslots can scale to thousands and are easy to query for calendars + safe booking.

---

## Roles & Permissions

### 👤 PATIENT
- Register/login
- View/search doctors (name/specialization)
- View doctor availability in calendar
- Book appointments
- Cancel own appointments

### 👨‍⚕️ DOCTOR
- View assigned appointments
- See appointment status and timing

### 🛠️ ADMIN
- Create doctor profiles (auto role assignment)
- Set weekly availability (Mon–Sun, slot duration supported)
- Generate timeslots (date range)
- View doctors list
- View all appointments

---

## UI (Dashboard-Style UX)
DocBook includes a polished UI with:
- **Login + Register** pages
- **Patient Dashboard**: doctor search → calendar → booking confirmation → feedback
- **Doctor Portal**: appointments dashboard with grouping/status UX
- **Admin Panel**: onboarding + availability management + slot generation + tables

> UI improvements were built without changing backend logic — only UX upgrades.

---

## API (Core Endpoints)

### Auth
- `POST /api/auth/register`
- `POST /api/auth/login`

### Doctors & Scheduling
- `GET  /api/doctors`
- `POST /api/doctors` (ADMIN) — create doctor profile + promote role
- `PUT  /api/doctors/{doctorId}/availability` (ADMIN/DOCTOR*)
- `POST /api/timeslots/generate?doctorId=&from=YYYY-MM-DD&to=YYYY-MM-DD` (ADMIN/DOCTOR*)

### Appointments
- `POST /api/appointments/book`
- `POST /api/appointments/{id}/cancel`
- `GET  /api/appointments/me`

\*Depending on your RBAC rules, availability + generation may be Admin-only or Admin/Doctor.

---

## Run with Docker (Recommended)
From repo root:

```bash
docker compose up --build

Then open:

Frontend: http://localhost:5173
Backend: http://localhost:8080/health
MailHog: http://localhost:8025

If the DB is fresh (new volume), you will register users again and then use the Admin UI to create doctor profiles, set availability, and generate timeslots.

Run Locally (Without Docker)

Backend
cd backend
set -a
source .env
set +a
./mvnw spring-boot:run

Frontend
cd frontend
npm install
npm run dev

Testing & CI - Run backend tests
cd backend
./mvnw test

Tests run using H2 in-memory DB with the test profile.
CI: GitHub Actions runs tests on every push/PR.

Project Structure
docbook/
  backend/
    src/main/java/com/docbook/backend/
      config/         # security + filters
      controller/     # REST endpoints
      service/        # business logic (booking, notifications)
      repository/     # DB queries
      model/          # entities + enums
      dto/            # request/response DTOs
    src/test/         # integration tests
  frontend/
    src/
      api/            # axios client
      hooks/          # auth helpers
      pages/          # Login/Register/Patient/Doctor/Admin
      components/     # UI components (if added)
  docker-compose.yml
  README.md