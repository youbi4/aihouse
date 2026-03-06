# Quick Start Guide - AI House UHBC

Get up and running in 5 minutes!

---

## Step 1: Clone or Download the Project

```bash
git clone https://github.com/youbi4/aihouse.git
cd aihouse
```

---

## Step 2: Set Up Supabase (5 minutes)

1. Go to [supabase.com](https://supabase.com)
2. Click "New Project"
3. Fill in:
   - Project Name: `aihouse-uhbc`
   - Create a database password
   - Choose your region
4. Click "Create new project" and wait ~2 min

---

## Step 3: Get Your Credentials

1. Go to **Settings > API**
2. Copy:
   - **Project URL** (gray box)
   - **Anon Key** (public)

---

## Step 4: Update js/utils.js

Open `js/utils.js` and update line 1-2:

```javascript
const SUPABASE_URL = 'YOUR_PROJECT_URL_HERE';
const SUPABASE_ANON_KEY = 'YOUR_ANON_KEY_HERE';
```

Replace with your actual credentials from Step 3.

---

## Step 5: Create Database Tables

Go back to Supabase > **SQL Editor** and paste this:

```sql
-- Users Table
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

-- Events Table
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

-- Event Registrations Table
CREATE TABLE event_registrations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  event_id UUID REFERENCES events(id) ON DELETE CASCADE,
  registered_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(user_id, event_id)
);
```

Click "Run" and wait for tables to be created.

---

## Step 6: Enable Row Level Security (RLS)

For each table, click on the table name > **RLS** > **Enable RLS**

Then go to **Authentication > Policies** and add these policies:

### Users Table

**Policy 1:**
```sql
CREATE POLICY "Users can view their own profile"
ON users FOR SELECT USING (auth.uid() = id);
```

**Policy 2:**
```sql
CREATE POLICY "Users can update their own profile"
ON users FOR UPDATE USING (auth.uid() = id);
```

**Policy 3:**
```sql
CREATE POLICY "Public profiles viewable"
ON users FOR SELECT USING (TRUE);
```

### Events Table

**Policy 1:**
```sql
CREATE POLICY "Anyone can view events"
ON events FOR SELECT USING (TRUE);
```

**Policy 2:**
```sql
CREATE POLICY "Only admins can create"
ON events FOR INSERT WITH CHECK (
  EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND is_admin = TRUE)
);
```

### Event Registrations Table

**Policy 1:**
```sql
CREATE POLICY "Users can view own registrations"
ON event_registrations FOR SELECT USING (user_id = auth.uid());
```

**Policy 2:**
```sql
CREATE POLICY "Users can register"
ON event_registrations FOR INSERT WITH CHECK (user_id = auth.uid());
```

---

## Step 7: Run the Server

```bash
# If using Python
python server.py

# Server will run at http://localhost:5000
```

---

## Step 8: Test It Out!

### 1. Register a New User

1. Open `http://localhost:5000` (or your local URL)
2. Click "Sign up"
3. Fill in:
   - Full Name: "Test User"
   - Username: "testuser"
   - Email: "test@example.com"
   - Password: "TestPass123!"
   - Role: "Student"
4. Click "Sign up"
5. Should redirect to homepage with your name showing

### 2. Login

1. Open `http://localhost:5000`
2. Fill in login form:
   - Email: "test@example.com"
   - Password: "TestPass123!"
3. Click "Sign in"
4. Should show homepage with profile icon

### 3. Edit Profile

1. Click profile icon (top right)
2. Click "Profile"
3. Click "Edit Profile"
4. Update your info
5. Click "Save Changes"
6. Should show success message

### 4. Make Yourself an Admin

To test admin features:

1. Go back to Supabase
2. Go to **Table Editor > users**
3. Find your user row
4. Click on `is_admin` column
5. Change `FALSE` to `TRUE`
6. Save
7. Logout and login again
8. Click profile icon - you should see "Admin Dashboard" option

### 5. Create an Event (Admin)

1. Go to Admin Dashboard
2. Click "Add Event"
3. Fill in:
   - Title: "Introduction to AI"
   - Date: Tomorrow's date
   - Location: "Room 101"
4. Click "Create"
5. Event appears in events list

### 6. View Events

1. Go to "Events" page
2. Should see events you created
3. Click event to view details
4. Click "Register" to sign up (as regular user)

---

## Project Structure

```
aihouse/
├── index.html                 # Login/Register page
├── pages/
│   ├── homepage.html         # Main dashboard
│   ├── contact.html          # Contact page
│   ├── profile.html          # User profile
│   ├── admin.html            # Admin dashboard
│   └── events.html           # Events listing
├── js/
│   ├── utils.js              # Database functions (IMPORTANT!)
│   ├── auth.js               # Auth logic
│   ├── navbar.js             # Navigation
│   ├── profile.js            # Profile page logic
│   ├── admin.js              # Admin logic
│   └── events.js             # Events logic
├── css/
│   ├── profile.css           # Profile styling
│   ├── admin.css             # Admin styling
│   ├── events.css            # Events styling
│   └── contact.css           # Contact styling
├── styles.css                # Global styles
├── SUPABASE_SETUP_GUIDE.md   # Detailed database guide
├── JS_API_REFERENCE.md       # Function reference
└── QUICK_START.md            # This file
```

---

## Key JavaScript Functions

All in `js/utils.js`:

```javascript
// Authentication
await registerUser(email, password, userData)
await loginUser(email, password)
logout()

// Users
await getUserById(userId)
await updateUser(userId, updateData)
await getAllUsers()

// Events
await createEvent(eventData)
await getAllEvents()
await registerForEvent(eventId)
await getUserEvents(userId)

// Utilities
getCurrentUser()
showNotification(message, type)
```

See `JS_API_REFERENCE.md` for detailed docs.

---

## Common Issues & Solutions

### "Failed to connect to Supabase"
- Check SUPABASE_URL and SUPABASE_ANON_KEY in utils.js
- Verify credentials match your Supabase project

### "User not found"
- Ensure tables were created
- Check RLS policies are enabled
- Verify user exists in Supabase > Table Editor > users

### Events don't show up
- Verify events exist in Supabase
- Check RLS policy "Anyone can view events" exists

### Can't update profile
- Check RLS policy "Users can update their own profile" exists
- Ensure you're logged in as that user

---

## Next Steps

1. **Customize colors** in CSS files
2. **Add more fields** to user profiles
3. **Set up email notifications** for event registrations
4. **Deploy to production** (Vercel, Netlify, etc.)
5. **Add profile image uploads** using Supabase Storage

---

## Full Guides

- **Database Setup**: See `SUPABASE_SETUP_GUIDE.md`
- **JavaScript API**: See `JS_API_REFERENCE.md`
- **Advanced RLS**: See `SUPABASE_SETUP_GUIDE.md` (Section: Row Level Security)

---

## Need Help?

1. Check the browser **console** (F12) for errors
2. Check Supabase **Logs** (SQL Editor > Logs)
3. Read `SUPABASE_SETUP_GUIDE.md` for detailed instructions
4. Check `JS_API_REFERENCE.md` for function documentation

---

## Success Checklist

- [ ] Created Supabase project
- [ ] Added credentials to `js/utils.js`
- [ ] Created database tables (users, events, event_registrations)
- [ ] Enabled RLS on all tables
- [ ] Added RLS policies
- [ ] Can register a new user
- [ ] Can login with registered email
- [ ] Can edit profile
- [ ] Can view events
- [ ] Can register for events

Once all boxes are checked, you're ready to go! 🎉

---

**Last Updated**: March 2025
