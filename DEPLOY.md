# Deploying QuestHive

| Part | Host | Free plan notes |
|---|---|---|
| Code | **GitHub** | Public or private repository |
| Database (MySQL) | **Aiven** | 1 GB storage; may be powered off after a long idle period (you can power it back on) |
| Backend (Spring Boot) | **Render** (Docker) | Sleeps after 15 min idle; the first request then takes about 1 minute |
| Website (React) | **Vercel** | Rebuilds automatically on every `git push` |

Order: **GitHub → Aiven → Render → Vercel → update Render CORS**.

---

## 1. Upload to GitHub

1. Create an account at github.com, then **New repository** → name `questhive` → leave "Add README" **unticked** → **Create repository**.
2. Install Git from git-scm.com (keep the default options).
3. Open CMD in `C:\QuestHive` and run (replace `YOUR-USERNAME`):

```bash
git init
git add .
git commit -m "QuestHive: React + Spring Boot + MySQL"
git branch -M main
git remote add origin https://github.com/YOUR-USERNAME/questhive.git
git push -u origin main
```

A browser window asks you to sign in to GitHub the first time.

Before pushing, check that your real MySQL password is **not** in `application.properties`. Put it in `backend/secrets.properties` instead (see `secrets.properties.example`). That file is git-ignored.

To upload later changes:
```bash
git add .
git commit -m "Describe what you changed"
git push
```

---

## 2. Create the MySQL database (Aiven)

1. Sign up at aiven.io → **Create service** → **MySQL** → **Free plan** → pick a region → create.
2. When it shows **Running**, open the service's **Overview** and note the **Host**, **Port**, **User** (`avnadmin`) and **Password**.
3. Your JDBC URL is:

```
jdbc:mysql://HOST:PORT/questhive?createDatabaseIfNotExist=true&sslMode=REQUIRED&characterEncoding=UTF-8
```

Tables and demo data are created automatically when the backend first starts.

---

## 3. Deploy the backend (Render)

1. Sign up at render.com with your GitHub account.
2. **New → Web Service** → choose the `questhive` repository.
3. Settings:
   - **Name:** `questhive-api`
   - **Root Directory:** `backend`
   - **Language / Runtime:** `Docker` (Render finds `backend/Dockerfile`)
   - **Instance type:** Free
   - **Health Check Path:** `/api/health`
4. **Environment Variables:**

| Key | Value |
|---|---|
| `DB_URL` | the JDBC URL from step 2 |
| `DB_USERNAME` | `avnadmin` |
| `DB_PASSWORD` | your Aiven password |
| `ADMIN_PASSWORD` | choose a new admin password |
| `CORS_ORIGINS` | `http://localhost:5173` for now (updated in step 5) |

5. **Create Web Service.** The first build takes about 5–10 minutes.
6. When it says **Live**, open `https://questhive-api.onrender.com/api/health` (use your own Render URL). It should show `{"ok":true,...}`.

---

## 4. Deploy the website (Vercel)

1. Sign up at vercel.com with GitHub → **Add New → Project** → import `questhive`.
2. Settings:
   - **Root Directory:** `frontend`
   - **Framework Preset:** Vite (auto-detected)
3. **Environment Variables:** `VITE_API_URL` = `https://questhive-api.onrender.com/api` (your Render URL + `/api`).
4. **Deploy.** You get a link like `https://questhive.vercel.app`.

`frontend/vercel.json` makes page refreshes on routes like `/explore` work.

---

## 5. Connect them (CORS)

In Render → your service → **Environment** → set:

```
CORS_ORIGINS=https://questhive.vercel.app,https://*.vercel.app,http://localhost:5173
```

Use your real Vercel address. Save; Render restarts the backend. Open your Vercel link and sign in with `ananya@questhive.demo` / `demo1234`.

---

## Troubleshooting

| Problem | Fix |
|---|---|
| Yellow "server isn't running" banner | The free backend is waking up. Wait about a minute and click **Retry**. |
| Browser console says "CORS" | `CORS_ORIGINS` on Render must contain your exact Vercel address (no trailing `/`). |
| Render log: `Communications link failure` | Check `DB_URL`, host and port; make sure the Aiven service is **Running**. |
| Render log: `Access denied for user` | Check `DB_USERNAME` / `DB_PASSWORD`. |
| 404 when refreshing a page on Vercel | Make sure `frontend/vercel.json` was pushed. |
| Changes don't appear | `git push`; Vercel and Render redeploy automatically. |
