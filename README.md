# Balance Hospital 🏥

A role-based **Hospital Management & Roster Scheduling** system built around **Categories**, **Departments**, **Degrees**, **Shift Hours**, **Rosters**, **Doctor Requests**, **Notifications**, and **Reports** — with a **Dashboard** for fast access to the most important actions and insights.

✅ **Dark Mode + Light Mode**  
✅ **Multilingual (i18n)** — supports switching language داخل النظام

**Live Demo:** https://balance-hospital-jw1x.vercel.app/  
**Repository:** https://github.com/mahmoudAliaboElhassan/balance-hospital

---

## Why this project?

Hospitals need more than a simple schedule:

- structure (categories → departments),
- clear doctor classification (scientific + contracting),
- controlled roster lifecycle (status + validation),
- request workflows (approve/reject),
- notifications to keep everyone updated,
- reports (including Excel export),
- and a dashboard to access everything quickly.

Balance Hospital brings these into one organized system.

---

## Roles (Multi-Role Supported)

The system is permission-based and supports users having more than one role at the same time.

Common roles:

- **Admin (System Administrator)**
- **Category Manager**
- **Department Manager**
- **Doctor**

Examples of supported combinations:

- Doctor + Department Manager
- Department Manager + Category Manager
- Doctor + Category Manager

> Pages and actions are automatically shown/hidden based on the user’s role & permissions.

---

## Features (Grouped by Module)

### 1) Dashboard (Fast Access)

A central dashboard that provides:

- quick overview of system activity,
- shortcuts to important areas (rosters, requests, reports, notifications),
- fast decision-making for managers and admins.

---

### 2) UI Experience

- **Dark Mode / Light Mode**
- **Multilingual UI** using i18n (language switching)

---

### 3) Categories

- Create / update / remove categories
- Manage category types
- Manage category leadership (heads/chiefs)
- Review doctor registration requests under a category:
  - **Approve**
  - **Reject**

---

### 4) Departments

- Create / update / remove departments
- Link departments to categories
- View departments by category
- Department-level visibility for scheduling and management

---

### 5) GeoFence (Optional Operational Module)

- Create geofence per department
- Get single fence
- Update fence
- Delete fence

---

### 6) Degrees & Employment Structure

Used to define doctor classification and scheduling rules.

- **Scientific Degrees**
  - Create / update / remove
  - Active/inactive support
- **Contracting Types / Contracting Degrees**
  - Create / update / remove
  - Active/inactive support
  - Also used in signup / onboarding flows (if enabled)

---

### 7) Shift Hours Types

Defines shift patterns used inside rosters:

- Create / update / remove shift hour types
- Enable/disable shift hour types
- Use shift hour types during roster building and working hours generation

---

### 8) Roster Management (Core Module)

Roster building is structured and controlled to reduce scheduling mistakes.

Main capabilities:

- Create roster (basic info)
- Add departments into roster
- Add shifts per department
- Apply degree/contract rules to shifts
- Generate working hours automatically
- View roster tree and roster progress
- Update roster data
- Delete roster (with reason)

✅ **Roster Status**

- Rosters have a **status lifecycle** (example: draft / active / etc.)
- Status helps control what can be edited and what becomes “official”

✅ **Auto-Accept Rosters**

- Option to enable **auto-accept** for requests within a roster
- Useful for stable schedules or departments with predictable staffing

---

### 9) Doctor Scheduling & Requests (Approve / Reject)

Scheduling operations:

- Assign a doctor to a working hour
- Unassign a doctor
- View doctor schedule inside a roster
- Find available doctors for a working hour

Requests workflow:

- Doctors submit requests related to working hours/scheduling
- Managers can:
  - **Approve**
  - **Reject**
- Requests can be reviewed by status for clear follow-up and auditing

---

### 10) Leaves Management

- View leaves calendar within a date range (and optional category filter)
- Review leave requests
- Approve / reject leaves (rejection reason supported)

---

### 11) Notifications Center

A complete notification module that supports:

- List notifications (with pagination)
- Filter read/unread
- Mark as read:
  - single
  - multiple
  - all
- Unread count (for badge indicators)
- Delete notifications:
  - single
  - bulk delete

> Notifications keep doctors and managers aligned on approvals, rejections, roster updates, and status changes.

---

### 12) Reports & Export

Reports are built to support management decisions:

- Monthly schedule reports (filter by category/department/doctor/degree/contracting, etc.)
- Monthly attendance reports
- Doctor report between date ranges
- **Export to Excel** for offline sharing and auditing

---

### 13) Management Roles & Permissions

Administration features include:

- List roles
- Role statistics
- Role permissions
- Users assigned to roles
- Role assignment history

This allows scalable growth: more departments, more managers, more policies.

---

# Who Can Do What (Responsibilities)

### Admin (System Administrator)

✅ Full access to the entire system:

- Manage all categories, departments, degrees, shift hours, rosters, users, roles/permissions
- View and manage all reports across all categories/departments
- Full notifications and auditing visibility

---

### Category Manager

✅ Manages **everything inside their assigned category**:

- Manage rosters for that category:
  - create new rosters
  - manage roster status
  - manage roster data and operations
- Handle doctors related to the category:
  - approve/reject doctor status for the category
- Leaves management for that category:
  - view leave requests
  - approve/reject doctor leaves
- Reports (category scope):
  - view category reports
  - export reports to Excel
- Departments:
  - view departments linked to that category

> Category Manager access is limited to their category scope, not the whole hospital.

---

### Department Manager

✅ Manages **their department only**:

- View roster data for **only that department** across all months
- Select which category the department belongs to **in that specific month** (when applicable)
- View department calendar:
  - doctor schedule
  - shifts / working hours
- Download department schedule data as **Excel**
- Manage department GeoFences (if enabled):
  - view and manage department geofences

> Department Manager does not manage other departments or categories outside their department.

---

### Hybrid (Multi-Role User)

✅ Can act as Category Manager and/or Department Manager depending on preference.

- After login, hybrid users can choose the mode they want to operate as:
  - **Act as Category Manager**
  - **Act as Department Manager**

This keeps workflows clean and prevents mixing responsibilities accidentally.

---

### Doctor

✅ Minimal access (lowest access level):

- Only sees their own schedule / assignments / status
- Receives notifications about approvals/rejections and schedule updates
- The main system focus is on **managers**, while doctors primarily use the **mobile application** for day-to-day interaction

---

## Access Control (Guarded Pages)

The UI is protected so users only see and access what matches their role and permissions:

- Unauthenticated users are redirected to login
- Admin-only areas are restricted to admins
- Each feature page is protected by required permissions
- Unauthorized access shows a clear “Forbidden / Not Allowed” experience

---

## Best Practices (Code & Architecture)

(Kept here to avoid cluttering the main description.)

- **Custom hooks** keep feature logic reusable and UI clean
- **Guards** ensure feature pages match permissions and role
- **Single source for routes + sidebar** to prevent mismatched navigation
- **Consistent approve/reject flows** across requests and leaves
- **Notification-first UX** so users always know what changed
- **i18n-ready UI** (multi-language) + consistent formatting across languages
- **Theme-ready UI** (dark/light mode) across main pages

---

## Technology

- **React 19** + **React DOM**
- **Vite** (build tooling)
- **React Router DOM** (routing)
- **Redux Toolkit** + **React Redux** (state management)
- **Axios** (API communication)
- **TailwindCSS** + `clsx` + `tailwind-merge` (UI styling)
- **Formik** + **Yup** (forms + validation)
- **i18next** + `react-i18next` + language detector + backend loader (multilingual)
- **Recharts** (dashboard charts)
- **Framer Motion** (animations)
- **React Toastify** + **SweetAlert2** (toasts + confirmations)
- **ExcelJS** + **XLSX** (Excel export / handling)
- **SignalR** (`@microsoft/signalr`) (real-time-ready features like notifications)
- **js-cookie** (store small client preferences like language/theme/auth helpers)
- **Lucide React** (icons)

---

## 🚀 Getting Started (Local Development)

### Install

```bash
npm install
```

🔐 Environment Variables

### Create .env.local:

```bash
VITE_API_BASE_URL="https://your-api.com"
```

### Run

```bash
npm run dev
```
#   b a l a n c e - h o s p i t a l  
 