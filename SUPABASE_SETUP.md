# Supabase setup for login

## 1. Get your project credentials

1. Open [Supabase Dashboard](https://supabase.com/dashboard) and select your project (or create one).
2. Go to **Settings → API**.
3. Copy:
   - **Project URL** (e.g. `https://xxxx.supabase.co`)
   - **anon public** key (under "Project API keys").

## 2. Add credentials in the app

In **script.js**, replace the placeholders at the top:

```js
const SUPABASE_URL = 'https://YOUR_PROJECT_REF.supabase.co';
const SUPABASE_ANON_KEY = 'YOUR_ANON_KEY';
```

Use your real Project URL and anon key.

## 3. Make sure your `users` table is compatible

- The app uses **Supabase Auth** for passwords, so it does **not** store a password in your `users` table.  
  Ensure the **`password_hash`** column allows `NULL` (or remove it if you don’t need it):

```sql
ALTER TABLE public.users
ALTER COLUMN password_hash DROP NOT NULL;
```

- Your table should have at least: `id` (uuid), `full_name`, `username`, `email`, `role`, `role_custom`, `is_guest`.  
  The app inserts `password_hash = null` on sign up.

## 4. Create user in database on sign up (trigger)

So that every new sign-up gets a row in `public.users`, run this in the Supabase **SQL Editor** (Dashboard → SQL Editor). This trigger runs when Supabase Auth creates a user and inserts the profile into your table.

```sql
-- Function: copy new auth user into public.users
CREATE OR REPLACE FUNCTION public.handle_new_auth_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.users (
    id,
    full_name,
    username,
    email,
    password_hash,
    role,
    role_custom,
    is_guest
  ) VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'full_name', ''),
    COALESCE(NEW.raw_user_meta_data->>'username', ''),
    COALESCE(NEW.email, ''),
    NULL,
    COALESCE(NEW.raw_user_meta_data->>'role', ''),
    NULLIF(TRIM(NEW.raw_user_meta_data->>'role_custom'), ''),
    false
  )
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$;

-- Trigger: run after a new user is created in auth.users
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_auth_user();
```

After this, every **Sign up** will create a user in both Supabase Auth and your `public.users` table.

## 5. Row Level Security (RLS) on `public.users`

In the Supabase **SQL Editor**, run:

```sql
-- Enable RLS on users
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;

-- Allow anyone to read email by username (needed for "login with username" lookup)
CREATE POLICY "Allow read email for login"
ON public.users FOR SELECT
TO anon
USING (true);

-- Allow users to read/update only their own row when authenticated
CREATE POLICY "Users can read own row"
ON public.users FOR SELECT
TO authenticated
USING (auth.uid() = id);

CREATE POLICY "Users can update own row"
ON public.users FOR UPDATE
TO authenticated
USING (auth.uid() = id);
```

You do **not** need an INSERT policy for the app: the trigger above inserts into `public.users` with elevated privileges. If you use "Confirm email" in Auth, the client cannot insert right after sign up, so the trigger is what creates the row.

## 6. Auth settings in Supabase (optional)

- **Authentication → Providers**: Email provider is enabled by default.
- **Authentication → URL Configuration**: Add your site URL and redirect URLs if you use a custom domain or redirect after password reset.

## 7. Password reset redirect

Forgot password sends an email with a link. By default the link goes to Supabase’s hosted page. The app sets `redirectTo` to your current page (`window.location.origin + pathname`). To handle “set new password” on your own page, you’d add a small script that checks for the reset token in the URL and calls `supabase.auth.updateUser({ password: newPassword })`; for a quick setup, using Supabase’s default reset page is enough.

---

After completing steps 1–5 (credentials, nullable `password_hash`, trigger, RLS), open your login page and try **Sign up** and **Sign in** (with email or username).
