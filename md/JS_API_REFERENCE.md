# JavaScript API Reference - AI House UHBC

Complete reference for all JavaScript functions available in `js/utils.js` and across the application.

---

## Table of Contents

1. [Authentication Functions](#authentication-functions)
2. [User Management Functions](#user-management-functions)
3. [Event Functions](#event-functions)
4. [Notification Functions](#notification-functions)
5. [Utility Functions](#utility-functions)
6. [Admin Functions](#admin-functions)

---

## Authentication Functions

### `registerUser(email, password, userData)`

Registers a new user and creates a profile record.

**Parameters:**
```javascript
{
  email: string,        // User's email
  password: string,     // Must be at least 6 characters
  userData: {
    full_name: string,      // User's full name (required)
    username: string,       // Unique username (required)
    role: string,           // One of: Student, Teacher, Researcher, Entrepreneur, Other
    department: string,     // User's department
    other_role?: string     // If role is "Other", specify custom role
  }
}
```

**Returns:**
```javascript
{
  success: boolean,
  user: {
    id: string,           // UUID of the new user
    email: string,
    full_name: string,
    username: string,
    role: string,
    is_admin: false
  },
  error: string|null
}
```

**Example:**
```javascript
const result = await registerUser(
  "john@example.com",
  "SecurePass123!",
  {
    full_name: "John Doe",
    username: "johndoe",
    role: "Student",
    department: "Computer Science"
  }
);

if (result.success) {
  localStorage.setItem('currentUser', JSON.stringify(result.user));
  window.location.href = '/pages/homepage.html';
} else {
  showNotification(result.error, 'error');
}
```

---

### `loginUser(email, password)`

Authenticates a user and retrieves their profile.

**Parameters:**
```javascript
{
  email: string,        // Registered email
  password: string      // Account password
}
```

**Returns:**
```javascript
{
  success: boolean,
  user: {
    id: string,
    email: string,
    full_name: string,
    username: string,
    role: string,
    is_admin: boolean,
    department: string,
    bio: string,
    avatar_url: string
  },
  error: string|null
}
```

**Example:**
```javascript
const result = await loginUser("john@example.com", "SecurePass123!");

if (result.success) {
  localStorage.setItem('currentUser', JSON.stringify(result.user));
  showNotification(`Welcome back, ${result.user.full_name}!`, 'success');
  setTimeout(() => {
    window.location.href = '/pages/homepage.html';
  }, 1500);
}
```

---

### `logout()`

Logs out the current user and clears session.

**Returns:** `void`

**Example:**
```javascript
function handleLogout() {
  logout();
  showNotification('Logged out successfully', 'success');
  // User redirected to login page automatically
}
```

---

### `redirectIfGuest()`

Checks if user is logged in. If not, redirects to login page.

**Returns:** `boolean` - `true` if user is logged in, `false` if guest

**Example:**
```javascript
// At start of protected page
if (!redirectIfGuest()) return;

// Continue loading page...
loadUserProfile();
```

---

### `getCurrentUser()`

Gets the currently logged-in user from localStorage.

**Returns:**
```javascript
{
  id: string,
  email: string,
  full_name: string,
  username: string,
  role: string,
  is_admin: boolean,
  // ... other fields
} | null
```

**Example:**
```javascript
const user = getCurrentUser();

if (user) {
  console.log(`Logged in as: ${user.full_name}`);
  if (user.is_admin) {
    showAdminPanel();
  }
} else {
  console.log('No user logged in');
}
```

---

## User Management Functions

### `getUserById(userId)`

Fetches a user's complete profile from database.

**Parameters:**
```javascript
{
  userId: string  // User's UUID
}
```

**Returns:**
```javascript
{
  id: string,
  email: string,
  full_name: string,
  username: string,
  role: string,
  department: string,
  bio: string,
  avatar_url: string,
  is_admin: boolean,
  created_at: string,
  updated_at: string
}
```

**Example:**
```javascript
const user = getCurrentUser();
const profile = await getUserById(user.id);

console.log(`Department: ${profile.department}`);
console.log(`Bio: ${profile.bio}`);
```

---

### `updateUser(userId, updateData)`

Updates user profile information.

**Parameters:**
```javascript
{
  userId: string,
  updateData: {
    full_name?: string,
    username?: string,
    department?: string,
    role?: string,
    bio?: string,
    avatar_url?: string,
    other_role?: string
  }
}
```

**Returns:**
```javascript
{
  success: boolean,
  data: {
    // Updated user object
  },
  error: string|null
}
```

**Example:**
```javascript
const user = getCurrentUser();

const result = await updateUser(user.id, {
  full_name: "Jane Doe",
  bio: "AI researcher and entrepreneur",
  role: "Researcher",
  department: "Artificial Intelligence"
});

if (result.success) {
  showNotification('Profile updated!', 'success');
  // Update UI with new data
  document.getElementById('displayName').textContent = "Jane Doe";
}
```

---

### `changeUserRole(userId, newRole)`

Changes a user's role. Admin only.

**Parameters:**
```javascript
{
  userId: string,
  newRole: string  // One of: Student, Teacher, Researcher, Entrepreneur, Other
}
```

**Returns:**
```javascript
{
  success: boolean,
  error: string|null
}
```

**Example:**
```javascript
const adminUser = getCurrentUser();

if (adminUser.is_admin) {
  const result = await changeUserRole("user-uuid-here", "Teacher");
  
  if (result.success) {
    showNotification('User role changed!', 'success');
  }
}
```

---

### `deleteUser(userId)`

Deletes a user account and profile. Admin only.

**Parameters:**
```javascript
{
  userId: string  // User to delete
}
```

**Returns:**
```javascript
{
  success: boolean,
  error: string|null
}
```

**Example:**
```javascript
if (confirm('Are you sure you want to delete this user?')) {
  const result = await deleteUser(userIdToDelete);
  
  if (result.success) {
    showNotification('User deleted', 'success');
    loadUsersList(); // Refresh list
  }
}
```

---

### `getAllUsers()`

Gets all users from database. Admin only.

**Returns:**
```javascript
{
  success: boolean,
  data: [
    {
      id: string,
      full_name: string,
      email: string,
      role: string,
      is_admin: boolean,
      // ... other fields
    },
    // ...
  ],
  error: string|null
}
```

**Example:**
```javascript
const result = await getAllUsers();

if (result.success) {
  const users = result.data;
  console.log(`Total users: ${users.length}`);
  
  users.forEach(user => {
    console.log(`${user.full_name} - ${user.role}`);
  });
}
```

---

## Event Functions

### `createEvent(eventData)`

Creates a new event. Admin only.

**Parameters:**
```javascript
{
  eventData: {
    title: string,           // Event name (required)
    description: string,     // Event description
    location: string,        // Event location
    event_date: string,      // Format: YYYY-MM-DD
    event_time?: string,     // Format: HH:MM
    category: string,        // e.g., "Workshop", "Conference", "Formation"
    image_url?: string,      // Event image
    capacity?: number        // Max participants
  }
}
```

**Returns:**
```javascript
{
  success: boolean,
  data: {
    id: string,
    title: string,
    // ... event data
  },
  error: string|null
}
```

**Example:**
```javascript
const eventData = {
  title: "Introduction to Machine Learning",
  description: "Learn ML fundamentals",
  location: "Room 101, UHBC",
  event_date: "2025-03-20",
  event_time: "14:00",
  category: "Workshop",
  capacity: 50
};

const result = await createEvent(eventData);

if (result.success) {
  showNotification('Event created!', 'success');
  loadEventsList();
}
```

---

### `getEvent(eventId)`

Gets details of a specific event.

**Parameters:**
```javascript
{
  eventId: string  // Event UUID
}
```

**Returns:**
```javascript
{
  id: string,
  title: string,
  description: string,
  location: string,
  event_date: string,
  event_time: string,
  category: string,
  image_url: string,
  created_by: string,
  capacity: number,
  created_at: string,
  updated_at: string
}
```

**Example:**
```javascript
const event = await getEvent("event-uuid");

console.log(`Event: ${event.title}`);
console.log(`Date: ${event.event_date} at ${event.event_time}`);
console.log(`Location: ${event.location}`);
console.log(`Capacity: ${event.capacity}`);
```

---

### `getAllEvents()`

Gets all available events.

**Returns:**
```javascript
{
  success: boolean,
  data: [
    {
      id: string,
      title: string,
      description: string,
      location: string,
      event_date: string,
      category: string,
      image_url: string,
      capacity: number,
      // ...
    },
    // ...
  ],
  error: string|null
}
```

**Example:**
```javascript
const result = await getAllEvents();

if (result.success) {
  const events = result.data;
  
  events.forEach(event => {
    console.log(`${event.title} - ${event.event_date}`);
  });
  
  // Render events on page
  renderEventsList(events);
}
```

---

### `updateEvent(eventId, updateData)`

Updates an event. Creator or admin only.

**Parameters:**
```javascript
{
  eventId: string,
  updateData: {
    title?: string,
    description?: string,
    location?: string,
    event_date?: string,
    event_time?: string,
    category?: string,
    image_url?: string,
    capacity?: number
  }
}
```

**Returns:**
```javascript
{
  success: boolean,
  error: string|null
}
```

**Example:**
```javascript
const result = await updateEvent(eventId, {
  capacity: 100,
  event_date: "2025-03-25"
});

if (result.success) {
  showNotification('Event updated!', 'success');
}
```

---

### `deleteEvent(eventId)`

Deletes an event. Admin only.

**Parameters:**
```javascript
{
  eventId: string  // Event to delete
}
```

**Returns:**
```javascript
{
  success: boolean,
  error: string|null
}
```

**Example:**
```javascript
if (confirm('Delete this event?')) {
  const result = await deleteEvent(eventId);
  
  if (result.success) {
    showNotification('Event deleted', 'success');
    loadEventsList();
  }
}
```

---

### `registerForEvent(eventId)`

Registers current user for an event.

**Parameters:**
```javascript
{
  eventId: string  // Event to register for
}
```

**Returns:**
```javascript
{
  success: boolean,
  error: string|null
}
```

**Example:**
```javascript
const user = getCurrentUser();

if (!user) {
  showNotification('Please login first', 'warning');
  window.location.href = '/index.html';
  return;
}

const result = await registerForEvent(eventId);

if (result.success) {
  showNotification('Registered for event!', 'success');
  loadUserEvents();
} else {
  showNotification('Already registered or error occurred', 'error');
}
```

---

### `cancelEventRegistration(eventId)`

Unregisters current user from an event.

**Parameters:**
```javascript
{
  eventId: string  // Event to unregister from
}
```

**Returns:**
```javascript
{
  success: boolean,
  error: string|null
}
```

**Example:**
```javascript
if (confirm('Cancel registration?')) {
  const result = await cancelEventRegistration(eventId);
  
  if (result.success) {
    showNotification('Registration cancelled', 'success');
    loadUserEvents();
  }
}
```

---

### `getUserEvents(userId)`

Gets all events registered by a user.

**Parameters:**
```javascript
{
  userId: string  // User UUID
}
```

**Returns:**
```javascript
{
  success: boolean,
  data: [
    {
      event_id: string,
      registered_at: string,
      events: {
        id: string,
        title: string,
        event_date: string,
        location: string,
        // ...
      }
    },
    // ...
  ],
  error: string|null
}
```

**Example:**
```javascript
const user = getCurrentUser();
const result = await getUserEvents(user.id);

if (result.success) {
  const registeredEvents = result.data;
  
  registeredEvents.forEach(reg => {
    console.log(`Registered for: ${reg.events.title}`);
    console.log(`On: ${reg.registered_at}`);
  });
}
```

---

## Notification Functions

### `showNotification(message, type)`

Displays a notification message to the user.

**Parameters:**
```javascript
{
  message: string,              // Notification text
  type: 'success'|'error'|'warning'|'info'  // Notification type
}
```

**Returns:** `void`

**Example:**
```javascript
// Success notification
showNotification('Profile updated successfully!', 'success');

// Error notification
showNotification('Failed to save changes', 'error');

// Warning notification
showNotification('You must login first', 'warning');

// Info notification
showNotification('Loading events...', 'info');
```

---

## Utility Functions

### `isValidEmail(email)`

Validates email format.

**Parameters:**
```javascript
{
  email: string
}
```

**Returns:** `boolean`

**Example:**
```javascript
if (isValidEmail(userEmail)) {
  console.log('Valid email');
} else {
  console.log('Invalid email format');
}
```

---

### `isValidPassword(password)`

Validates password strength (minimum 8 characters).

**Parameters:**
```javascript
{
  password: string
}
```

**Returns:** `boolean`

**Example:**
```javascript
if (!isValidPassword(password)) {
  showNotification('Password must be at least 8 characters', 'warning');
}
```

---

### `formatDate(dateString)`

Formats date string to readable format.

**Parameters:**
```javascript
{
  dateString: string  // Format: YYYY-MM-DD
}
```

**Returns:** `string` - Formatted date (e.g., "March 20, 2025")

**Example:**
```javascript
const eventDate = "2025-03-20";
console.log(formatDate(eventDate)); // "March 20, 2025"
```

---

## Admin Functions

### `promoteUserToAdmin(userId)`

Makes a user an admin. Super-admin only.

**Parameters:**
```javascript
{
  userId: string
}
```

**Returns:**
```javascript
{
  success: boolean,
  error: string|null
}
```

**Example:**
```javascript
const result = await promoteUserToAdmin(userId);

if (result.success) {
  showNotification('User promoted to admin', 'success');
}
```

---

### `getAdminStats()`

Gets statistics for admin dashboard.

**Returns:**
```javascript
{
  success: boolean,
  data: {
    total_users: number,
    total_events: number,
    total_registrations: number,
    admins: number
  },
  error: string|null
}
```

**Example:**
```javascript
const result = await getAdminStats();

if (result.success) {
  const { total_users, total_events } = result.data;
  console.log(`Total Users: ${total_users}`);
  console.log(`Total Events: ${total_events}`);
}
```

---

## Error Handling

Always wrap function calls in try-catch for production:

```javascript
try {
  const result = await loginUser(email, password);
  
  if (result.success) {
    // Handle success
  } else {
    showNotification(result.error, 'error');
  }
} catch (error) {
  console.error('Unexpected error:', error);
  showNotification('An unexpected error occurred', 'error');
}
```

---

## Common Patterns

### Pattern 1: Redirect if Not Logged In
```javascript
const user = getCurrentUser();
if (!user) {
  showNotification('Please login first', 'warning');
  window.location.href = '/index.html';
}
```

### Pattern 2: Check Admin Status
```javascript
const user = getCurrentUser();
if (!user || !user.is_admin) {
  showNotification('Admin access required', 'error');
  window.location.href = '/pages/homepage.html';
}
```

### Pattern 3: Load and Display Data
```javascript
async function loadProfile() {
  try {
    const user = getCurrentUser();
    const profile = await getUserById(user.id);
    
    // Update UI
    document.getElementById('name').textContent = profile.full_name;
    document.getElementById('role').textContent = profile.role;
    document.getElementById('bio').textContent = profile.bio;
  } catch (error) {
    showNotification('Failed to load profile', 'error');
  }
}
```

### Pattern 4: Form Submission
```javascript
form.addEventListener('submit', async (e) => {
  e.preventDefault();
  
  const data = {
    full_name: document.getElementById('fullName').value,
    role: document.getElementById('role').value
  };
  
  const result = await updateUser(user.id, data);
  
  if (result.success) {
    showNotification('Changes saved!', 'success');
  } else {
    showNotification(result.error, 'error');
  }
});
```

---

## Last Updated

2025-03-06
