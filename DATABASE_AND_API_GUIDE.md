# 🦅 Quiz Bird — Fullstack Node.js + SQL + React Platform

Comprehensive guide covering the architecture, SQL database schema, REST API endpoints, security setup, and Admin Dashboard.

---

## 🚀 Quick Start Guide

### 1. Backend Setup & Database Seeding
```bash
cd quiz-backend

# Install dependencies
npm install

# Initialize SQL Schema and Seed 2,250+ Questions + Default Accounts
npm run db:seed

# Start Node.js API Server (Port 5000)
npm run dev
```

### 2. Frontend Setup
```bash
cd quiz-frontend

# Install dependencies (if not already installed)
npm install

# Start Vite Development Server (Port 5173)
npm run dev
```

---

## 🔑 Default Credentials (Pre-Seeded)

| Role | Email | Password | Access Privileges |
| :--- | :--- | :--- | :--- |
| **Administrator** | `admin@quizbird.com` | `Admin@123456` | Full Admin Portal (`/admin`), Question Bank CRUD, User Management, Semesters/Subjects/Chapters CRUD, System Stats |
| **Student** | `student@quizbird.com` | `Student@123456` | Student Dashboard, Interactive Quizzes, Analytics, Paused/Recent Tests |

> [!NOTE]
> The app is ready for actual users with secure registration and login authentication. Demo quick-fill buttons have been removed for production.

---

## 🗄️ Database Architecture (SQL Schema)

The database runs natively using Node.js SQLite with WAL mode (`PRAGMA journal_mode = WAL`) and strict foreign key integrity (`PRAGMA foreign_keys = ON`).

### Table Descriptions:
1. **`semesters`**: Academic terms (`Sem VI`, `Sem VII`, `Sem VIII`, `Sem IX`).
2. **`subjects`**: Course modules (`Adv Java`, `Frontend`, `Backend`) linked to semesters.
3. **`chapters`**: Chapter hierarchy per subject (`JVM Architecture`, `HTML5 & CSS`, etc.).
4. **`questions`**: Question bank items with text, difficulty (`Easy`, `Medium`, `Hard`), solution explanations, and marks.
5. **`question_options`**: 4 multiple choice options per question with `is_correct` boolean indicator.
6. **`users`**: User records with `bcrypt` password hashes, roles (`admin` / `student`), and assigned semester.
7. **`quiz_attempts`**: Full test session records (score, total questions, correct/incorrect/skipped metrics, time spent, paused state).
8. **`quiz_answers`**: Individual question responses for every quiz attempt to calculate deep time and accuracy metrics.
9. **`access_codes`**: Promo and access code passes (`BIRD2026`, `STUDYLINK`).
10. **`user_time_logs`**: Daily tracking of total active time spent on the platform.

---

## 🛡️ Security Features & Headers

- **Helmet (`helmet`)**: Configures secure HTTP headers including `Content-Security-Policy`, `X-Frame-Options`, `X-Content-Type-Options`, and `Strict-Transport-Security`.
- **CORS (`cors`)**: Controlled cross-origin resource sharing allowing the React Vite frontend.
- **Express Rate Limiters (`express-rate-limit`)**:
  - `authRateLimiter`: 30 attempts per 15 minutes to prevent brute-force attacks on `/api/auth/*`.
  - `apiRateLimiter`: 300 requests per minute general API throttle.
- **Stateless JWT (`jsonwebtoken`)**: Signed tokens with 7-day expiration (`Authorization: Bearer <token>`).
- **Password Hashing (`bcryptjs`)**: Passwords hashed with 10 salt rounds before persistence.
- **Role-Based Middleware**: `verifyToken` and `requireAdmin`.

---

## 📡 REST API Endpoint Reference

### 🔐 Authentication (`/api/auth`)
- `POST /api/auth/register` — Register student account `{ name, email, password, semester_id, college }`
- `POST /api/auth/login` — Sign in and receive JWT token `{ email, password }`
- `GET /api/auth/me` — Get current logged-in profile & quick test stats *(Requires Token)*
- `PUT /api/auth/profile` — Update name, college, or active semester *(Requires Token)*
- `POST /api/auth/redeem-code` — Redeem an access code `{ code }`

### 🎓 Academic Curriculum (`/api/academics`)
- `GET /api/academics/semesters` — Get list of semesters and subject counts
- `GET /api/academics/subjects?semester_id=1` — Get subjects for active semester
- `GET /api/academics/subjects/:subjectIdentifier/syllabus` — Get chapter breakdown

### 📝 Quiz Engine (`/api/quiz`)
- `POST /api/quiz/generate` — Generate randomized quiz questions by subject, chapters, and difficulty
- `POST /api/quiz/submit` — Submit answers, calculate score, and record metrics
- `POST /api/quiz/pause` — Save in-progress test state for later resumption
- `GET /api/quiz/history` — Get completed and paused test attempts *(Requires Token)*
- `GET /api/quiz/analytics` — Get performance breakdown and time averages *(Requires Token)*
- `POST /api/quiz/log-time` — Synchronize active study time *(Requires Token)*

### 🛠️ Admin Management (`/api/admin`) *(Requires Admin Role)*
- `GET /api/admin/overview` — Platform metric summaries (Total Users, Questions, Tests, Avg Accuracy)
- `GET /api/admin/questions` — Paginated and filterable Question Bank
- `POST /api/admin/questions` — Create single question with 4 options & answer
- `PUT /api/admin/questions/:id` — Update existing question
- `DELETE /api/admin/questions/:id` — Delete question
- `GET /api/admin/users` — Paginated list of registered users
- `POST /api/admin/users` — Create new user (Student / Admin)
- `PUT /api/admin/users/:id` — Update user details or change password
- `DELETE /api/admin/users/:id` — Delete user
- `POST /api/admin/semesters` — Create new semester
- `POST /api/admin/subjects` — Create new course subject
- `POST /api/admin/chapters` — Create new chapter under a subject
