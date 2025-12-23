# Day 27: Tournament Categories & Skill Level Removal

**Date:** December 25, 2024  
**Status:** 🚀 READY TO EXECUTE  
**Focus:** Multi-category tournaments, skill level removal, category-based registration

---

## Overview

Day 27 implements the major architectural change: introducing tournament categories while completely removing skill-level classifications. This enables organizers to create tournaments with multiple event types (Men's Singles, Women's Doubles, Mixed Doubles, etc.) and players to register for multiple categories within the same tournament.

---

## Part 1: Database Schema Changes (2 hours)

### 1.1 Create tournament_categories Table

```sql
CREATE TABLE tournament_categories (
  category_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tournament_id UUID NOT NULL REFERENCES tournaments(tournament_id) ON DELETE CASCADE,
  category_name VARCHAR(100) NOT NULL,
  match_type ENUM('singles', 'doubles', 'mixed_doubles') NOT NULL,
  entry_fee DECIMAL(10,2) DEFAULT 0,
  prize_money_winner DECIMAL(10,2) DEFAULT 0,
  prize_money_runner_up DECIMAL(10,2) DEFAULT 0,
  max_participants INTEGER NOT NULL,
  current_participants INTEGER DEFAULT 0,
  status ENUM('open', 'full', 'in_progress', 'completed') DEFAULT 'open',
  created_at TIMESTAMP DEFAULT NOW()
);

-- Index for faster lookups
CREATE INDEX idx_category_tournament ON tournament_categories(tournament_id);
```

### 1.2 Modify tournaments Table

Remove skill-level and category-specific fields:

```sql
ALTER TABLE tournaments 
DROP COLUMN IF EXISTS skill_level,
DROP COLUMN IF EXISTS match_type,
DROP COLUMN IF EXISTS entry_fee,
DROP COLUMN IF EXISTS prize_money,
DROP COLUMN IF EXISTS max_players,
DROP COLUMN IF EXISTS current_players;
```

### 1.3 Modify users Table

Remove skill level classification:

```sql
ALTER TABLE users 
DROP COLUMN IF EXISTS skill_level;
```

### 1.4 Modify participants Table

Add category reference:

```sql
ALTER TABLE participants 
ADD COLUMN category_id UUID NOT NULL REFERENCES tournament_categories(category_id) ON DELETE CASCADE;

-- Ensure a player can register for multiple categories but only once per category
CREATE UNIQUE INDEX idx_participant_category ON participants(tournament_id, category_id, player_id);
```

### 1.5 Modify matches Table

Add category reference:

```sql
ALTER TABLE matches 
ADD COLUMN category_id UUID NOT NULL REFERENCES tournament_categories(category_id) ON DELETE CASCADE;

CREATE INDEX idx_match_category ON matches(category_id);
```

---

## Part 2: Backend API Changes (2 hours)

### 2.1 New Category Endpoints

```javascript
// Create category
POST /tournaments/:tournamentId/categories
Body: {
  category_name: "Men's Singles",
  match_type: "singles",
  entry_fee: 300,
  prize_money_winner: 2000,
  prize_money_runner_up: 1000,
  max_participants: 16
}

// Get categories for tournament
GET /tournaments/:tournamentId/categories

// Update category
PATCH /categories/:categoryId
Body: { /* updated fields */ }

// Delete category
DELETE /categories/:categoryId
```

### 2.2 Updated Registration Endpoint

```javascript
// Register for category
POST /tournaments/:tournamentId/categories/:categoryId/register
Body: {
  player_id: "uuid",
  partner_id: "uuid" // Only for doubles/mixed doubles
}

// Leave category
DELETE /tournaments/:tournamentId/categories/:categoryId/leave
Body: { player_id: "uuid" }
```

### 2.3 Category-Specific Match Generation

```javascript
// Generate matches for specific category
POST /categories/:categoryId/generate-matches
Body: {
  format: "knockout" // or "league"
}
```

---

## Part 3: Frontend Components (2 hours)

### 3.1 CategoryCard Component

```javascript
// frontend/src/components/tournaments/CategoryCard.jsx
const CategoryCard = ({ category, onRegister, isRegistered }) => {
  return (
    <div className="bg-white rounded-lg border border-gray-200 p-4">
      <h3 className="font-semibold text-gray-900">{category.category_name}</h3>
      <p className="text-sm text-gray-600 mt-1">
        {category.match_type === 'singles' ? 'Singles' : 'Doubles'}
      </p>
      
      <div className="mt-3 space-y-2">
        <p className="text-sm">
          Entry: <span className="font-semibold">₹{category.entry_fee}</span>
        </p>
        <p className="text-sm">
          Prize: <span className="font-semibold">₹{category.prize_money_winner}</span>
        </p>
        <p className="text-sm text-gray-600">
          {category.current_participants}/{category.max_participants} registered
        </p>
      </div>

      <button
        onClick={() => onRegister(category)}
        disabled={isRegistered || category.status === 'full'}
        className="w-full mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 disabled:opacity-50"
      >
        {isRegistered ? 'Registered' : 'Register'}
      </button>
    </div>
  );
};
```

### 3.2 CategoryList Component

```javascript
// frontend/src/components/tournaments/CategoryList.jsx
const CategoryList = ({ categories, onRegister, registeredCategories }) => {
  return (
    <div className="space-y-3">
      {categories.map((category) => (
        <CategoryCard
          key={category.category_id}
          category={category}
          onRegister={onRegister}
          isRegistered={registeredCategories.includes(category.category_id)}
        />
      ))}
    </div>
  );
};
```

### 3.3 AddCategoryForm Component

```javascript
// frontend/src/components/tournaments/AddCategoryForm.jsx
const AddCategoryForm = ({ tournamentId, onAdd, onClose }) => {
  const [formData, setFormData] = useState({
    category_name: '',
    match_type: 'singles',
    entry_fee: 0,
    prize_money_winner: 0,
    prize_money_runner_up: 0,
    max_participants: 16,
  });

  const handleSubmit = async () => {
    // Validate and submit
    await categoryAPI.create(tournamentId, formData);
    onAdd();
  };

  return (
    <div className="bg-white rounded-lg p-6 space-y-4">
      <h2 className="text-xl font-bold">Add Category</h2>
      
      {/* Form fields */}
      <input
        type="text"
        placeholder="Category Name (e.g., Men's Singles)"
        value={formData.category_name}
        onChange={(e) => setFormData({ ...formData, category_name: e.target.value })}
        className="w-full px-4 py-2 border border-gray-300 rounded-lg"
      />

      <select
        value={formData.match_type}
        onChange={(e) => setFormData({ ...formData, match_type: e.target.value })}
        className="w-full px-4 py-2 border border-gray-300 rounded-lg"
      >
        <option value="singles">Singles</option>
        <option value="doubles">Doubles</option>
        <option value="mixed_doubles">Mixed Doubles</option>
      </select>

      {/* More fields... */}

      <div className="flex gap-3">
        <button onClick={onClose} className="flex-1 px-4 py-2 border border-gray-300 rounded-lg">
          Cancel
        </button>
        <button onClick={handleSubmit} className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg">
          Add Category
        </button>
      </div>
    </div>
  );
};
```

---

## Part 4: Updated Tournament Details Page (1.5 hours)

### 4.1 TournamentDetails.jsx Changes

```javascript
// Show categories instead of single match type
const TournamentDetails = () => {
  const [tournament, setTournament] = useState(null);
  const [categories, setCategories] = useState([]);
  const [registeredCategories, setRegisteredCategories] = useState([]);

  useEffect(() => {
    fetchTournamentWithCategories();
  }, []);

  const fetchTournamentWithCategories = async () => {
    const tournament = await tournamentAPI.getById(tournamentId);
    const categories = await categoryAPI.getByTournament(tournamentId);
    setTournament(tournament);
    setCategories(categories);
  };

  const handleRegisterCategory = async (category) => {
    await categoryAPI.register(category.category_id, {
      player_id: user.user_id,
      partner_id: null, // For singles
    });
    setRegisteredCategories([...registeredCategories, category.category_id]);
  };

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      {/* Tournament Header */}
      <div className="bg-white p-4 border-b border-gray-200">
        <h1 className="text-2xl font-bold">{tournament?.name}</h1>
        <p className="text-gray-600">{tournament?.venue}</p>
      </div>

      {/* Categories */}
      <div className="p-4">
        <h2 className="text-lg font-semibold mb-4">Available Categories</h2>
        <CategoryList
          categories={categories}
          onRegister={handleRegisterCategory}
          registeredCategories={registeredCategories}
        />
      </div>
    </div>
  );
};
```

---

## Part 5: Updated Tournament Creation Flow (1.5 hours)

### 5.1 CreateTournament.jsx Changes

Two-step process:
1. Create tournament (basic info)
2. Add categories

```javascript
const CreateTournament = () => {
  const [step, setStep] = useState(1); // 1: Tournament, 2: Categories
  const [tournament, setTournament] = useState(null);
  const [categories, setCategories] = useState([]);

  const handleCreateTournament = async (data) => {
    const created = await tournamentAPI.create(data);
    setTournament(created);
    setStep(2); // Move to category creation
  };

  const handleAddCategory = (category) => {
    setCategories([...categories, category]);
  };

  const handleFinish = async () => {
    // Save all categories
    for (const category of categories) {
      await categoryAPI.create(tournament.tournament_id, category);
    }
    navigate('/organizer/dashboard');
  };

  return (
    <div>
      {step === 1 ? (
        <TournamentForm onSubmit={handleCreateTournament} />
      ) : (
        <div>
          <h2 className="text-xl font-bold mb-4">Add Categories</h2>
          <AddCategoryForm
            tournamentId={tournament.tournament_id}
            onAdd={handleAddCategory}
          />
          <button onClick={handleFinish} className="mt-4 px-4 py-2 bg-green-600 text-white rounded-lg">
            Finish
          </button>
        </div>
      )}
    </div>
  );
};
```

---

## Part 6: API Service Updates (1 hour)

### 6.1 Add Category API Methods

```javascript
// frontend/src/services/api.js

export const categoryAPI = {
  create: async (tournamentId, categoryData) => {
    return apiCall(`/tournaments/${tournamentId}/categories`, {
      method: 'POST',
      body: JSON.stringify(categoryData),
    });
  },

  getByTournament: async (tournamentId) => {
    const cacheKey = `categories_${tournamentId}`;
    const cached = apiCache.get(cacheKey);
    if (cached) return cached;

    const data = await apiCall(`/tournaments/${tournamentId}/categories`, {
      method: 'GET',
    });

    apiCache.set(cacheKey, data, 300000);
    return data;
  },

  register: async (categoryId, registrationData) => {
    return apiCall(`/categories/${categoryId}/register`, {
      method: 'POST',
      body: JSON.stringify(registrationData),
    });
  },

  leave: async (categoryId, playerId) => {
    return apiCall(`/categories/${categoryId}/leave`, {
      method: 'DELETE',
      body: JSON.stringify({ player_id: playerId }),
    });
  },

  generateMatches: async (categoryId, format) => {
    return apiCall(`/categories/${categoryId}/generate-matches`, {
      method: 'POST',
      body: JSON.stringify({ format }),
    });
  },
};
```

---

## Part 7: Player Profile Updates (0.5 hours)

### 7.1 Remove Skill Level Display

```javascript
// OLD (REMOVED):
// ❌ Skill Level: Intermediate

// NEW:
// ✅ Shows only stats and history
// ✅ No skill labels
// ✅ Objective metrics only
```

---

## Implementation Checklist

### Phase 1: Database (2 hours)
- [ ] Create tournament_categories table
- [ ] Add category_id to participants
- [ ] Add category_id to matches
- [ ] Remove skill_level from users
- [ ] Remove category fields from tournaments
- [ ] Create indexes

### Phase 2: Backend API (2 hours)
- [ ] Create category endpoints
- [ ] Update registration endpoints
- [ ] Update match generation
- [ ] Add category-specific queries

### Phase 3: Frontend Components (2 hours)
- [ ] Create CategoryCard component
- [ ] Create CategoryList component
- [ ] Create AddCategoryForm component
- [ ] Update TournamentDetails page

### Phase 4: Tournament Creation (1.5 hours)
- [ ] Update CreateTournament flow
- [ ] Add two-step process
- [ ] Test category creation

### Phase 5: API Service (1 hour)
- [ ] Add categoryAPI methods
- [ ] Update tournamentAPI
- [ ] Add caching

### Phase 6: Testing (1 hour)
- [ ] Create tournament with categories
- [ ] Register for multiple categories
- [ ] Generate matches per category
- [ ] Verify player profile (no skill level)

---

## Expected Results

### Before Day 27
- ❌ Single match type per tournament
- ❌ Skill level classifications
- ❌ No multiple categories
- ❌ Limited tournament flexibility

### After Day 27
- ✅ Multiple categories per tournament
- ✅ No skill level classifications
- ✅ Players register per category
- ✅ Matches generated per category
- ✅ Clean player profiles

---

## Success Criteria

- ✅ Can create tournament with multiple categories
- ✅ Player can register for multiple categories
- ✅ Matches generate per category independently
- ✅ Player profile shows no skill level
- ✅ Category-specific match management works
- ✅ 0 ESLint errors
- ✅ 0 TypeScript errors
- ✅ 0 runtime errors

---

## Time Allocation

- Database changes: 2 hours
- Backend API: 2 hours
- Frontend components: 2 hours
- Tournament creation: 1.5 hours
- API service: 1 hour
- Testing: 1 hour
- Buffer: 1.5 hours

**Total: 8 hours**

---

## Next Steps (Day 28)

- Doubles partner selection
- Team registration flow
- Payment integration
- Tournament management enhancements

---

**Status:** 🚀 Ready to execute  
**Date:** December 25, 2024  
**Duration:** 8 hours  
**Next:** Day 28 - Doubles Partner Selection & Team Registration

