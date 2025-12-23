# Day 28: Bracket Visualization & Category Management UI

**Date:** December 26, 2024  
**Status:** 🚀 READY TO EXECUTE  
**Focus:** Bracket visualization, category management interface, player registration flow with categories

---

## Overview

Day 28 implements the visual tournament bracket system and comprehensive category management interface. This enables organizers to visualize tournament brackets with SVG connections and manage categories effectively, while players can register for multiple categories with a streamlined UI.

---

## Part 1: Bracket Visualization Component (2 hours)

### 1.1 BracketView Component

Create comprehensive bracket visualization with SVG connections:

```javascript
// frontend/src/components/tournaments/BracketView.jsx
const BracketView = ({ matches, format = 'knockout' }) => {
  // Organize matches by round
  // Render SVG connections between matches
  // Display player names and scores
  // Handle responsive layout
};
```

**Features:**
- ✅ Knockout bracket visualization
- ✅ League table display
- ✅ SVG connections between matches
- ✅ Player names and scores
- ✅ Match status indicators
- ✅ Responsive design
- ✅ Mobile-friendly layout

---

## Part 2: Category Manager Component (2.5 hours)

### 2.1 CategoryManager Component

Create comprehensive category management interface:

```javascript
// frontend/src/components/organizer/CategoryManager.jsx
const CategoryManager = ({ tournamentId, categories, onUpdate }) => {
  // List all categories
  // Edit category details
  // Delete categories
  // View participant list
  // Generate matches
};
```

**Features:**
- ✅ List all categories
- ✅ Edit category details
- ✅ Delete categories
- ✅ View participants per category
- ✅ Generate matches per category
- ✅ Category status management
- ✅ Participant count tracking

---

## Part 3: Updated TournamentDetails Page (1.5 hours)

### 3.1 Add Category Cards

Display categories with registration modal:

```javascript
// Show category cards
// Registration modal for each category
// Participant list per category
// Join/Leave buttons
```

**Features:**
- ✅ Category cards with details
- ✅ Registration modal
- ✅ Participant list
- ✅ Join/Leave functionality
- ✅ Category status display

---

## Part 4: Updated CreateTournament Page (1 hour)

### 4.1 Add Poster Upload

Add tournament poster upload functionality:

```javascript
// Poster upload field
// Preview functionality
// File validation
```

**Features:**
- ✅ Poster upload
- ✅ Image preview
- ✅ File validation
- ✅ Responsive display

---

## Part 5: Updated PlayerProfile Page (1 hour)

### 5.1 Remove Skill Level

Remove skill level display and add stats dashboard:

```javascript
// Remove skill level section
// Add stats dashboard
// Show tournament history with categories
```

**Features:**
- ✅ No skill level display
- ✅ Stats dashboard
- ✅ Tournament history
- ✅ Category-specific stats

---

## Part 6: API Service Updates (1 hour)

### 6.1 Add Poster Endpoints

```javascript
export const tournamentAPI = {
  uploadPoster: async (tournamentId, file) => { /* ... */ },
  getPoster: async (tournamentId) => { /* ... */ },
};
```

### 6.2 Add Payment Endpoints

```javascript
export const paymentAPI = {
  initiatePayment: async (categoryId, playerId) => { /* ... */ },
  verifyPayment: async (paymentId) => { /* ... */ },
  getPaymentStatus: async (categoryId, playerId) => { /* ... */ },
};
```

---

## Implementation Checklist

### Phase 1: Bracket Visualization (2 hours)
- [ ] Create BracketView component
- [ ] Implement SVG connections
- [ ] Add match display
- [ ] Add responsive layout
- [ ] Test with sample data

### Phase 2: Category Manager (2.5 hours)
- [ ] Create CategoryManager component
- [ ] Add category list
- [ ] Add edit functionality
- [ ] Add delete functionality
- [ ] Add participant view

### Phase 3: TournamentDetails Updates (1.5 hours)
- [ ] Add category cards
- [ ] Add registration modal
- [ ] Add participant list
- [ ] Test registration flow

### Phase 4: CreateTournament Updates (1 hour)
- [ ] Add poster upload
- [ ] Add image preview
- [ ] Add file validation

### Phase 5: PlayerProfile Updates (1 hour)
- [ ] Remove skill level
- [ ] Add stats dashboard
- [ ] Update tournament history

### Phase 6: API Service (1 hour)
- [ ] Add poster endpoints
- [ ] Add payment endpoints
- [ ] Update cache keys

### Phase 7: Testing (1 hour)
- [ ] Test bracket visualization
- [ ] Test category management
- [ ] Test registration flow
- [ ] Test poster upload

---

## Expected Results

### Bracket Visualization
- ✅ Clear visual representation of tournament bracket
- ✅ SVG connections between matches
- ✅ Player names and scores
- ✅ Match status indicators
- ✅ Responsive on mobile

### Category Management
- ✅ Organizers can manage all categories
- ✅ Edit category details
- ✅ View participants
- ✅ Generate matches per category
- ✅ Delete categories

### Player Registration
- ✅ Players can register for multiple categories
- ✅ Clear category information
- ✅ Easy join/leave functionality
- ✅ Participant count display

---

## Success Criteria

- ✅ BracketView component renders correctly
- ✅ CategoryManager component works
- ✅ TournamentDetails shows categories
- ✅ CreateTournament supports poster upload
- ✅ PlayerProfile has no skill level
- ✅ 0 ESLint errors
- ✅ 0 TypeScript errors
- ✅ 0 runtime errors

---

## Time Allocation

- Bracket visualization: 2 hours
- Category manager: 2.5 hours
- TournamentDetails updates: 1.5 hours
- CreateTournament updates: 1 hour
- PlayerProfile updates: 1 hour
- API service: 1 hour
- Testing: 1 hour
- Buffer: 1 hour

**Total: 8 hours**

---

## Next Steps (Day 29)

- Payment integration (Razorpay/PhonePe)
- Doubles partner selection
- Team registration flow
- Advanced tournament management

---

**Status:** 🚀 Ready to execute  
**Date:** December 26, 2024  
**Duration:** 8 hours  
**Next:** Day 29 - Payment Integration & Doubles Partner Selection
