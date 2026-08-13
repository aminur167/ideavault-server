# IdeaVault API

The IdeaVault API provides authenticated startup-idea CRUD, comments, bookmarks, user synchronization, search and filtering for the IdeaVault client application.

## Features

- Firebase ID-token verification followed by server-issued JWT authentication.
- Protected create, update, delete, bookmark, comment, and profile endpoints.
- MongoDB idea search using case-insensitive `$regex`, category/date filters, pagination, and sorting.
- Trending ideas aggregation using MongoDB `$limit: 6`.
- User profile synchronization for Firebase-authenticated users.
- Idempotent starter-idea seeding through `npm run seed`.

## Run locally

```bash
npm install
npm run dev
```

Copy `.env.example` to `.env` and provide valid local credentials. Never commit `.env` or `service-account.json`.

To populate initial demonstration ideas:

```bash
npm run seed
```

## Deploy to Vercel

1. Import this repository in Vercel as a Node.js project.
2. Add these environment variables in **Settings → Environment Variables**:

   - `MONGO_URI`
   - `JWT_SECRET` — use a new long random value.
   - `CLIENT_URL=https://YOUR-CLIENT.vercel.app`
   - `FIREBASE_SERVICE_ACCOUNT` — paste the complete service-account JSON as one environment-variable value; do not upload or commit the file.

3. Deploy. The root endpoint verifies the API is live, and `/api/stats` confirms MongoDB-backed statistics.
4. After the client is deployed, update `CLIENT_URL` to its exact Vercel URL and redeploy the API if Vercel does not do so automatically.

## Repository

https://github.com/aminur167/ideavault-server
