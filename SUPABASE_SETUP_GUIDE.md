# Supabase Setup Guide - AI House UHBC

Complete guide to setting up your Supabase database and connecting it with the frontend JavaScript code.

---

## Table of Contents
1. [Initial Supabase Setup](#initial-setup)
2. [Database Schema Creation](#database-schema)
3. [Row Level Security (RLS) Policies](#row-level-security)
4. [Frontend JavaScript Integration](#frontend-integration)
5. [Authentication Flow](#authentication-flow)
6. [Testing the Setup](#testing)

---

## Initial Setup

### Step 1: Create a Supabase Project

1. Go to [supabase.com](https://supabase.com) and sign up/login
2. Click "New Project"
3. Fill in:
   - **Project Name**: `aihouse-uhbc`
   - **Database Password**: Save this securely
   - **Region**: Select closest to your location
4. Click "Create new project" and wait for it to initialize

### Step 2: Get Your Credentials

1. Once your project is created, go to **Settings > API**
2. Find and copy:
   - **Project URL**: (starts with `https://`)
   - **Anon Key**: (public key for client-side use)
3. In your project, open `js/utils.js` and update:

```javascript
const SUPABASE_URL = 'YOUR_PROJECT_URL';
const SUPABASE_ANON_KEY = 'YOUR_ANON_KEY';
```

---

## Database Schema

### Step 3: Create Users Table

Go to **SQL Editor** in Supabase and run this SQL:

```sql
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT auth.uid(),
  email TEXT UNIQUE NOT NULL,
  full_name TEXT,
  username TEXT UNIQUE,
  role TEXT DEFAULT 'Student',
  department TEXT,
  bio TEXT,
  avatar_url TEXT,
  is_admin BOOLEAN DEFAULT FALSE,
  other_role TEXT,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);
```

### Step 4: Create Events Table

```sql
CREATE TABLE events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  description TEXT,
  location TEXT,
  event_date DATE NOT NULL,
  event_time TIME,
  category TEXT,
  image_url TEXT,
  created_by UUID REFERENCES users(id) ON DELETE SET NULL,
  capacity INT,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);
```

### Step 5: Create Event Registrations Table

```sql
CREATE TABLE event_registrations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  event_id UUID REFERENCES events(id) ON DELETE CASCADE,
  registered_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(user_id, event_id)
);
```

### Step 6: Create User Projects Table (Optional)

```sql
CREATE TABLE user_projects (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  status TEXT DEFAULT 'In Progress',
  updated_at TIMESTAMP DEFAULT NOW(),
  created_at TIMESTAMP DEFAULT NOW()
);
```

---

## Row Level Security (RLS)

### Step 7: Enable RLS on All Tables

For each table (users, events, event_registrations, user_projects):

1. Go to **Authentication > Policies**
2. Select the table
3. Click "Enable RLS"

### Step 8: Create RLS Policies

#### Users Table Policies

**Policy 1: Users can view their own profile**
```sql
CREATE POLICY "Users can view their own profile"
ON users
FOR SELECT
USING (auth.uid() = id);
```

**Policy 2: Users can update their own profile**
```sql
CREATE POLICY "Users can update their own profile"
ON users
FOR UPDATE
USING (auth.uid() = id);
```

**Policy 3: Admins can view all users**
```sql
CREATE POLICY "Admins can view all users"
ON users
FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM users
    WHERE id = auth.uid() AND is_admin = TRUE
  )
);
```

**Policy 4: Admins can update any user**
```sql
CREATE POLICY "Admins can update any user"
ON users
FOR UPDATE
USING (
  EXISTS (
    SELECT 1 FROM users
    WHERE id = auth.uid() AND is_admin = TRUE
  )
);
```

**Policy 5: Anyone can view public user info**
```sql
CREATE POLICY "Public user profiles are viewable"
ON users
FOR SELECT
USING (TRUE);
```

#### Events Table Policies

**Policy 1: Anyone can view events**
```sql
CREATE POLICY "Anyone can view events"
ON events
FOR SELECT
USING (TRUE);
```

**Policy 2: Only admins can create events**
```sql
CREATE POLICY "Only admins can create events"
ON events
FOR INSERT
WITH CHECK (
  EXISTS (
    SELECT 1 FROM users
    WHERE id = auth.uid() AND is_admin = TRUE
  )
);
```

**Policy 3: Only event creator or admin can update**
```sql
CREATE POLICY "Event creator or admin can update"
ON events
FOR UPDATE
USING (
  created_by = auth.uid() OR
  EXISTS (
    SELECT 1 FROM users
    WHERE id = auth.uid() AND is_admin = TRUE
  )
);
```

**Policy 4: Only admin can delete events**
```sql
CREATE POLICY "Only admin can delete events"
ON events
FOR DELETE
USING (
  EXISTS (
    SELECT 1 FROM users
    WHERE id = auth.uid() AND is_admin = TRUE
  )
);
```

#### Event Registrations Table Policies

**Policy 1: Users can view their own registrations**
```sql
CREATE POLICY "Users can view their own registrations"
ON event_registrations
FOR SELECT
USING (user_id = auth.uid());
```

**Policy 2: Users can register for events**
```sql
CREATE POLICY "Users can register for events"
ON event_registrations
FOR INSERT
WITH CHECK (user_id = auth.uid());
```

**Policy 3: Users can cancel their registration**
```sql
CREATE POLICY "Users can cancel their registration"
ON event_registrations
FOR DELETE
USING (user_id = auth.uid());
```

**Policy 4: Admins can view all registrations**
```sql
CREATE POLICY "Admins can view all registrations"
ON event_registrations
FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM users
    WHERE id = auth.uid() AND is_admin = TRUE
  )
);
```

---

## Frontend Integration

### Step 9: Update utils.js

The `js/utils.js` file contains all database operations. Make sure it has:

1. **Supabase client initialization**:
```javascript
const supabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
```

2. **User registration**:
```javascript
async function registerUser(email, password, userData) {
  // Creates auth user and users table entry
}
```

3. **User login**:
```javascript
async function loginUser(email, password) {
  // Authenticates user and stores in localStorage
}
```

4. **Get current user**:
```javascript
function getCurrentUser() {
  return JSON.parse(localStorage.getItem('currentUser'));
}
```

5. **Get user by ID**:
```javascript
async function getUserById(userId) {
  // Fetches user profile from database
}
```

6. **Update user**:
```javascript
async function updateUser(userId, data) {
  // Updates user profile with new data
}
```

### Step 10: Example Function Calls

#### Register a New User

```javascript
const email = "user@example.com";
const password = "securePassword123";
const userData = {
  full_name: "John Doe",
  username: "johndoe",
  role: "Student",
  department: "Computer Science"
};

const result = await registerUser(email, password, userData);
if (result.success) {
  console.log("User registered successfully!");
}
```

#### Login User

```javascript
const result = await loginUser("user@example.com", "securePassword123");
if (result.success) {
  // User is now logged in, stored in localStorage
  window.location.href = '/pages/homepage.html';
}
```

#### Update User Profile

```javascript
const user = getCurrentUser();
const updateData = {
  full_name: "Jane Doe",
  bio: "AI researcher",
  role: "Researcher"
};

const result = await updateUser(user.id, updateData);
if (result.success) {
  showNotification("Profile updated!", "success");
}
```

#### Create an Event (Admin Only)

```javascript
async function createEvent(eventData) {
  const { data, error } = await supabase
    .from('events')
    .insert([{
      title: eventData.title,
      description: eventData.description,
      location: eventData.location,
      event_date: eventData.event_date,
      category: eventData.category,
      image_url: eventData.image_url,
      capacity: eventData.capacity,
      created_by: getCurrentUser().id
    }]);
  
  return { success: !error, data, error };
}
```

#### Register for an Event

```javascript
async function registerEvent(eventId) {
  const user = getCurrentUser();
  const { data, error } = await supabase
    .from('event_registrations')
    .insert([{
      user_id: user.id,
      event_id: eventId
    }]);
  
  return { success: !error, data, error };
}
```

#### Get All Events

```javascript
async function getAllEvents() {
  const { data, error } = await supabase
    .from('events')
    .select('*');
  
  return { success: !error, data, error };
}
```

#### Get User's Registered Events

```javascript
async function getUserEvents(userId) {
  const { data, error } = await supabase
    .from('event_registrations')
    .select('events(*)')
    .eq('user_id', userId);
  
  return { success: !error, data, error };
}
```

---

## Authentication Flow

### Step 11: Understand the Auth Flow

1. **Registration** (`index.html`):
   - User enters email, password, name, role
   - `registerUser()` creates auth account & user record
   - User redirected to homepage on success

2. **Login** (`index.html`):
   - User enters email & password
   - `loginUser()` authenticates with Supabase Auth
   - User data stored in `localStorage` as `currentUser`
   - User redirected to homepage

3. **Session Management**:
   - `getCurrentUser()` retrieves user from localStorage
   - On logout, `localStorage.removeItem('currentUser')`
   - Guest users redirected when accessing protected pages

4. **Admin Functionality**:
   - Check `is_admin` flag in user's database record
   - If admin, show admin dashboard link in navbar
   - Admin page shows user management and event controls

---

## Testing

### Step 12: Test Your Setup

#### Test 1: Register a New User

1. Open `index.html` in browser
2. Click "Sign up" tab
3. Fill in:
   - Full Name: "Test User"
   - Username: "testuser"
   - Email: "test@example.com"
   - Password: "TestPass123!"
   - Role: "Student"
4. Click "Sign up"
5. Should see success notification and redirect to homepage

#### Test 2: Login

1. Open `index.html`
2. Fill in login form with registered email/password
3. Click "Sign in"
4. Should redirect to homepage with profile icon visible

#### Test 3: Update Profile

1. Click profile icon (top right)
2. Click "Profile"
3. Click "Edit Profile" button
4. Update name, role, bio
5. Click "Save Changes"
6. Should see success alert

#### Test 4: View Events (Admin)

1. Make yourself an admin in Supabase:
   - Go to **Table Editor > users**
   - Find your user row
   - Set `is_admin` to `TRUE`
   - Save
2. Logout and login again
3. Click profile icon
4. Should see "Admin Dashboard" option
5. Click it to access admin panel

#### Test 5: Create Event (Admin)

1. Go to admin dashboard
2. Click "Events" tab
3. Click "Add Event"
4. Fill in event details
5. Click "Create"
6. Should see event in events list

---

## Troubleshooting

### Issue: "Failed to connect to Supabase"

**Solution**: 
- Check SUPABASE_URL and SUPABASE_ANON_KEY in utils.js
- Verify they match your Supabase project credentials
- Ensure Supabase project is active

### Issue: "User not found" error

**Solution**:
- Check that RLS policies are set up correctly
- Verify user exists in `users` table
- Check localStorage for `currentUser` object

### Issue: Can't update profile

**Solution**:
- Ensure RLS policy "Users can update their own profile" exists
- Check browser console for specific error
- Verify user is logged in

### Issue: Events page shows no events

**Solution**:
- Check events exist in `events` table in Supabase
- Verify RLS policy "Anyone can view events" is enabled
- Check JavaScript console for errors

---

## Database Relationship Diagram

```
users (1) ──→ (many) events
    ↓
    ├─→ created_by → events.created_by
    └─→ (many) event_registrations

event_registrations (many) ──→ (1) events
```

---

## Environment Variables

Store these in your `.env.local` file (create if doesn't exist):

```
VITE_SUPABASE_URL=YOUR_PROJECT_URL
VITE_SUPABASE_ANON_KEY=YOUR_ANON_KEY
```

Update `js/utils.js` to read from environment:

```javascript
const SUPABASE_URL = process.env.VITE_SUPABASE_URL;
const SUPABASE_ANON_KEY = process.env.VITE_SUPABASE_ANON_KEY;
```

---

## Next Steps

1. **Implement real avatar uploads** using Supabase Storage
2. **Add email verification** using Supabase Auth email confirmations
3. **Implement password reset** functionality
4. **Add search and filtering** for events and users
5. **Add notifications** for event registration confirmations
6. **Implement user roles** with more granular permissions

---

## Resources

- [Supabase Documentation](https://supabase.com/docs)
- [Supabase JavaScript Client](https://supabase.com/docs/reference/javascript/introduction)
- [PostgreSQL Documentation](https://www.postgresql.org/docs/)
- [Row Level Security Guide](https://supabase.com/docs/guides/auth/row-level-security)

---

**Last Updated**: 2025
