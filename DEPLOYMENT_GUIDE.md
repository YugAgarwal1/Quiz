# 🌐 Free Hosting Guide for Quiz Bird

Quiz Bird is built with **Node.js, SQLite, and React (Vite)**. The most suited 100% free hosting platform is **[Render.com](https://render.com)** because it:
1. Runs full Node.js servers with native SQLite (`node:sqlite`).
2. Offers a **Free Web Service** tier (no credit card required).
3. Serves your React frontend and Node.js REST API on a **single unified URL** with zero CORS problems.

---

## 🚀 Recommended: 1-Click Unified Deployment on Render.com (100% Free)

Both frontend and backend deploy together as a single fullstack service.

### Step 1: Sign Up on Render
1. Go to **[https://render.com](https://render.com)**.
2. Click **"Get Started for Free"** and sign in with your GitHub account (**YugAgarwal1**).

### Step 2: Create New Web Service
1. On your Render dashboard, click **"New +"** (top-right) and select **"Web Service"**.
2. Select **"Build and deploy from a Git repository"** and choose your repository:
   - **Repository:** `YugAgarwal1/Quiz`
3. Configure the settings:
   - **Name:** `quiz-bird` (or any name you prefer)
   - **Region:** Any (e.g. *Singapore* or *Oregon*)
   - **Branch:** `main`
   - **Root Directory:** *(leave blank)*
   - **Runtime:** `Node`
   - **Build Command:** `npm run build`
   - **Start Command:** `npm start`
   - **Instance Type:** `Free`

### Step 3: Add Environment Variables
Under the **Environment Variables** section, add:
| Key | Value |
| :--- | :--- |
| `NODE_ENV` | `production` |
| `JWT_SECRET` | *(Click "Generate" or type a secret key)* |
| `JWT_EXPIRES_IN` | `7d` |
| `DATABASE_PATH` | `./data/quizbird.sqlite` |
| `ADMIN_DEFAULT_EMAIL` | `admin@quizbird.com` |
| `ADMIN_DEFAULT_PASSWORD` | `Admin@123456` |

### Step 4: Click "Deploy Web Service"
- Render will automatically install dependencies, build your Vite React frontend into `quiz-frontend/dist`, seed the database, and launch the server.
- Your live website will be available at:
  👉 **`https://quiz-bird.onrender.com`** (or your chosen name)

### ⚠️ Important: Database Persistence on Cloud Hosts (Render Free vs Persistent Disk)
- **Render Free Tier Ephemeral Disk**: Render Free web services spin down after 15 minutes of inactivity. On wake-up or rebuild, ephemeral containers reset the local filesystem to the Git commit state.
- **To keep registered users permanently across container restarts**:
  1. **Render Disk (Recommended on Render)**: Go to your Render Web Service dashboard -> **Disks** -> **Add Disk** (Name: `quizbird-data`, Mount Path: `/opt/render/project/src/quiz-backend/data`, Size: 1GB).
  2. **Free Cloud Database**: Alternatively, connect to an external free cloud database service (e.g. Turso LibSQL or Supabase) which stores data in the cloud instead of container local storage.

---

## ⚡ Alternative Option: Split Hosting (Vercel + Render)

If you prefer hosting the React frontend on **Vercel** for instant global edge CDN:

### 1. Backend on Render:
- Create a Web Service for `quiz-backend`.
- Root Directory: `quiz-backend`
- Build Command: `npm install`
- Start Command: `npm start`
- Copy your Render backend URL (e.g. `https://quiz-bird-api.onrender.com`).

### 2. Frontend on Vercel:
- Go to **[https://vercel.com](https://vercel.com)** and import `YugAgarwal1/Quiz`.
- Root Directory: `quiz-frontend`
- Framework Preset: `Vite`
- Add Environment Variable:
  - `VITE_API_URL` = `https://quiz-bird-api.onrender.com/api`
- Click **Deploy**!
