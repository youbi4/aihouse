# Supabase Setup Guide - AI House UHBC

## Project Information
- **Supabase Project URL:** https://rmmgzviytfpwedstuhly.supabase.co
- **Anon Key:** eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJtbWd6dml5dGZwd2Vkc3R1aGx5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzI1NzAwNTYsImV4cCI6MjA4ODE0NjA1Nn0.KemNQ3DUcyDwtCL5MZuFmcL-0COiIs2-yyoXxfIZ1P8

---

## Current Issues & Solutions

### Issue 1: 500 Error on `/rest/v1/users` Endpoint
**Error:** Failed to load resource: the server responded with a status of 500

**Possible Causes:**
1. `users` table doesn't exist
2. Row Level Security (RLS) policies are blocking anon user access
3. Missing columns in query
4. Table structure doesn't match expected schema

**Fix Instructions:**
1. Log into your Supabase Dashboard
2. Navigate to SQL Editor
3. Run the following SQL to create/verify the `users` table:

```sql
CREATE TABLE IF NOT EXISTS public.users (
  id UUID PRIMARY KEY DEFAULT auth.uid(),
  email TEXT UNIQUE NOT NULL,
  username TEXT UNIQUE,
  full_name TEXT,
  bio TEXT,
  role TEXT DEFAULT 'Student',
  department TEXT,
  avatar_url TEXT,
  is_admin BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW())
);

-- Enable RLS
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;

-- Allow public read access for username queries
CREATE POLICY "Allow public read" ON public.users
  FOR SELECT USING (true);

-- Allow users to update their own profile
CREATE POLICY "Allow users to update own profile" ON public.users
  FOR UPDATE USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

-- Allow users to insert (register)
CREATE POLICY "Allow users to insert own profile" ON public.users
  FOR INSERT WITH CHECK (auth.uid() = id);
```

### Issue 2: 500 Error on `/auth/v1/signup` Endpoint
**Error:** Failed to load resource: the server responded with a status of 500

**Possible Causes:**
1. Email already exists in auth table
2. Password validation failing
3. User registration trigger error
4. Database constraint violation

**Fix Instructions:**
1. **Clear invalid data:** In Supabase Dashboard → Authentication → Users, remove any test users with errors
2. **Check email format:** Ensure signup form sends valid email
3. **Verify password requirements:** Supabase requires minimum 6 characters
4. **Test with curl:**

```bash
curl -X POST https://rmmgzviytfpwedstuhly.supabase.co/auth/v1/signup \
  -H "apikey: YOUR_ANON_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "testPassword123"
  }'
```

---

## Database Schema Requirements

### users table
```
- id: UUID (Primary Key, auto-generated from auth.uid())
- email: TEXT UNIQUE NOT NULL
- username: TEXT UNIQUE (for profile lookups)
- full_name: TEXT
- bio: TEXT
- role: TEXT (Student, Faculty, Admin, etc.)
- department: TEXT (CS, Engineering, etc.)
- avatar_url: TEXT (URL to profile picture)
- is_admin: BOOLEAN DEFAULT FALSE
- created_at: TIMESTAMP (auto-set)
- updated_at: TIMESTAMP (auto-set)
```

### events table (optional, for events feature)
```
- id: UUID PRIMARY KEY
- title: TEXT NOT NULL
- description: TEXT
- location: TEXT
- event_date: TIMESTAMP
- image_url: TEXT
- capacity: INTEGER
- created_by: UUID (FOREIGN KEY → users.id)
- created_at: TIMESTAMP (auto-set)
```

### event_registrations table (optional)
```
- id: UUID PRIMARY KEY
- event_id: UUID (FOREIGN KEY → events.id)
- user_id: UUID (FOREIGN KEY → users.id)
- registered_at: TIMESTAMP (auto-set)
```

---

## Row Level Security (RLS) Policies

### For Users Table
1. **Public Read Access:** Anyone can read user profiles
2. **Own Profile Update:** Users can only update their own profile
3. **Own Profile Insert:** Users can only create their own profile on signup

### For Events Table (if applicable)
1. **Public Read:** Anyone can view events
2. **Authorized Create:** Only logged-in users can create events
3. **Author Delete:** Only event creator can delete

---

## Testing the Setup

### 1. Test User Registration
```javascript
const { user, error } = await supabase.auth.signUp({
  email: 'test@example.com',
  password: 'testPassword123'
});

if (error) {
  console.error('Signup failed:', error.message);
} else {
  console.log('Signup successful:', user.id);
}
```

### 2. Test User Lookup by Username
```javascript
const { data, error } = await supabase
  .from('users')
  .select('*')
  .eq('username', 'johndoe')
  .limit(1);

if (error) {
  console.error('Query failed:', error.message);
} else {
  console.log('User found:', data);
}
```

### 3. Test Current User Session
```javascript
const { data } = await supabase.auth.getSession();
if (data.session) {
  console.log('User logged in:', data.session.user.email);
} else {
  console.log('No active session');
}
```

---

## Troubleshooting Checklist

- [ ] Supabase project is active and not paused
- [ ] Anon key is correct and matches `SUPABASE_ANON_KEY` in auth.js
- [ ] `users` table exists with all required columns
- [ ] RLS policies are enabled on `users` table
- [ ] RLS policies allow public SELECT (read)
- [ ] No email validation/confirmation required for auth (optional setting)
- [ ] Database has no constraint violations
- [ ] JavaScript Supabase client loads successfully
- [ ] Network requests show 200/201 status (not 500)
- [ ] Browser console shows no auth errors

---

## Common Error Messages & Fixes

| Error | Cause | Solution |
|-------|-------|----------|
| 500 on signup | Email exists | Delete old account or use different email |
| 500 on signup | Invalid password | Use 8+ characters with mix of cases |
| 500 on users query | RLS blocking anon | Enable public SELECT policy |
| 500 on users query | Column doesn't exist | Add missing columns to table |
| PGRST116 | Table doesn't exist | Run CREATE TABLE script |
| JWT expired | Auth session old | Clear localStorage, re-login |

---

## Code Examples

### User Registration Flow
```javascript
async function registerUser(email, password, userData) {
  try {
    // 1. Create auth user
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email,
      password
    });
    
    if (authError) throw authError;
    
    // 2. Create user profile in users table
    const { data, error } = await supabase
      .from('users')
      .insert([{
        id: authData.user.id,
        email,
        ...userData
      }])
      .select()
      .single();
    
    if (error) throw error;
    
    return { success: true, user: data };
  } catch (error) {
    console.error('Registration failed:', error.message);
    return { success: false, error };
  }
}
```

### User Login Flow
```javascript
async function loginUser(email, password) {
  try {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password
    });
    
    if (error) throw error;
    
    // Fetch full user profile
    const { data: profile } = await supabase
      .from('users')
      .select('*')
      .eq('id', data.user.id)
      .single();
    
    // Store in localStorage
    localStorage.setItem('currentUser', JSON.stringify(profile));
    
    return { success: true, user: profile };
  } catch (error) {
    console.error('Login failed:', error.message);
    return { success: false, error };
  }
}
```

---

## Next Steps

1. **Create Database Tables:** Run the SQL scripts in Supabase SQL Editor
2. **Configure RLS Policies:** Apply the security policies
3. **Test Endpoints:** Use the testing code examples
4. **Monitor Logs:** Check Supabase Dashboard → Logs for errors
5. **Debug Issues:** Refer to troubleshooting checklist
6. **Update Frontend:** Ensure auth.js matches current schema

---

## Additional Resources

- [Supabase Auth Documentation](https://supabase.com/docs/guides/auth)
- [Supabase RLS Guide](https://supabase.com/docs/guides/auth/row-level-security)
- [Supabase Database Guide](https://supabase.com/docs/guides/database)
- [Supabase JavaScript Client](https://supabase.com/docs/reference/javascript)
