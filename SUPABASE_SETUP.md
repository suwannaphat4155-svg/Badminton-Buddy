# Supabase setup

## 1. Create the database

1. Create a Supabase project.
2. Open **SQL Editor** in the Supabase dashboard.
3. Run the contents of `supabase/schema.sql` to create the sessions table and owner-only Row Level Security policies.
4. In **Project Settings > API**, copy the Project URL and the `anon`/publishable key. Never use or expose the `service_role` key in this browser app.
5. In **Authentication > URL Configuration**, set the Site URL to the deployed Vercel URL and add the local development URL (for example `http://localhost:5173/**`) plus the Vercel domain (for example `https://your-app.vercel.app/**`) to Redirect URLs.

## 2. Configure local development

Create `.env.local` in the project root using `.env.example` as a template, then fill in:

```env
VITE_SUPABASE_URL=https://YOUR_PROJECT_ID.supabase.co
VITE_SUPABASE_ANON_KEY=YOUR_SUPABASE_ANON_KEY
```

`.env.local` is ignored by Git. Restart `npm run dev` after changing environment variables. Create an administrator account from the app's sign-up screen; if email confirmation is enabled, confirm the message before signing in.

## 3. Configure Vercel

In the Vercel project, open **Settings > Environment Variables** and add `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` for Production (and Preview/Development if needed). Redeploy after saving them.

## Data behavior

- After signing in, the app imports sessions stored in this browser into the account once, without replacing session IDs already present online.
- New, edited, and deleted sessions are synced to Supabase. RLS restricts each account to its own sessions.
- Deleting a session is permanent. Cloud storage persists until the account or record is deleted, subject to the Supabase project's plan and backup retention. Export/back up important data separately for long-term archival.
- Without the two environment variables, the app stays in local-only mode and shows a notice; it does not claim that data is online.
