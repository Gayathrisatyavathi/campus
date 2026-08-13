# Campus Management Protocol

A full-stack student career, placement and campus management platform built with Vanilla HTML/CSS/JS, Node.js, Express, MongoDB/Mongoose, JWT cookies and Multer/GridFS.

## What's implemented

- Student registration/login with bcrypt + HTTP-only JWT cookie
- Automatic StudentProfile creation and MongoDB persistence
- Complete profile editor with profile-completion calculation
- Resume upload/delete using MongoDB GridFS
- Placements, company calls, jobs, training, courses, interviews, AI skills
- Working online tests with timer, question navigation, scoring and MongoDB TestResult storage
- Placement applications persisted to MongoDB
- Hiring status workflow: Applied, Shortlisted, Interview Scheduled, Selected, Rejected, Offer Received
- Achievements
- Admin authentication and role-based admin portal
- Admin CRUD for placement/career resources
- Student listing and live dashboard statistics
- JSON seed data for students and sample career content
- Vercel-ready static frontend + Express API

## Demo accounts after seeding

Admin:
- Email: `admin@campus.local`
- Password: `Admin@12345`

Demo students:
- `rahul.demo@campus.local`
- `ananya.demo@campus.local`
- `vikram.demo@campus.local`
- Password for all: `Demo@12345`

Change these credentials before production use.

## Setup

1. Install Node.js.
2. Create a MongoDB Atlas cluster and a Database User.
3. Copy `.env.example` to `.env`.
4. Put the exact Atlas Database User username/password in `MONGODB_URI`.
5. If the password contains URI-special characters, URL-encode them.
6. Allow your development IP in Atlas Network Access.
7. Install packages:

```bash
npm install
```

8. Seed sample data:

```bash
npm run seed
```

9. Start development server:

```bash
npm run dev
```

Open `http://localhost:3000`.

## MongoDB Compass

Use the same URI as the application:

```text
mongodb+srv://USERNAME:PASSWORD@CLUSTER.mongodb.net/campus_management?retryWrites=true&w=majority&appName=Cluster0
```

The application creates and updates collections automatically. Sample data is inserted by `npm run seed`.

## JSON student data

Sample student records are stored in:

- `data/students.json`
- `backend/data/students.json`

The seed script reads the backend copy and creates corresponding User + StudentProfile documents.

## Important API flows

Student profile:
- `GET /api/student/profile`
- `PUT /api/student/profile`
- `POST /api/student/resume`
- `DELETE /api/student/resume`

Career resources:
- `GET /api/placements`
- `GET /api/companyCalls`
- `GET /api/jobs`
- `GET /api/training`
- `GET /api/courses`
- `GET /api/interviews`
- `GET /api/tests`
- `POST /api/tests/:id/submit`
- `GET /api/test-results`
- `GET /api/hiring`
- `POST /api/placements/:id/apply`

Admin:
- `GET /api/admin/stats`
- `GET /api/admin/students`
- `GET /api/admin/:resource`
- `POST /api/admin/:resource`
- `PUT /api/admin/:resource/:id`
- `DELETE /api/admin/:resource/:id`
- `GET /api/admin/hiring`
- `POST /api/admin/hiring`
- `POST /api/admin/admins`

## Admin portal

Sign in through the normal login page using the admin account. The server checks the user's role and redirects admins to `/admin.html`.

The admin portal can view students, see live database counts, create/edit/delete career resources, update hiring statuses, and create additional admin users.

## Deployment to Vercel

1. Push the project to GitHub.
2. Import it into Vercel.
3. Add these environment variables in Vercel:
   - `MONGODB_URI`
   - `JWT_SECRET`
   - `NODE_ENV=production`
   - `FRONTEND_URL=https://YOUR-VERCEL-DOMAIN`
   - `COOKIE_NAME=cmp_token`
   - `MAX_FILE_SIZE_MB=5`
4. Make sure MongoDB Atlas Network Access allows the deployed environment according to your Atlas security policy.
5. Deploy.

Do not commit `.env`, real database credentials, or production JWT secrets.
