# Project Flow & Architecture Guide

## System Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                        FRONTEND (Your Browser)                   │
│                                                                   │
│  ┌────────────────────────────────────────────────────────────┐ │
│  │ HTML Pages                                                 │ │
│  │ • index.html (login/register)                             │ │
│  │ • homepage.html                                           │ │
│  │ • profile.html                                            │ │
│  │ • admin.html                                              │ │
│  │ • events.html                                             │ │
│  │ • contact.html                                            │ │
│  └────────────────────────────────────────────────────────────┘ │
│                                                                   │
│  ┌────────────────────────────────────────────────────────────┐ │
│  │ JavaScript Modules (js/)                                   │ │
│  │ • utils.js ⭐ (Database operations)                        │ │
│  │ • auth.js (Login/Register)                                │ │
│  │ • navbar.js (Navigation)                                  │ │
│  │ • profile.js (Profile page)                               │ │
│  │ • admin.js (Admin dashboard)                              │ │
│  │ • events.js (Events management)                           │ │
│  └────────────────────────────────────────────────────────────┘ │
│                                                                   │
│  ┌────────────────────────────────────────────────────────────┐ │
│  │ CSS Styling (css/ and styles.css)                          │ │
│  │ • Modern theme with animations                            │ │
│  │ • Responsive design                                       │ │
│  │ • Mobile hamburger menu                                   │ │
│  └────────────────────────────────────────────────────────────┘ │
│                                                                   │
└─────────────────────────────────────────────────────────────────┘
                              ↑ API Calls (fetch)
                              ↓
┌─────────────────────────────────────────────────────────────────┐
│                    SUPABASE (Backend)                             │
│                                                                   │
│  ┌────────────────────────────────────────────────────────────┐ │
│  │ Authentication (Supabase Auth)                             │ │
│  │ • Email/Password login                                    │ │
│  │ • Session management                                      │ │
│  │ • User tokens                                             │ │
│  └────────────────────────────────────────────────────────────┘ │
│                                                                   │
│  ┌────────────────────────────────────────────────────────────┐ │
│  │ Database (PostgreSQL)                                      │ │
│  │ • users table                                             │ │
│  │ • events table                                            │ │
│  │ • event_registrations table                               │ │
│  │ • user_projects table (optional)                          │ │
│  └────────────────────────────────────────────────────────────┘ │
│                                                                   │
│  ┌────────────────────────────────────────────────────────────┐ │
│  │ Security (Row Level Security - RLS)                        │ │
│  │ • Users can only access their own data                    │ │
│  │ • Admins have elevated permissions                        │ │
│  │ • Public data visible to all                              │ │
│  └────────────────────────────────────────────────────────────┘ │
│                                                                   │
└─────────────────────────────────────────────────────────────────┘
```

---

## User Journey

### New User (Guest)

```
1. Landing (index.html)
   ↓
2. Click "Sign up"
   ↓
3. Enter details (name, email, password, role)
   ↓
4. registerUser() creates:
   - Auth account (Supabase Auth)
   - User profile (users table)
   ↓
5. Redirected to homepage
   ↓
6. localStorage has currentUser
   ↓
7. Can see profile icon
   ↓
8. Fully logged in
```

### Existing User (Member)

```
1. Landing (index.html)
   ↓
2. Click "Sign in"
   ↓
3. Enter email & password
   ↓
4. loginUser() authenticates:
   - Checks credentials with Supabase Auth
   - Fetches user profile from users table
   ↓
5. localStorage = currentUser
   ↓
6. Redirected to homepage
   ↓
7. Can access:
   - Profile page
   - Events page
   - Can register for events
```

### Admin User

```
1. Login as normal user
   ↓
2. In Supabase, set is_admin = TRUE
   ↓
3. Logout and login again
   ↓
4. localStorage has is_admin flag
   ↓
5. Profile dropdown shows:
   - Profile ✓
   - Admin Dashboard ✓
   - Logout ✓
   ↓
6. Can access:
   - Admin Dashboard
   - User management
   - Event management
   - Edit/delete events
   - Change user roles
```

---

## Feature Flows

### Register for Event

```
User on Events Page
   ↓
Clicks "Register" button
   ↓
Is user logged in?
   ├─ NO  → Show warning, redirect to login
   ├─ YES → Continue
   ↓
registerForEvent(eventId)
   ↓
Creates record in event_registrations table
   {
     user_id: currentUser.id
     event_id: eventId
     registered_at: NOW()
   }
   ↓
Success notification
   ↓
Event appears in "My Events"
```

### Create Event (Admin)

```
Admin in Admin Dashboard
   ↓
Clicks "Add Event"
   ↓
Fills form:
   - Title
   - Description
   - Location
   - Date/Time
   - Capacity
   ↓
Clicks "Create"
   ↓
createEvent(eventData)
   ↓
Inserts into events table
   {
     title, description, location, ...
     created_by: currentUser.id
     created_at: NOW()
   }
   ↓
Event appears in events list
   ↓
All users can see it
```

### Update Profile

```
User on Profile Page
   ↓
Clicks "Edit Profile"
   ↓
Edit Panel appears
   ↓
Updates fields:
   - Full Name
   - Department
   - Role
   - Bio
   ↓
Clicks "Save"
   ↓
updateUser(userId, updateData)
   ↓
Supabase RLS checks:
   "Is auth.uid() == user.id?"
   └─ YES → Allow update
   └─ NO  → Deny
   ↓
Updates users table
   ↓
Success notification
   ↓
UI updates with new data
```

### Admin Change User Role

```
Admin Dashboard > Users
   ↓
Finds user
   ↓
Clicks role dropdown
   ↓
Selects new role
   ↓
changeUserRole(userId, newRole)
   ↓
Supabase RLS checks:
   "Is current user admin?"
   └─ YES → Allow change
   └─ NO  → Deny
   ↓
Updates is_admin flag (if needed)
   └─ Changes role
   ↓
User sees new role when they login
```

---

## Data Flow

### Authentication Data Flow

```
User enters email & password
                ↓
        loginUser()
                ↓
Supabase.auth.signInWithPassword()
                ↓
Auth validated ✓
                ↓
getUserById(userId)
                ↓
Query users table
                ↓
Return user object
                ↓
localStorage.setItem('currentUser', JSON.stringify(user))
                ↓
Redirect to homepage
                ↓
getCurrentUser() reads localStorage
                ↓
User fully authenticated ✓
```

### Profile Update Flow

```
User fills form & clicks Save
                ↓
updateUser(userId, updateData)
                ↓
Validate form data
                ↓
supabase.from('users')
  .update(updateData)
  .eq('id', userId)
                ↓
Sent to Supabase
                ↓
RLS Policy checks:
   auth.uid() == userId?
   └─ YES → Continue
   └─ NO  → Error
                ↓
Database updated
                ↓
Return success
                ↓
Show notification
                ↓
Update UI with new data
```

### Event Registration Flow

```
User clicks Register
                ↓
registerForEvent(eventId)
                ↓
Check if already registered
                ↓
If yes → Error (duplicate)
If no  → Continue
                ↓
Insert into event_registrations
   {
     user_id: currentUser.id,
     event_id: eventId
   }
                ↓
RLS Policy checks:
   user_id == auth.uid()?
   └─ YES → Allow
   └─ NO  → Deny
                ↓
Success
                ↓
Show notification
                ↓
Update "My Events"
```

---

## API Endpoints (Frontend to Backend)

### Auth Endpoints

```
POST /auth/sign-up
  Body: { email, password, fullName, username, role }
  Returns: { user, session }

POST /auth/sign-in
  Body: { email, password }
  Returns: { user, session }

POST /auth/sign-out
  Returns: { success }
```

### User Endpoints

```
GET /users/:id
  Returns: { id, full_name, email, role, ... }

PATCH /users/:id
  Body: { full_name, bio, role, ... }
  Returns: { user }

GET /users
  Returns: [{ id, full_name, email, ... }]
  (Admin only)

DELETE /users/:id
  Returns: { success }
  (Admin only)
```

### Event Endpoints

```
GET /events
  Returns: [{ id, title, description, ... }]

POST /events
  Body: { title, description, location, event_date, ... }
  Returns: { event }
  (Admin only)

GET /events/:id
  Returns: { id, title, ... }

PATCH /events/:id
  Body: { title, location, ... }
  Returns: { event }
  (Admin only)

DELETE /events/:id
  Returns: { success }
  (Admin only)
```

### Registration Endpoints

```
POST /events/:id/register
  Returns: { success }
  (Authenticated users)

DELETE /events/:id/register
  Returns: { success }
  (Authenticated users)

GET /users/:id/events
  Returns: [{ event }]
  (Own events)
```

---

## State Management

### localStorage

```
currentUser = {
  id: "uuid-here",
  email: "user@example.com",
  full_name: "John Doe",
  username: "johndoe",
  role: "Student",
  is_admin: false,
  department: "Computer Science",
  bio: "...",
  created_at: "2025-03-01"
}
```

Used for:
- Checking if user is logged in
- Getting current user ID
- Checking admin status
- Maintaining session across page reloads

### Session Management

```
Login:
  1. User credentials validated
  2. currentUser stored in localStorage
  3. Session established

Protected Page:
  1. Check localStorage for currentUser
  2. If not found → redirect to login
  3. If found → Load user data
  4. Display page

Logout:
  1. localStorage.removeItem('currentUser')
  2. Redirect to login
  3. Session destroyed
```

---

## Security Architecture

### Row Level Security (RLS)

```
Every query to Supabase includes auth.uid()

Users Table:
  SELECT: auth.uid() = user.id (own) OR public (anyone)
  UPDATE: auth.uid() = user.id (own only)
  DELETE: admin check

Events Table:
  SELECT: anyone can view
  INSERT: admin only
  UPDATE: creator or admin
  DELETE: admin only

Event Registrations:
  SELECT: own registrations OR admin
  INSERT: own user_id only
  DELETE: own only
```

### Frontend Security

```
1. Form Validation
   ↓
2. Authenticate user
   ↓
3. Send to Supabase
   ↓
4. Supabase RLS validates
   ↓
5. Return success/error
   ↓
6. Frontend handles result
```

---

## Database Relationships

```
┌─────────────┐
│   users     │
├─────────────┤
│ id (PK)     │
│ email       │
│ full_name   │
│ role        │
│ is_admin    │
└─────────────┘
       │
       │ created_by
       ↓
┌─────────────┐
│   events    │
├─────────────┤
│ id (PK)     │
│ title       │
│ location    │
│ event_date  │
│ created_by  │ ──→ users.id
└─────────────┘
       ↑
       │
       └─ event_id
┌──────────────────────────┐
│ event_registrations      │
├──────────────────────────┤
│ id (PK)                  │
│ user_id ────────→ users.id
│ event_id ───────→ events.id
│ registered_at            │
└──────────────────────────┘
```

---

## File Dependencies

### Profile Page

```
profile.html
   ↓
   ├─ css/profile.css
   ├─ js/utils.js (database)
   ├─ js/navbar.js (navigation)
   └─ js/profile.js (page logic)

js/profile.js depends on:
   ├─ utils.js (getCurrentUser, getUserById, updateUser)
   ├─ navbar.js (for navbar)
   └─ localStorage (for current user)
```

### Admin Page

```
admin.html
   ↓
   ├─ css/admin.css
   ├─ js/utils.js (database)
   ├─ js/navbar.js (navigation)
   └─ js/admin.js (admin logic)

js/admin.js depends on:
   ├─ utils.js (getAllUsers, getAllEvents, changeUserRole)
   ├─ redirectIfGuest() (check logged in)
   └─ currentUser.is_admin check
```

### Events Page

```
events.html
   ↓
   ├─ css/events.css
   ├─ js/utils.js (database)
   ├─ js/navbar.js (navigation)
   └─ js/events.js (events logic)

js/events.js depends on:
   ├─ utils.js (getAllEvents, registerForEvent)
   ├─ getCurrentUser() (for registrations)
   └─ localStorage (session)
```

---

## Deployment Architecture

```
Development:
  Your Computer
    ↓
  localhost:5000
    ↓
  Connect to Supabase project
    ↓
  Test features locally

Production:
  Your Computer
    ↓
  Push to GitHub
    ↓
  Vercel/Netlify
    ↓
  Build & Deploy
    ↓
  yourdomain.com
    ↓
  Connect to same Supabase project
    ↓
  Live website
```

---

## Error Handling Flow

```
User action
   ↓
JavaScript function
   ↓
Try/Catch block
   ├─ Error occurs
   │    ↓
   │ Catch error
   │    ↓
   │ console.error()
   │    ↓
   │ showNotification(error, 'error')
   │    ↓
   │ User sees error message
   │
   └─ Success
        ↓
     showNotification(message, 'success')
        ↓
     Update UI
        ↓
     User sees result
```

---

## Performance Considerations

```
Caching:
  ├─ localStorage (user session)
  ├─ Browser cache (CSS, JS)
  └─ Supabase caching

Optimization:
  ├─ Minimize database queries
  ├─ Use efficient selects
  ├─ Cache user data in localStorage
  └─ Lazy load images

Supabase Best Practices:
  ├─ Use proper indexes
  ├─ Implement RLS early
  ├─ Monitor query performance
  └─ Use connection pooling
```

---

## Summary

- **Frontend**: HTML, CSS, JavaScript in browser
- **Backend**: Supabase PostgreSQL database
- **Communication**: Fetch API (HTTP requests)
- **Authentication**: Email/password with Supabase Auth
- **Authorization**: Row Level Security (RLS) policies
- **Data**: localStorage + database
- **Security**: User authentication + role-based access

---

**Last Updated**: March 2025
