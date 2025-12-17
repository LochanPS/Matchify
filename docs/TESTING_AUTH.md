# Testing Authentication Flow

**Development Server:** http://localhost:5174/

---

## Quick Test Guide

### 1. Test Signup Flow
1. Navigate to http://localhost:5174/signup
2. Enter email: `test@example.com`
3. Enter password: `password123`
4. Confirm password: `password123`
5. Select role: **Player** or **Organizer**
6. Click "Create Account"
7. Should navigate to `/onboarding`

### 2. Test Onboarding Flow (Player)
1. After signup, you should be on `/onboarding`
2. **Step 1:** Select skill level (Beginner/Intermediate/Advanced)
3. Click "Next"
4. **Step 2:** Enter city (e.g., "New York")
5. Click "Complete Profile"
6. Should navigate to `/` (home)

### 3. Test Login Flow
1. Navigate to http://localhost:5174/login
2. Enter email: `test@example.com`
3. Enter password: `password123`
4. Click "Sign In"
5. Should navigate to `/` (home)

### 4. Test Logout
1. After logging in, click the logout icon in the top-right header
2. Should navigate to `/login`

### 5. Test Role-Based Navigation
**Player Role:**
- Bottom nav shows: Home, Profile
- Click Home → navigates to `/`
- Click Profile → navigates to `/profile`

**Organizer Role:**
- Bottom nav shows: Dashboard, Profile
- Click Dashboard → navigates to `/organizer/dashboard`
- Click Profile → navigates to `/profile`

---

## Error Testing

### Test Email Already Exists
1. Go to `/signup`
2. Enter email: `error@test.com`
3. Enter password: `password123`
4. Confirm password: `password123`
5. Select role: Player
6. Click "Create Account"
7. Should show error: "Email already exists"

### Test Invalid Login
1. Go to `/login`
2. Enter email: `wrong@test.com`
3. Enter password: `password123`
4. Click "Sign In"
5. Should show error: "Invalid email or password"

### Test Password Mismatch
1. Go to `/signup`
2. Enter email: `test@example.com`
3. Enter password: `password123`
4. Confirm password: `different123`
5. Should show error: "Passwords do not match"

### Test Email Validation
1. Go to `/signup` or `/login`
2. Enter email: `notanemail`
3. Try to submit
4. Should show error: "Please enter a valid email"

### Test Password Length
1. Go to `/signup` or `/login`
2. Enter password: `12345` (less than 6 chars)
3. Try to submit
4. Should show error: "Password must be at least 6 characters"

### Test Required Fields
1. Go to `/signup`
2. Leave email empty
3. Try to submit
4. Should show error: "Email is required"

---

## Mobile Testing

### Test on Different Screen Sizes
1. Open DevTools (F12)
2. Toggle device toolbar (Ctrl+Shift+M)
3. Test these sizes:
   - iPhone SE (375px)
   - iPhone 12 Pro (390px)
   - iPad (768px)
   - Desktop (1024px+)

### Check Touch Targets
- All buttons should be at least 48px tall
- All inputs should be easy to tap
- Bottom navigation should be easy to reach with thumb

### Check Responsive Layout
- Forms should be centered on mobile
- Text should be readable without zooming
- No horizontal scrolling
- Bottom nav should hide on desktop (md breakpoint)

---

## Accessibility Testing

### Keyboard Navigation
1. Use Tab key to navigate through form
2. Use Enter to submit form
3. Use Space to toggle password visibility
4. All interactive elements should be reachable

### Screen Reader Testing
1. Enable screen reader (NVDA, JAWS, or VoiceOver)
2. Navigate through form
3. All labels should be read correctly
4. Error messages should be announced
5. Required fields should be indicated

---

## Test Accounts

### Success Cases
```
Email: test@example.com
Password: password123

Email: player@test.com
Password: player123

Email: organizer@test.com
Password: organizer123
```

### Error Cases
```
Email: error@test.com
→ Throws "Email already exists" on signup

Email: wrong@test.com
→ Throws "Invalid email or password" on login
```

---

## Expected Behavior

### Loading States
- Button text changes to "Signing in..." or "Creating account..."
- Button is disabled during submission
- Form inputs remain enabled (can be changed)

### Success States
- No error messages shown
- Navigates to next page automatically
- User data is stored in AuthContext

### Error States
- Error message appears below form
- Form remains editable
- Button re-enables
- User can retry

---

## Known Limitations (Mock Auth)

1. **No persistence:** User data is lost on page refresh
2. **No token storage:** No localStorage/sessionStorage
3. **No backend calls:** All authentication is simulated
4. **Fixed responses:** Same mock data for all users
5. **No email verification:** Skipped in mock

---

## Next Steps

After testing, the next phase is:
1. Replace mock auth with real Firebase
2. Add protected routes (redirect to login if not authenticated)
3. Persist auth state (localStorage + Firebase)
4. Connect to backend API
5. Add email verification flow

---

*Testing Guide - Day 12*
