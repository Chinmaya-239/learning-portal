# Marginalia — Learning Portal

A full-stack learning portal built for the GVCC assignment. Students log in, browse a
video library, watch lessons, drop multiple named bookmarks on any video, and jump
straight back to an exact timestamp. Built as a **MERN** app (MongoDB, Express,
React, Node) with JWT authentication.

## Tech stack

| Layer     | Choice                                                             |
|-----------|---------------------------------------------------------------------|
| Frontend  | React 18 + Vite, React Router, Tailwind CSS, Axios                  |
| Backend   | Node.js + Express                                                    |
| Database  | MongoDB + Mongoose                                                   |
| Auth      | JWT (JSON Web Tokens) + bcrypt password hashing                     |

Why MERN: it's a single JavaScript codebase end to end, MongoDB's document model
maps naturally onto "a user has many bookmarks on many videos," and it's the stack
explicitly listed in the assignment brief.

## Project structure

```
learning-portal/
├── backend/
│   ├── config/db.js              MongoDB connection
│   ├── models/                   User, Video, Bookmark, Progress schemas
│   ├── middleware/auth.js        JWT verification
│   ├── controllers/              Request handlers (auth, video, bookmark, progress)
│   ├── routes/                   Express routers
│   ├── seed.js                   Loads sample lesson videos
│   └── server.js                 App entry point
└── frontend/
    └── src/
        ├── api/axios.js          Pre-configured API client (attaches JWT)
        ├── context/AuthContext.jsx
        ├── components/
        │   ├── ScreenshotGuard.jsx   Screenshot/recording deterrence layer
        │   ├── ProgressRail.jsx      Video scrubber with clickable bookmark tabs
        │   ├── BookmarkPanel.jsx     Create / rename / delete / jump to bookmarks
        │   ├── VideoCard.jsx, Navbar.jsx, ProtectedRoute.jsx
        └── pages/
            ├── Login.jsx, Signup.jsx
            ├── Dashboard.jsx         Library + Continue Watching rail
            └── VideoPlayer.jsx       Player + bookmarks + progress tracking
```

## Getting started locally

### Prerequisites
- Node.js 18+
- A MongoDB instance — either local (`mongod`) or a free [MongoDB Atlas](https://www.mongodb.com/atlas) cluster

### 1. Backend

```bash
cd backend
cp .env.example .env      # then edit MONGO_URI and JWT_SECRET
npm install
npm run seed               # loads 4 sample lesson videos into the DB
npm run dev                # starts the API on http://localhost:5000
```

### 2. Frontend

```bash
cd frontend
cp .env.example .env       # VITE_API_URL should point at the backend
npm install
npm run dev                 # starts the app on http://localhost:5173
```

Sign up for a new account in the UI, then browse the seeded library.

## Feature walkthrough

### 1. Learning portal
Students sign up / log in (JWT-based), then see a library of lesson videos on the
dashboard, filterable by subject, plus a "Continue watching" rail built from stored
watch progress.

### 2. Screenshot protection
**Browsers give web pages no reliable, cross-platform API to detect or block an
OS-level screenshot** — that action happens outside the page, at the operating
system or window-manager level, and no combination of JavaScript/CSS can intercept
it (this is a deliberate browser security boundary, not a gap in this
implementation). What *is* achievable in a standard web stack, and what this
project implements in `ScreenshotGuard.jsx`, is a layered set of deterrents:

1. **Instant blur on tab/window blur** — the moment the tab loses focus or is
   hidden (`visibilitychange`, `window.blur`), the video is blurred and covered
   with a message. This defeats most screen-recording tools, since they capture
   whatever is rendered while the window is out of focus, and covers the brief
   window many OS screenshot shortcuts need.
2. **Traceable floating watermark** — the student's name, email, and a live
   timestamp are burned over the video and drift to a new position every few
   seconds so it can't be cropped out. Any screenshot that does get through is
   attributable to the account that produced it — the same approach used by
   real-world DRM-free learning platforms (Coursera, Udemy, etc. rely on this,
   not on blocking the capture itself).
3. **Disabled right-click, drag, and text selection** on the player area.
4. **Intercepted common capture/inspection shortcuts** where the browser allows
   it: <kbd>PrintScreen</kbd>, <kbd>Ctrl/Cmd+Shift+S</kbd> (snip),
   <kbd>Ctrl/Cmd+P</kbd> (print), <kbd>F12</kbd>, <kbd>Ctrl/Cmd+Shift+I</kbd>
   (DevTools), <kbd>Ctrl/Cmd+U</kbd> (view source). Each shows a warning flash.
5. **`controlsList="nodownload"` and disabled Picture-in-Picture** on the
   `<video>` element to discourage casual downloading.
6. **Print stylesheet** that hides the page content if someone tries to print it
   or "print to PDF."

**Documented limitation:** none of this can stop a phone camera pointed at the
screen, or an OS-level capture tool the browser has no visibility into. Fully
blocking screenshots requires a native app: Android's `WindowManager.LayoutParams.FLAG_SECURE`
or iOS's screen-capture/screen-recording detection APIs are the only real
guarantees, which is why native mobile apps (Flutter/React Native) are the right
choice if hard screenshot-blocking is a hard requirement rather than a deterrent.

### 3. Video bookmarks
- Bookmarks are stored per user, per video: `{ user, video, name (optional),
  timestamp }` (see `models/Bookmark.js`).
- Students can create as many bookmarks as they like on a single video from the
  player (the "+ mm:ss" button captures the current playback position).
- All bookmarks for a video are listed in the side panel, sorted by timestamp,
  and also rendered as small clickable tabs directly on the video's progress
  rail (the page's signature visual element — a book-spine-style scrubber).
- Clicking a bookmark (in the list or on the rail) seeks the `<video>` element's
  `currentTime` to that exact timestamp and resumes playback — verified with the
  02:02 / 10:45 / 18:30 example from the brief.
- Bookmarks can be renamed or deleted in place (bonus).

### Other implemented bonus features
- **Continue Watching** rail on the dashboard, driven by a `Progress` collection
  that records `lastPosition`, `percentWatched`, and `completed` per user/video,
  autosaved (debounced) while watching.
- **Watch progress indicator** — a thin progress bar on every video card.
- **Recently watched** data powers both the Continue Watching rail and the
  per-card progress indicator.
- **Authentication** — signup/login with hashed passwords (bcrypt) and JWT
  sessions.
- **Responsive UI** — the dashboard grid, player layout, and bookmark panel all
  reflow for mobile.

## API reference

| Method | Route                          | Description                                  |
|--------|---------------------------------|-----------------------------------------------|
| POST   | `/api/auth/signup`             | Create an account                             |
| POST   | `/api/auth/login`              | Log in, returns a JWT                         |
| GET    | `/api/auth/me`                 | Current user (auth required)                  |
| GET    | `/api/videos`                  | List all videos                               |
| GET    | `/api/videos/:id`               | Single video                                  |
| GET    | `/api/videos/continue-watching`| In-progress videos for the current user       |
| GET    | `/api/videos/recently-watched` | Watch history for the current user            |
| GET    | `/api/bookmarks/:videoId`      | All of the current user's bookmarks for a video|
| POST   | `/api/bookmarks`                | Create a bookmark `{ videoId, name, timestamp }` |
| PUT    | `/api/bookmarks/:id`            | Rename / move a bookmark                      |
| DELETE | `/api/bookmarks/:id`            | Delete a bookmark                             |
| GET    | `/api/progress/:videoId`        | Current user's progress on a video            |
| PUT    | `/api/progress/:videoId`        | Upsert watch position `{ lastPosition, duration }` |

All routes except signup/login require `Authorization: Bearer <token>`.

## Deployment

- **Backend**: deploy to Render / Railway / Fly.io. Set `MONGO_URI` (Atlas),
  `JWT_SECRET`, and `CLIENT_ORIGIN` (your deployed frontend URL) as environment
  variables.
- **Frontend**: deploy to Vercel / Netlify. Set `VITE_API_URL` to your deployed
  backend's `/api` URL.
- **Database**: [MongoDB Atlas](https://www.mongodb.com/atlas) free tier works
  fine for this project.

## Pushing to GitHub

```bash
cd learning-portal
git init
git add .
git commit -m "Initial commit: Marginalia learning portal"
git branch -M main
git remote add origin <your-empty-github-repo-url>
git push -u origin main
```

(`.env` files are already excluded via `.gitignore` — only `.env.example` is
committed.)

## Notes on sample content
`backend/seed.js` loads four sample lessons (Algebra, Physics, Biology, Data
Structures) pointing at small public-domain MP4 sample clips so the player works
out of the box. Swap in real lecture URLs (hosted on your own storage/CDN) in
`seed.js` or via `POST /api/videos` for real use.
