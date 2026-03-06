# AI House UHBC - Complete Web Application

A modern, fully-featured community platform built with vanilla HTML, CSS, and JavaScript, powered by Supabase.

## 🎯 Quick Links

**⭐ START HERE**: Read `QUICK_START.md` for 5-minute setup!

### Documentation
1. **[QUICK_START.md](QUICK_START.md)** - 5-minute setup guide
2. **[SUPABASE_SETUP_GUIDE.md](SUPABASE_SETUP_GUIDE.md)** - Complete database guide  
3. **[JS_API_REFERENCE.md](JS_API_REFERENCE.md)** - Function documentation
4. **[PROJECT_FLOW.md](PROJECT_FLOW.md)** - Architecture & data flows
5. **[SETUP_COMPLETE.md](SETUP_COMPLETE.md)** - Full feature overview
6. **[IMPLEMENTATION_SUMMARY.md](IMPLEMENTATION_SUMMARY.md)** - All changes made

---

## ✨ Features

### Authentication & Users
- ✅ Email/password registration
- ✅ Login with session management
- ✅ User profiles with avatars (initials-based)
- ✅ Profile editing (name, email, role, bio, department)
- ✅ User roles (Student, Teacher, Researcher, Entrepreneur, Other)
- ✅ Admin system with role promotion

### Events System
- ✅ Event creation & management (admin)
- ✅ Event listing with search & filter
- ✅ User registration for events
- ✅ Event calendar view
- ✅ Event capacity tracking

### Admin Dashboard
- ✅ User management (view, edit roles, delete)
- ✅ Event management (create, edit, delete)
- ✅ Statistics dashboard
- ✅ Member overview

### User Profiles
- ✅ Tabbed interface (Overview, My Events, My Projects, Settings)
- ✅ Profile statistics
- ✅ Event registration history
- ✅ Project tracking
- ✅ Account settings

### Design & UX
- ✅ Modern dark theme with green/orange accents
- ✅ Responsive mobile design
- ✅ Hamburger menu for mobile
- ✅ Smooth animations and transitions
- ✅ Form validation with error messages
- ✅ Toast notifications
- ✅ Professional styling

### Technical
- ✅ Vanilla JavaScript (no frameworks)
- ✅ Supabase backend
- ✅ PostgreSQL database
- ✅ Row Level Security (RLS)
- ✅ localStorage session management
- ✅ Responsive design (mobile-first)

---

## 🚀 Quick Start

### 1. Setup (15 minutes)

Follow **[QUICK_START.md](QUICK_START.md)** for:
1. Create Supabase project
2. Copy credentials
3. Create database tables
4. Enable security policies
5. Run local server
6. Test all features

### 2. Deploy

Deploy to Vercel or Netlify:
```bash
git push  # Push to GitHub
# Then deploy from Vercel/Netlify UI
```

### 3. Customize

Update:
- Colors in `css/profile.css`
- Logo/assets in `assets/`
- Site title in HTML files
- Content in pages

---

## 📁 Project Structure

```
aihouse/
├── index.html                    # Login/Register
├── styles.css                    # Global styles
│
├── pages/
│   ├── homepage.html            # Main dashboard
│   ├── profile.html             # User profile
│   ├── admin.html               # Admin dashboard
│   ├── events.html              # Events listing
│   ├── contact.html             # Contact page
│   └── about.html
│
├── js/
│   ├── utils.js                 # ⭐ DATABASE CORE
│   ├── auth.js                  # Authentication
│   ├── navbar.js                # Navigation & mobile menu
│   ├── profile.js               # Profile logic
│   ├── admin.js                 # Admin logic
│   ├── events.js                # Events logic
│   └── homepage.js              # Homepage logic
│
├── css/
│   ├── profile.css              # Profile & responsive styles
│   ├── admin.css                # Admin styling
│   ├── events.css               # Events styling
│   └── contact.css              # Contact styling
│
├── assets/
│   ├── uhbc_logo.svg
│   ├── aihouse_logo.svg
│   └── default-avatar.png
│
├── scripts/
│   └── migrate.sql              # Database migration
│
└── Documentation/
    ├── QUICK_START.md           # ⭐ START HERE
    ├── SUPABASE_SETUP_GUIDE.md
    ├── JS_API_REFERENCE.md
    ├── PROJECT_FLOW.md
    ├── SETUP_COMPLETE.md
    ├── IMPLEMENTATION_SUMMARY.md
    └── README.md                # This file
```

---

## 🔧 Key Files

### `js/utils.js` - Database Core
**Most important file!** Contains all database operations:

```javascript
// Auth
await registerUser(email, password, userData)
await loginUser(email, password)
logout()

// Users
await getUserById(userId)
await updateUser(userId, data)
await getAllUsers()
await changeUserRole(userId, newRole)

// Events
await createEvent(eventData)
await getAllEvents()
await registerForEvent(eventId)
await getUserEvents(userId)

// Utilities
getCurrentUser()
showNotification(message, type)
```

**YOU MUST UPDATE THE SUPABASE CREDENTIALS IN THIS FILE!**

---

## 🗄️ Database Schema

### Users
```sql
id, email, full_name, username, role, department, 
bio, avatar_url, is_admin, created_at, updated_at
```

### Events
```sql
id, title, description, location, event_date, 
event_time, category, image_url, created_by, 
capacity, created_at, updated_at
```

### Event Registrations
```sql
id, user_id, event_id, registered_at
```

See `SUPABASE_SETUP_GUIDE.md` for complete SQL.

---

## 🔐 Security Features

- ✅ Email/password validation
- ✅ Row Level Security (RLS) on all tables
- ✅ Protected routes (guest check)
- ✅ Admin-only features
- ✅ Input validation
- ✅ Secure session management
- ✅ Error handling

---

## 📱 Responsive Design

- **Desktop** (> 768px): Full navbar, all links visible
- **Tablet** (< 768px): Hamburger menu appears
- **Mobile** (< 480px): Stacked layouts, optimized touch targets

Mobile hamburger menu with:
- Smooth animation
- Navigation links
- Profile/Admin links
- Logout button

---

## 🎨 Customization

### Colors
Update in `css/profile.css`:
```css
:root {
    --primary-green: #006633;
    --primary-orange: #FF6B00;
    --bg: #0a0f0d;
    --surface: #111a14;
}
```

### Fonts
Update in HTML `<head>`:
```html
<link href="https://fonts.googleapis.com/css2?family=YOUR_FONT:wght@400;600;700&display=swap">
```

### Logo
Replace files in `assets/`:
- `uhbc_logo.svg`
- `aihouse_logo.svg`

---

## 🧪 Testing

### Test Registration
1. Open localhost
2. Click "Sign up"
3. Fill form with test data
4. Should see success and redirect

### Test Login
1. Click "Sign in"
2. Enter test credentials
3. Should see dashboard

### Test Profile
1. Click profile icon (top right)
2. Click "Profile"
3. Click "Edit Profile"
4. Update and save
5. Should show success message

### Test Events
1. Go to Events page
2. Should see event list
3. Click event to view details
4. Click "Register"
5. Should appear in "My Events"

### Test Admin
1. Make yourself admin in Supabase
2. Logout and login
3. Click profile icon
4. Should see "Admin Dashboard"
5. Should be able to create events

---

## 🚨 Troubleshooting

### Problem: "Failed to connect to Supabase"
**Solution**: Check credentials in `js/utils.js`

### Problem: "User not found"
**Solution**: Verify RLS policies are enabled in Supabase

### Problem: Can't register new user
**Solution**: Check users table exists and RLS is configured

### Problem: Mobile menu not showing
**Solution**: Check that `.nav-toggle { display: flex; }` is in media query

See `SUPABASE_SETUP_GUIDE.md` for more troubleshooting.

---

## 📚 Documentation Map

**First Time?**
- Start: `QUICK_START.md`
- Setup: Follow 8 steps
- Test: Use testing checklist

**Database Questions?**
- Read: `SUPABASE_SETUP_GUIDE.md`
- Find: Specific section
- Learn: Complete RLS setup

**Coding Questions?**
- Read: `JS_API_REFERENCE.md`
- Find: Function name
- Copy: Example code

**Architecture Questions?**
- Read: `PROJECT_FLOW.md`
- View: System diagrams
- Understand: Data flows

**What Changed?**
- Read: `IMPLEMENTATION_SUMMARY.md`
- Find: Feature section
- Learn: What was built

**Everything Else?**
- Read: `SETUP_COMPLETE.md`
- Find: Your question
- Learn: Complete guide

---

## 🌐 Deployment

### Vercel (Recommended)
1. Push code to GitHub
2. Go to vercel.com
3. Import project
4. Add environment variables:
   - `SUPABASE_URL`
   - `SUPABASE_ANON_KEY`
5. Deploy

### Netlify
1. Push to GitHub
2. netlify.com > New site
3. Connect GitHub repo
4. Add environment variables
5. Deploy

### Your Own Server
1. Upload files via FTP/SSH
2. Set up HTTPS
3. Update Supabase CORS
4. Point domain

---

## 📋 Pre-Deployment Checklist

- [ ] Supabase project created
- [ ] Database tables created
- [ ] RLS policies enabled
- [ ] Credentials in `js/utils.js`
- [ ] Can register user
- [ ] Can login
- [ ] Can edit profile
- [ ] Can view events
- [ ] Can register for event
- [ ] Mobile menu works
- [ ] No console errors
- [ ] Customized colors (optional)
- [ ] Updated logo (optional)
- [ ] Ready to deploy

---

## 🤝 Support

### Need Help?
1. Check the browser console (F12)
2. Read relevant documentation
3. Check Supabase logs
4. Verify database structure

### Documentation
- Quick questions? → `QUICK_START.md`
- Database help? → `SUPABASE_SETUP_GUIDE.md`
- Function docs? → `JS_API_REFERENCE.md`
- Architecture? → `PROJECT_FLOW.md`

### External Resources
- [Supabase Docs](https://supabase.com/docs)
- [PostgreSQL Docs](https://www.postgresql.org/docs/)
- [MDN Web Docs](https://developer.mozilla.org/)

---

## 📊 Statistics

### Code
- HTML: 500+ lines
- CSS: 2,000+ lines
- JavaScript: 1,400+ lines
- SQL: 150+ lines
- **Total: 4,050+ lines**

### Documentation
- Setup guides: 500+ lines
- API reference: 980+ lines
- Flow diagrams: 697+ lines
- Summary: 500+ lines
- **Total: 2,677+ lines**

### Overall
- **Production code: 4,050+ lines**
- **Documentation: 2,677+ lines**
- **Total project: 6,727+ lines**

---

## 🎓 Learning Resources

### JavaScript
- MDN: [JavaScript Guide](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide)
- Supabase: [JavaScript Client](https://supabase.com/docs/reference/javascript/introduction)

### CSS
- MDN: [CSS Reference](https://developer.mozilla.org/en-US/docs/Web/CSS)
- CSS Tricks: [Flexbox Guide](https://css-tricks.com/snippets/css/a-guide-to-flexbox/)

### Database
- PostgreSQL: [Official Docs](https://www.postgresql.org/docs/)
- Supabase: [Database Guide](https://supabase.com/docs/guides/database)

---

## 📝 License

This project is provided as-is for educational and development purposes.

---

## 👥 Credits

Built with:
- Vanilla HTML, CSS, JavaScript
- [Supabase](https://supabase.com) for backend
- [PostgreSQL](https://www.postgresql.org/) for database

---

## 🎉 You're Ready!

Everything is set up and ready to go. 

**Next steps:**
1. Open `QUICK_START.md`
2. Follow the 8-step setup
3. Test all features
4. Deploy!

**Good luck! 🚀**

---

**Project**: AI House UHBC
**Version**: 1.0
**Status**: Production Ready ✅
**Last Updated**: March 2025
