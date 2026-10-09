# QuestHive — Java Full Stack

**Find a skill. Find your person.** A skill-learning marketplace connecting learners with verified teachers.

| Layer | Technology |
|---|---|
| Frontend | React 18 + TypeScript + Vite, React Router, Bootstrap 5 grid + custom CSS, lucide-react, Recharts |
| Backend | **Java 17 + Spring Boot 3** (Spring Web, Spring Data JPA, Bean Validation, BCrypt) |
| Database | **MySQL 8** (Hibernate creates the tables), or embedded H2 for a no-install demo |
| API | REST / JSON on `http://localhost:8080/api` |

```
questhive/
├── frontend/                         React app (port 5173)
│   ├── .env                          VITE_API_URL=http://localhost:8080/api
│   └── src/
│       ├── api/        http.ts (REST client) · remote.ts (calls Spring Boot) · *Service.ts · mockDb.ts (offline mode)
│       ├── components/ layout · common · search · teacher · booking · review · notification · dashboard
│       ├── pages/      public · learner · teacher · admin · shared
│       └── context/ hooks/ utils/ types/ data/ styles/
└── backend/                          Spring Boot app (port 8080)
    ├── pom.xml
    └── src/main/
        ├── java/com/questhive/
        │   ├── QuestHiveApplication.java
        │   ├── controller/   Auth · Teacher · Learner · Booking · Review · Notification · Subject · Admin · Health
        │   ├── service/      Auth · Teacher · Booking · Review · Notification · Admin   (business logic)
        │   ├── repository/   Spring Data JPA interfaces
        │   ├── entity/       Teacher · AvailabilityRange · Learner · Booking · Payment · Review · Notification · Category
        │   ├── dto/          Requests · Responses
        │   ├── exception/    ApiException · GlobalExceptionHandler  → {"error": "..."}
        │   ├── config/       CorsConfig · PasswordConfig (BCrypt) · DataSeeder (loads demo data on first run)
        │   └── util/         AppUtils (slot generation, dates, ids)
        └── resources/
            ├── application.properties       MySQL settings
            ├── application-h2.properties    no-MySQL profile
            └── seed.json                    demo data (24 teachers, 10 learners, ~100 bookings…)
```

## Requirements
- **JDK 17+** and **Maven** (IntelliJ IDEA and Eclipse include Maven)
- **MySQL 8** (optional, see the H2 option)
- **Node.js 18+**

## Run it

### 1. Start the backend (Spring Boot)
Copy `backend/secrets.properties.example` to `backend/secrets.properties` and put your MySQL password in it:
```properties
spring.datasource.password=YOUR_MYSQL_PASSWORD
```
(`secrets.properties` is git-ignored, so the password never goes to GitHub. The username defaults to `root`.)
The `questhive` database is created automatically. Then:
```bash
cd backend
mvn spring-boot:run
```
**IntelliJ / Eclipse:** open the `backend` folder as a Maven project and run `QuestHiveApplication.java`.

**No MySQL?** Use the embedded H2 database:
```bash
mvn spring-boot:run -Dspring-boot.run.profiles=h2
```
(IntelliJ: Run configuration → Active profiles → `h2`.)

Check it at http://localhost:8080/api/health. Demo data loads automatically on the first start.

### 2. Start the frontend (second terminal)
```bash
cd questhive
npm run setup      # first time only
npm run dev        # open http://localhost:5173
```
If the backend isn't running, a yellow banner at the top of the site says so.

> To run the website without Java: `npm run dev:mock` uses in-browser demo data.

## Accounts and sign-in
- **Sign up** on `/register` (learners) with name, email and password. The password is stored only as a **BCrypt hash** in MySQL.
- **Sign in** on `/login` with the account type, email and password. A wrong password or unknown email is rejected.
- **Remember me** keeps you signed in after closing the browser; untick it to stay signed in only for that tab.
- **Teachers** choose a password when they apply and can sign in once an admin approves them.
- **Change password** in Settings (learner and teacher dashboards).

Demo accounts (all seeded learners and teachers use password `demo1234`):

| Role | Email | Password |
|---|---|---|
| Learner | ananya@questhive.demo | demo1234 |
| Teacher | gunjan@questhive.demo | demo1234 |
| Admin | admin@questhive.demo | admin123 (set in `application.properties`) |

"Reset demo data" in the footer calls `POST /api/admin/reset`.

## Demo script
1. Home → search "guitar" → Gunjan → pick a slot → Review → Pay → Confirmed (saved in MySQL).
2. Sign in as Gunjan → Bookings → "Mark completed".
3. Sign in as Ananya → Reviews → rate the class → it appears on Gunjan's profile with the new average.
4. Become a Teacher → apply → sign in as Admin → Teacher Verification → Approve → the teacher appears in Explore.
5. Gunjan → Availability → change hours → booking slots change immediately.

## REST API
| Method | Endpoint | Purpose |
|---|---|---|
| POST | `/api/auth/register`, `/api/auth/login`, `/api/auth/change-password` | Sign up / sign in / change password |
| GET | `/api/teachers` (`?include=all`), `/api/teachers/{id}` | Teachers |
| GET | `/api/teachers/{id}/slots?date=YYYY-MM-DD` | Free slots (availability minus booked and past) |
| GET | `/api/teachers/{id}/reviews`, `/bookings`, `/transactions` | Teacher data |
| PATCH / PUT | `/api/teachers/{id}`, `/api/teachers/{id}/availability` | Edit profile / hours |
| POST | `/api/teachers/apply` | Teacher application |
| GET / PATCH | `/api/learners/{id}`, `/bookings`, `/payments`, `/reviews` | Learner data |
| POST | `/api/payments` | Simulated payment → creates booking (409 if slot taken) |
| POST | `/api/bookings/{id}/cancel`, `/complete` | Booking status |
| GET / POST / DELETE | `/api/reviews` | Reviews (updates teacher rating) |
| GET / POST | `/api/notifications?role=&userId=`, `/read-all`, `/{id}/read` | Notifications |
| GET / POST / DELETE | `/api/subjects`, `/api/subjects/{categoryId}` | Subjects |
| GET / POST / PATCH | `/api/admin/stats`, `applications`, `teachers/{id}/approve`, `reject`, `status`, `learners`, `reports`, `reset` | Admin |

## Database tables (created by Hibernate)
`teachers`, `teacher_availability`, `teacher_qualifications`, `teacher_skills`, `teacher_languages`, `learners`, `bookings`, `payments`, `reviews`, `notifications`, `categories`, `category_subjects`.

## Deployment
See **[DEPLOY.md](DEPLOY.md)**: GitHub, plus Vercel (website), Render (Spring Boot, via `backend/Dockerfile`) and Aiven (MySQL). The backend reads `DB_URL`, `DB_USERNAME`, `DB_PASSWORD`, `CORS_ORIGINS` and `ADMIN_PASSWORD` from environment variables.

## Notes
- Payments are simulated; there is no real gateway.
- Sign-in state is kept in the browser. For a production deployment, add Spring Security with JWT tokens so every API call is authenticated.
- Teacher photos load from the internet; `npm run fetch-images --prefix frontend` saves them locally.
