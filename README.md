# Student Record Management System (SRMS)

An administrator based **Student Record Management System** — a web application that lets an
administrator login, manage student records (add / view / edit / delete), search a student by
roll number, view performance reports with department-wise statistics and change system settings.

The user interface is a faithful recreation of the screens shown in the project report
(Figures 1–7, pages 11–14).

---

## 1. Technologies

| Layer | Technology |
|---|---|
| Frontend | HTML5, CSS3, JavaScript (vanilla, no build step) |
| Backend | Node.js + Express.js (REST API, also serves the frontend) |
| Database | MongoDB (through Mongoose) |

> The report mentions Java/JSE concepts in the training section; the delivered application uses a
> practical Node.js + Express + MongoDB architecture so the complete website is functional.

---

## 2. Project structure

```
Student Record Management System/
├── backend/
│   ├── server.js                 # Express server (API + static frontend)
│   ├── .env / .env.example       # server configuration (admin credentials, DB uri)
│   ├── config/db.js              # MongoDB connection
│   ├── models/
│   │   ├── Student.js            # name, rollNumber (unique), department, semester, marks, email
│   │   └── Settings.js           # administratorName, email, collegeName, theme
│   ├── middleware/
│   │   ├── auth.js               # administrator login + bearer token sessions
│   │   └── errorHandler.js       # async wrapper, DB guard, JSON error handler
│   ├── controllers/
│   │   ├── authController.js     studentController.js
│   │   ├── reportController.js   settingsController.js
│   ├── routes/
│   │   ├── index.js  authRoutes.js  studentRoutes.js  reportRoutes.js  settingsRoutes.js
│   └── seed/
│       ├── seed.js               # sample data seeding
│       └── sampleStudents.js
├── frontend/
│   ├── index.html                # Figure 1 – Login
│   ├── dashboard.html            # Figure 2 – Dashboard
│   ├── add-student.html          # Figure 3 – Add Student
│   ├── view-students.html        # Figure 4 – View Students
│   ├── search-student.html       # Figure 5 – Search Student
│   ├── reports.html              # Figure 6 – Reports
│   ├── settings.html             # Figure 7 – Settings
│   ├── css/style.css
│   └── js/
│       ├── api.js  layout.js  icons.js  page-icons.js
│       ├── login.js  dashboard.js  add-student.js  students.js
│       ├── search.js  reports.js  settings.js
├── package.json
── README.md
```

---

## 3. Running the project

### Step 1 – install dependencies

```bash
npm install
```

### Step 2 – start MongoDB

Make sure a local MongoDB server is running (default `mongodb://127.0.0.1:27017`):

```bash
mongod --dbpath <your-data-folder>
```

### Step 3 – configure `backend/.env`

```ini
PORT=5000
MONGODB_URI=mongodb://127.0.0.1:27017/srms
ADMIN_USERNAME=admin
ADMIN_PASSWORD=admin123
ADMIN_NAME=Administrator
USE_MEMORY_DB=false
SEED_SAMPLE_DATA=true
```

> **MongoDB setup:** if MongoDB is installed on the machine, keep the default. The bundled
> `backend/.env` ships with `USE_MEMORY_DB=true`, which starts a temporary, real MongoDB
> instance in-process so the project runs immediately; for permanent records install MongoDB
> locally and set `USE_MEMORY_DB=false` (then records are kept in `mongodb://127.0.0.1:27017/srms`).

### Step 4 – start the server

```bash
npm start
```

Open **http://localhost:5000** and login with `admin / admin123`.

The four sample students from the report (Rahul Sharma, Priya Singh, Aman Verma, Riya Patel) are
inserted into MongoDB automatically the first time the students collection is empty
(`SEED_SAMPLE_DATA=true`). They can also be inserted manually:

```bash
npm run seed                         # insert sample students if the collection is empty
node backend/seed/seed.js --reset    # clear and re-insert the sample students
```

## 4. REST API

| Method | Endpoint | Description |
|---|---|---|
| POST | `/api/auth/login` | administrator login → returns a session token |
| POST | `/api/auth/logout` | ends the session |
| GET | `/api/auth/me` | validates the current session |
| GET | `/api/students` | list all students (`?search=` optional) |
| POST | `/api/students` | create a student |
| GET | `/api/students/:id` | read one student |
| PUT | `/api/students/:id` | update a student |
| DELETE | `/api/students/:id` | delete a student |
| GET | `/api/students/search/:rollNumber` | search a student by roll number |
| GET | `/api/reports` | Totals, Passed, Failed, Average Marks + department-wise counts |
| GET | `/api/reports/dashboard` | dashboard statistics + student performance table |
| GET | `/api/settings` | read system settings |
| PUT | `/api/settings` | save system settings |
| GET | `/api/health` | server + database status |

All `/api/students`, `/api/reports` and `/api/settings` routes require the
`Authorization: Bearer <token>` header returned by the login endpoint.

---

## 5. Validation & error handling

* **Frontend** – required fields, numeric & range checks for marks, email format, digits-only
  roll number handling, messages shown above the form.
* **Backend** – the same rules are re-validated in MongoDB/Mongoose (never trusting the client),
  roll numbers are unique, and clear JSON errors are returned for: duplicate roll number,
  student not found, invalid marks/email, missing fields, expired session, database not
  connected and unexpected server errors.

## 6. Pass / Fail logic

A student **passes when marks ≥ 50**, which reproduces the report exactly
(Riya Patel, 45 marks → *Fail*; Rahul Sharma 91, Priya Singh 87, Aman Verma 74 → *Pass*).
The status is always calculated from the marks, never stored.

## 7. Pages

| Page | Highlights |
|---|---|
| Login | navy gradient background, centred white card, Username / Password, Login button |
| Dashboard | Total Students, Average Marks, Pass Percentage, Departments + Student Performance table |
| Add Student | Student Name, Roll Number, Department, Semester, Marks, Email → *Save Student* |
| View Students | full student table with Edit and Delete actions (confirmation before delete) |
| Search Student | search by roll number → Student Details card (Name, Roll No, Department, Semester, Marks, Email) |
| Reports | Total Students, Passed Students, Failed Students, Average Marks + Department Wise Students |
| Settings | Administrator Name, Email, College Name, Theme → *Save Changes* (persisted in MongoDB) |

The sidebar (`SRMS / Student Record` → Dashboard, Add Student, View Students, Search Student,
Reports, Settings, Logout) and the top-right `Administrator` block are identical on every page.