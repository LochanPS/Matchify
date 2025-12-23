# Day 30: Edit Profile & Settings

**Date:** December 28, 2024  
**Status:** 🚀 READY TO EXECUTE  
**Focus:** Profile editing, settings page, account management

---

## Overview

Day 30 implements comprehensive profile editing and settings management. Players can now update their profile information (name, email, phone, city), access a dedicated settings page, and manage account preferences including logout and account deletion.

---

## Part 1: Edit Profile Modal (2 hours)

### 1.1 EditProfileModal Component

Create comprehensive profile editing modal:

```javascript
// frontend/src/components/player/EditProfileModal.jsx
const EditProfileModal = ({ isOpen, onClose, onSave, user, isLoading }) => {
  // Form fields: name, email, phone, city
  // Validation for all fields
  // Error handling
  // Loading states
};
```

**Features:**
- ✅ Edit name, email, phone, city
- ✅ Form validation
- ✅ Error messages
- ✅ Loading states
- ✅ Success feedback
- ✅ Mobile-optimized modal
- ✅ Accessibility labels

---

## Part 2: Settings Page (2 hours)

### 2.1 Settings Component

Create comprehensive settings page:

```javascript
// frontend/src/pages/player/Settings.jsx
const Settings = () => {
  // Account settings section
  // Notifications settings
  // Privacy & security
  // Logout button
  // Delete account section
};
```

**Features:**
- ✅ Account settings
- ✅ Notifications preferences
- ✅ Privacy & security
- ✅ Logout functionality
- ✅ Delete account with confirmation
- ✅ App information
- ✅ Links to policies

---

## Part 3: Delete Account Flow (1.5 hours)

### 3.1 Account Deletion

Implement safe account deletion:

```javascript
// Confirmation modal with:
// - Warning about data loss
// - Type "DELETE" confirmation
// - Permanent deletion warning
// - API call to delete account
```

**Features:**
- ✅ Confirmation modal
- ✅ Type confirmation
- ✅ Warning messages
- ✅ API integration
- ✅ Redirect after deletion
- ✅ Error handling

---

## Part 4: PlayerProfile Updates (1 hour)

### 4.1 Profile Page Integration

Update PlayerProfile page:

```javascript
// Add Settings button
// Use new EditProfileModal
// Remove old logout button
// Link to Settings page
```

**Features:**
- ✅ Settings button in header
- ✅ Edit profile button
- ✅ Link to Settings page
- ✅ Updated modal

---

## Part 5: Routing & Navigation (1 hour)

### 5.1 App Routes

Add Settings route:

```javascript
// Add Settings lazy import
// Add /settings route
// Add route protection
```

**Features:**
- ✅ Settings route
- ✅ Protected route
- ✅ Lazy loading
- ✅ Navigation

---

## Part 6: API Service Updates (0.5 hours)

### 6.1 Delete Account Endpoint

Add delete account API:

```javascript
userAPI.deleteAccount(userId)
```

**Features:**
- ✅ Delete endpoint
- ✅ Error handling
- ✅ Cache invalidation

---

## Implementation Checklist

### Phase 1: Edit Profile Modal (2 hours)
- [ ] Create EditProfileModal component
- [ ] Add form fields (name, email, phone, city)
- [ ] Add validation
- [ ] Add error handling
- [ ] Test rendering

### Phase 2: Settings Page (2 hours)
- [ ] Create Settings component
- [ ] Add account section
- [ ] Add notifications section
- [ ] Add privacy section
- [ ] Add logout button
- [ ] Add delete account section

### Phase 3: Delete Account (1.5 hours)
- [ ] Create confirmation modal
- [ ] Add type confirmation
- [ ] Add warning messages
- [ ] Implement API call
- [ ] Test flow

### Phase 4: Profile Updates (1 hour)
- [ ] Update PlayerProfile
- [ ] Add Settings button
- [ ] Update modal usage
- [ ] Test integration

### Phase 5: Routing (1 hour)
- [ ] Add Settings import
- [ ] Add /settings route
- [ ] Test navigation
- [ ] Test protection

### Phase 6: API Service (0.5 hours)
- [ ] Add deleteAccount method
- [ ] Test endpoint
- [ ] Error handling

---

## Expected Results

### Profile Editing
- ✅ Users can edit all profile fields
- ✅ Validation works correctly
- ✅ Changes saved to backend
- ✅ Success feedback shown

### Settings Page
- ✅ All settings accessible
- ✅ Logout works
- ✅ Delete account works
- ✅ Navigation works

### Account Management
- ✅ Users can delete accounts
- ✅ Confirmation required
- ✅ Data deleted from backend
- ✅ Redirect after deletion

---

## Success Criteria

- ✅ EditProfileModal component works
- ✅ Settings page renders correctly
- ✅ Profile editing works
- ✅ Account deletion works
- ✅ Logout works
- ✅ Navigation works
- ✅ Mobile responsive
- ✅ 0 ESLint errors
- ✅ 0 TypeScript errors
- ✅ 0 runtime errors

---

## Time Allocation

- Edit Profile Modal: 2 hours
- Settings Page: 2 hours
- Delete Account Flow: 1.5 hours
- Profile Updates: 1 hour
- Routing: 1 hour
- API Service: 0.5 hours
- Buffer: 0.5 hours

**Total: 8 hours**

---

## Next Steps (Day 31+)

- Advanced features
- Payment integration
- Doubles partner selection
- Team management

---

**Status:** 🚀 Ready to execute  
**Date:** December 28, 2024  
**Duration:** 8 hours  
**Next:** Day 31+ - Advanced Features
