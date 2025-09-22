# TG Assignment – Full-Stack AI Chat App


#APP URL- https://tg-frontend-beige.vercel.app/


This project is a **React + Express (Node.js) full-stack web application** that implements:

- User authentication (JWT + Refresh Tokens with cookies)
- Session management (auto refresh, logout)
- **AI-powered chat interface (Google Gemini integration)**
- **Credits system with usage tracking**
- **Notifications management**
- Modularized frontend + backend structure
- Deployment on **Render (backend)** and **Vercel (frontend)**

---

## 🚀 Tech Stack

**Frontend**
- React + Vite
- Redux Toolkit (state management)
- Axios (API requests + interceptors)
- Tailwind CSS (styling)

**Backend**
- Node.js + Express
- PostgreSQL (NeonDB)
- JWT Authentication (access + refresh tokens)
- **Google Gemini API** (AI chat integration)
- Helmet, CORS, Morgan, Cookie-Parser (security & logging)

**Deployment**
- Backend → [Render](https://render.com)
- Frontend → [Vercel](https://vercel.com)

---

## 📂 Project Structure

```
tg-assignment/
│
├── backend/
│   ├── src/
│   │   ├── config/         # DB + env
│   │   ├── controllers/    # auth, messages, meta
│   │   ├── middlewares/    # auth, error handler
│   │   ├── routes/         # /auth, /messages, /meta
│   │   ├── services/       # token + user services
│   │   └── app.js          # express app config
│   └── server.js           # entrypoint
│
├── frontend/
│   ├── src/
│   │   ├── app/            # api.js, store.js
│   │   ├── features/       # auth, chat, ui
│   │   ├── pages/          # Login, Register, Chat
│   │   └── main.jsx        # entrypoint
│   ├── index.html
│   └── vite.config.js
```

---

## ⚙️ Local Setup

### 1. Clone the repo
```bash
git clone https://github.com/<your-username>/tg-assignment.git
cd tg-assignment
```

### 2. Backend setup
```bash
cd backend
npm install
```

Create `.env` in `backend/`:
```env
PORT=8080
DATABASE_URL=postgresql://<user>:<password>@<host>/<dbname>
JWT_SECRET=super_secret_key
ACCESS_TOKEN_MIN=15
REFRESH_TOKEN_DAYS=7
CORS_ORIGIN=http://localhost:5173
NODE_ENV=development
GEMINI_API_KEY=your_gemini_api_key_here
```

Run migrations (example for psql):
```bash
psql $DATABASE_URL -f schema.sql
```

Start backend:
```bash
npm run dev   # or nodemon src/server.js
```
**Backend runs at:** http://localhost:8080

### 3. Frontend setup
```bash
cd frontend
npm install
```

Create `.env` in `frontend/`:
```env
VITE_API_BASE_URL=http://localhost:8080
```

Start frontend:
```bash
npm run dev
```
**Frontend runs at:** http://localhost:5173

---

## 🔑 Environment Variables

### Backend (Render)
- `DATABASE_URL` → Neon/Postgres connection string
- `JWT_SECRET` → any random secret string
- `ACCESS_TOKEN_MIN` → 15
- `REFRESH_TOKEN_DAYS` → 7
- `CORS_ORIGIN` → frontend URL (local: `http://localhost:5173`, prod: `https://your-frontend.vercel.app`)
- `NODE_ENV` → production
- `GEMINI_API_KEY` → Google Gemini API key for AI chat functionality

### Frontend (Vercel)
- `VITE_API_BASE_URL` → backend URL (`https://your-backend.onrender.com`)

---

## ☁️ Deployment Guide

### 1. Deploy Backend (Render)
1. Push repo to GitHub
2. Connect backend folder to Render (as Node web service)
3. Set environment variables in Render dashboard
4. Deploy
5. Get URL like `https://tg-backend-xxxx.onrender.com`

### 2. Deploy Frontend (Vercel)
1. Push repo to GitHub
2. Connect frontend folder to Vercel
3. Set env var `VITE_API_BASE_URL=https://tg-backend-xxxx.onrender.com`
4. Deploy
5. Get URL like `https://tg-frontend-xxxx.vercel.app`

---

## 🔍 Verifying

### Local
- Open http://localhost:5173/login
- Enter credentials → should send POST to http://localhost:8080/auth/signin
- See logs in backend terminal (morgan)

### Production
- Open https://your-frontend.vercel.app
- Login → should send POST to https://your-backend.onrender.com/auth/signin
- Check Render logs for request hits

---

## ✅ Features Implemented

- ✅ JWT auth (access + refresh)
- ✅ Auto token rotation with cookies
- ✅ Redux auth state management
- ✅ **AI-powered chat with Google Gemini**
- ✅ **Credits system with usage tracking**
- ✅ **Notifications management**
- ✅ Modular frontend pages (Login, Register, Chat)
- ✅ Secure CORS + cookies handling
- ✅ Deployment on Render + Vercel

---

## 🔍 API Testing with Postman

This backend provides **authentication, chat (Gemini-powered)**, and **meta APIs** (credits + notifications). Use this guide to test everything in **Postman** against your deployed server.

**Backend (prod):**
```
https://tg-assignment.onrender.com
```

### 0) Setup in Postman
1. Create a **Collection** named `tg-assignment`
2. Go to **Collection → Variables** and add:

| Variable | Initial Value | Current Value (runtime) |
|----------|---------------|-------------------------|
| `base` | `https://tg-assignment.onrender.com` | same |
| `access_token` | *(empty)* | will be set automatically |
| `refresh_token` | *(empty)* | will be set automatically |
| `convoId` | *(empty)* | will be set automatically |

### 1) Health Check
**Request**
```
GET {{base}}/health
```

**Expected:** body:
```
OK
```

### 2) Signup (get first tokens)
```
POST {{base}}/auth/signup
Body: raw → JSON
{
  "username": "vignesh_postman",
  "password": "pass123"
}
```

**Scripts → Post-response** (save tokens):
```javascript
const res = pm.response.json();
if (res.access_token) pm.collectionVariables.set("access_token", res.access_token);
if (res.refresh_token) pm.collectionVariables.set("refresh_token", res.refresh_token);
```

Run this once to register. If user already exists, use **Signin**.

### 3) Signin (optional, same script as signup)
```
POST {{base}}/auth/signin
Body:
{
  "username": "vignesh_postman",
  "password": "pass123"
}
```

Reuses the same Post-response script to save tokens.

### 4) /auth/me (Protected)
```
GET {{base}}/auth/me
Authorization: Bearer {{access_token}}
```

**Expected:**
```json
{ 
  "id": 16, 
  "username": "vignesh_postman", 
  "credits": 1250, 
  "notifications_unread": 1 
}
```

### 5) Refresh Tokens

#### A) Refresh via body
```
POST {{base}}/auth/refresh
Body:
{ "refresh_token": "{{refresh_token}}" }
```

#### B) Refresh via cookie
```
POST {{base}}/auth/refresh
(no body)
```

**Scripts → Post-response** (for both):
```javascript
const res = pm.response.json();
if (res.access_token) pm.collectionVariables.set("access_token", res.access_token);
if (res.refresh_token) pm.collectionVariables.set("refresh_token", res.refresh_token);
```

✅ This rotates the refresh token and updates variables.

### 6) Conversations (Protected)

#### List conversations
```
GET {{base}}/messages/conversations
Auth: Bearer {{access_token}}
```

#### Create a new conversation
```
POST {{base}}/messages/new
Auth: Bearer {{access_token}}
Body:
{ "title": "AI Chat from Postman" }
```

**Scripts → Post-response**:
```javascript
const res = pm.response.json();
if (res.id) pm.collectionVariables.set("convoId", res.id);
```

### 7) Messages + Gemini Integration (Protected)

#### Send a user message (triggers Gemini)
```
POST {{base}}/messages/{{convoId}}
Auth: Bearer {{access_token}}
Body:
{ "text": "Write a two-line haiku about sunrise." }
```

**Expected:**
- Saves your user message
- Calls **Gemini** with the text
- Stores and returns an assistant reply
- Deducts 10 credits

Sample response:
```json
{
  "userMessage": { 
    "id": "...", 
    "role": "user", 
    "text": "Write a two-line haiku about sunrise." 
  },
  "assistantMessage": { 
    "id": "...", 
    "role": "assistant", 
    "text": "Golden rays awaken,\nNight fades into morning song." 
  },
  "spent": 10,
  "creditsLeft": 1240
}
```

#### Fetch conversation messages
```
GET {{base}}/messages/{{convoId}}
Auth: Bearer {{access_token}}
```

Shows full chat history (user + assistant messages).

### 8) Meta APIs

#### Credits
```
GET {{base}}/credits
Auth: Bearer {{access_token}}
```
→ `{ "count": 1240 }`

```
POST {{base}}/credits/spend
Auth: Bearer {{access_token}}
Body:
{ "amount": 50 }
```
→ `{ "remaining": 1190 }`

#### Notifications
```
GET {{base}}/notifications
Auth: Bearer {{access_token}}
```
→ Array of sample notifs (welcome + feature update).

```
POST {{base}}/notifications/read-all
Auth: Bearer {{access_token}}
```
→ `{ "ok": true }`

### 9) Logout
```
POST {{base}}/auth/logout
Auth: Bearer {{access_token}}
```

- Clears cookie, revokes refresh token
- **After this, calling `/auth/refresh` returns 401**

### ✅ Full Testing Flow
1. **Signup** → saves tokens
2. **/auth/me** → verify user, credits, notifications
3. **Refresh** → rotate tokens
4. **Conversations list/create** → get `convoId`
5. **Send message** → Gemini reply + credit deduction
6. **Fetch messages** → verify assistant reply stored
7. **Credits + Notifications** → test meta APIs
8. **Logout** → verify refresh revoked

---

## 🛠️ Troubleshooting

**401 on /auth/me**
→ Your access token expired. Run **Refresh**, then retry.

**400 "text required" on send message**
→ Your body must be `{ "text": "..." }`.

**CORS errors in browser**
→ Ensure backend `CORS_ORIGINS` includes your frontend domain.

**No tokens in other requests**
→ Confirm the **Post-response** scripts ran (check Collection → Variables for `access_token`/`refresh_token` Current Value).

**404 on /login in Vercel**
→ Check `VITE_API_BASE_URL` is pointing to backend URL.

**CORS errors**
→ Ensure `CORS_ORIGIN` in Render includes your frontend URL.

**Refresh token missing**
→ Confirm cookie-parser is enabled and cookies allowed in CORS.

---

## 📜 License

MIT License

