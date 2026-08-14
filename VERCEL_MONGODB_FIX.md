# Vercel + MongoDB Fix

## Why login/register was timing out

The Vercel serverless function imports `backend/server.js`, but the local `bootstrap()` function is intentionally not executed on Vercel. The old code therefore allowed Mongoose queries to run before a MongoDB connection had been established. Mongoose buffered `User.findOne()` until its timeout, producing:

`Operation users.findOne() buffering timed out after 10000ms`

The updated server now connects to MongoDB before every `/api/*` request. The connection is cached globally and reused by warm Vercel instances.

## Required Vercel environment variables

Set these in Vercel Project Settings → Environment Variables:

- `NODE_ENV=production`
- `MONGODB_URI=mongodb+srv://USERNAME:URL_ENCODED_PASSWORD@CLUSTER_HOST/campus_management?retryWrites=true&w=majority&appName=Cluster0`
- `JWT_SECRET=<32+ character random secret>`
- `FRONTEND_URL=https://YOUR-PROJECT.vercel.app`
- `MAX_FILE_SIZE_MB=5`
- `COOKIE_NAME=cmp_token`
- `USE_GOOGLE_DNS=false`

Do not commit `.env`.

## MongoDB Atlas

MongoDB Atlas → Security → Database Access: create a database user and use that username/password in `MONGODB_URI`.

MongoDB Atlas → Security → Network Access: the Vercel serverless function needs access to the cluster. For a simple Vercel deployment, allow `0.0.0.0/0` and rely on a strong database username/password. If your Atlas/Vercel plan supports restricted/static egress, use that instead.

If the MongoDB password contains `@`, `:`, `/`, `?`, `#`, `%`, or other URI-reserved characters, URL-encode the password before putting it in the connection string.

## Test after deployment

Open:

`https://YOUR-PROJECT.vercel.app/api/health`

Expected:

```json
{
  "ok": true,
  "database": "connected"
}
```

Then test:

1. Register a new student.
2. Confirm the `users` collection receives the account.
3. Confirm the `studentprofiles` collection receives the profile shell.
4. Sign in.
5. Save the profile.
6. Upload a PDF/DOC/DOCX resume.
7. Apply to a placement.
8. Register for training.
9. Add an achievement.
10. Complete a test and confirm a `testresults` document is created.
11. Open Hiring Status.
12. Check the Admin portal.
