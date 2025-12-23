# Day 31: Tournament Deletion & Cancellation

**Date:** December 29, 2024  
**Status:** 🚀 READY TO EXECUTE  
**Focus:** Tournament deletion UI, confirmation flow, backend integration

---

## Overview

Day 31 implements comprehensive tournament deletion and cancellation functionality. Organizers can safely delete upcoming tournaments with proper confirmation, while the system prevents deletion of live or completed tournaments.

---

## Part 1: Delete Confirmation Modal (2 hours)

### 1.1 DeleteTournamentModal Component

Create comprehensive deletion confirmation modal:

```javascript
// frontend/src/components/organizer/DeleteTournamentModal.jsx
const DeleteTournamentModal = ({
  isOpen,
  onClose,
  onConfirm,
  tournament,
  participantCount,
  paidCount,
  categoryCount,
  isLoading,
}) => {
  // Type "DELETE" confirmation
  // Warning messages
  // Deletion details
};
```

**Features:**
- ✅ Type "DELETE" confirmation
- ✅ Warning about data loss
- ✅ List of what gets deleted
- ✅ Paid registration warning
- ✅ Tournament details display
- ✅ Loading states
- ✅ Error handling

---

## Part 2: Delete Button & UI (1.5 hours)

### 2.1 TournamentManagement Updates

Add delete button to tournament management:

```javascript
// Show delete button only if:
// - Tournament status is 'upcoming'
// - Tournament date is in future
// - Organizer owns the tournament
```

**Features:**
- ✅ Delete button in header
- ✅ Disabled state for non-deletable tournaments
- ✅ Tooltip explaining why deletion is disabled
- ✅ Responsive design

---

## Part 3: Backend Integration (2 hours)

### 3.1 Delete Tournament Endpoint

Implement DELETE /tournaments/:id endpoint:

```javascript
// Validations:
// - Verify ownership
// - Check status (not live/completed)
// - Check date (not past)
// - Delete in order: payments → registrations → categories → matches → tournament
// - Delete poster from storage
```

**Features:**
- ✅ Ownership verification
- ✅ Status validation
- ✅ Date validation
- ✅ Cascade deletion
- ✅ Poster deletion
- ✅ Transaction safety
- ✅ Error handling

---

## Part 4: Edge Cases & Validation (1.5 hours)

### 4.1 Validation Rules

```javascript
// Cannot delete if:
// - Tournament is live
// - Tournament is completed
// - Tournament date has passed
// - User is not organizer

// Can delete if:
// - Tournament is upcoming
// - Tournament date is in future
// - User is organizer
```

**Features:**
- ✅ Status checks
- ✅ Date checks
- ✅ Ownership checks
- ✅ Clear error messages

---

## Part 5: State Management & Navigation (1 hour)

### 5.1 Frontend State

```javascript
// Track:
// - showDeleteModal (boolean)
// - deleting (boolean)
// - deleteError (string)

// On success:
// - Show success message
// - Redirect to dashboard
```

**Features:**
- ✅ Modal state
- ✅ Loading state
- ✅ Error state
- ✅ Success feedback
- ✅ Navigation

---

## Implementation Checklist

### Phase 1: Modal Component (2 hours)
- [ ] Create DeleteTournamentModal
- [ ] Add type confirmation
- [ ] Add warning messages
- [ ] Add deletion details
- [ ] Test rendering

### Phase 2: Delete Button (1.5 hours)
- [ ] Add delete button to header
- [ ] Add disabled state logic
- [ ] Add modal trigger
- [ ] Test button states

### Phase 3: Backend (2 hours)
- [ ] Create DELETE endpoint
- [ ] Add validations
- [ ] Add cascade deletion
- [ ] Add poster deletion
- [ ] Test endpoint

### Phase 4: Edge Cases (1.5 hours)
- [ ] Test cannot delete live
- [ ] Test cannot delete completed
- [ ] Test cannot delete past date
- [ ] Test cannot delete other's tournament

### Phase 5: State Management (1 hour)
- [ ] Add modal state
- [ ] Add loading state
- [ ] Add error handling
- [ ] Test navigation

---

## Expected Results

### Delete Functionality
- ✅ Organizers can delete upcoming tournaments
- ✅ Cannot delete live tournaments
- ✅ Cannot delete completed tournaments
- ✅ Cannot delete past-date tournaments
- ✅ Confirmation required

### Data Deletion
- ✅ Tournament deleted
- ✅ Categories deleted
- ✅ Registrations deleted
- ✅ Matches deleted
- ✅ Payments deleted
- ✅ Poster deleted

### User Experience
- ✅ Clear warnings
- ✅ Type confirmation
- ✅ Success feedback
- ✅ Error messages

---

## Success Criteria

- ✅ DeleteTournamentModal works
- ✅ Delete button shows/hides correctly
- ✅ Confirmation flow works
- ✅ Backend deletion works
- ✅ Cascade deletion works
- ✅ Poster deletion works
- ✅ Error handling works
- ✅ Navigation works
- ✅ 0 ESLint errors
- ✅ 0 TypeScript errors
- ✅ 0 runtime errors

---

## Time Allocation

- Delete Modal: 2 hours
- Delete Button UI: 1.5 hours
- Backend Integration: 2 hours
- Edge Cases: 1.5 hours
- State Management: 1 hour
- Buffer: 0.5 hours

**Total: 8 hours**

---

## Next Steps (Day 32+)

- Advanced tournament features
- Payment integration
- Doubles partner selection
- Team management

---

**Status:** 🚀 Ready to execute  
**Date:** December 29, 2024  
**Duration:** 8 hours  
**Next:** Day 32+ - Advanced Features
