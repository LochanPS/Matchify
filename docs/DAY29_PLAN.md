# Day 29: League Standings Table

**Date:** December 27, 2024  
**Status:** 🚀 READY TO EXECUTE  
**Focus:** League standings table, points calculation, sorting and ranking system

---

## Overview

Day 29 implements the league standings table component for league-format tournaments. Players can view their rankings based on match results, with points calculated using a 3-point-for-win system. The standings are automatically sorted by points, win rate, and wins.

---

## Part 1: Standings Table Component (2 hours)

### 1.1 StandingsTable Component

Create comprehensive standings table component:

```javascript
// frontend/src/components/tournaments/StandingsTable.jsx
const StandingsTable = ({ tournamentId, categoryId }) => {
  const [standings, setStandings] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);

  // Fetch standings data
  // Calculate points (3 per win, 0 per loss)
  // Sort by points, then win rate
  // Display in table format
};
```

**Features:**
- ✅ Display all players with rankings
- ✅ Show match records (played, won, lost)
- ✅ Display points (3 per win)
- ✅ Calculate win percentage
- ✅ Search/filter by player name
- ✅ Highlight top 3 players
- ✅ Show rank icons (gold, silver, bronze)
- ✅ Responsive table layout
- ✅ Summary statistics

---

## Part 2: Points Calculation Logic (2 hours)

### 2.1 Scoring System

```javascript
// Points calculation
const calculateStandings = (matches, participants) => {
  const standings = {};

  // Initialize all participants
  participants.forEach(p => {
    standings[p.player_id] = {
      playerId: p.player_id,
      playerName: p.name,
      matchesPlayed: 0,
      wins: 0,
      losses: 0,
      points: 0,
      winRate: 0
    };
  });

  // Process each completed match
  matches.forEach(match => {
    if (match.status === 'completed') {
      standings[match.player1_id].matchesPlayed++;
      standings[match.player2_id].matchesPlayed++;

      if (match.winner_id === match.player1_id) {
        standings[match.player1_id].wins++;
        standings[match.player1_id].points += 3;
        standings[match.player2_id].losses++;
      } else {
        standings[match.player2_id].wins++;
        standings[match.player2_id].points += 3;
        standings[match.player1_id].losses++;
      }
    }
  });

  // Calculate win rates
  Object.values(standings).forEach(player => {
    player.winRate = player.matchesPlayed > 0
      ? Math.round((player.wins / player.matchesPlayed) * 100)
      : 0;
  });

  return standings;
};
```

**Features:**
- ✅ 3 points for win, 0 for loss
- ✅ Accurate match counting
- ✅ Win rate calculation
- ✅ Handles players with 0 matches

---

## Part 3: Sorting and Ranking System (1.5 hours)

### 3.1 Sorting Logic

```javascript
// Sort standings
standings.sort((a, b) => {
  // Primary: Points (descending)
  if (b.points !== a.points) {
    return b.points - a.points;
  }
  // Secondary: Win rate (descending)
  if (b.winRate !== a.winRate) {
    return b.winRate - a.winRate;
  }
  // Tertiary: Wins (descending)
  if (b.wins !== a.wins) {
    return b.wins - a.wins;
  }
  // Final: Alphabetical by name
  return a.playerName.localeCompare(b.playerName);
});

// Add rank
standings = standings.map((player, index) => ({
  ...player,
  rank: index + 1
}));
```

**Features:**
- ✅ Primary sort by points
- ✅ Secondary sort by win rate
- ✅ Tertiary sort by wins
- ✅ Alphabetical tie-breaker
- ✅ Rank assignment

---

## Part 4: Integration with Results Tab (1.5 hours)

### 4.1 TournamentManagement Updates

Update Results tab to show standings:

```javascript
// Results tab shows standings for league tournaments
{activeTab === 'results' && (
  <>
    {tournament.format === 'league' ? (
      <StandingsTable
        tournamentId={tournamentId}
        categoryId={selectedCategory}
      />
    ) : (
      <BracketView
        matches={matches}
        format={tournament.format}
      />
    )}
  </>
)}
```

**Features:**
- ✅ Category selector for multi-category tournaments
- ✅ Conditional rendering based on format
- ✅ Real-time updates
- ✅ Error handling

---

## Part 5: Testing with Sample Data (1 hour)

### 5.1 Test Scenarios

- ✅ 6 players, round-robin format
- ✅ Verify points calculation
- ✅ Verify sorting logic
- ✅ Test search functionality
- ✅ Test mobile responsiveness
- ✅ Test edge cases (0 matches, ties)

---

## Implementation Checklist

### Phase 1: Component (2 hours)
- [ ] Create StandingsTable component
- [ ] Add search functionality
- [ ] Add rank icons (gold, silver, bronze)
- [ ] Add summary statistics
- [ ] Test rendering

### Phase 2: Points Calculation (2 hours)
- [ ] Implement scoring system
- [ ] Calculate win rates
- [ ] Handle edge cases
- [ ] Test calculations

### Phase 3: Sorting (1.5 hours)
- [ ] Implement primary sort (points)
- [ ] Implement secondary sort (win rate)
- [ ] Implement tertiary sort (wins)
- [ ] Implement tie-breaker (name)
- [ ] Test sorting logic

### Phase 4: Integration (1.5 hours)
- [ ] Update TournamentManagement
- [ ] Add category selector
- [ ] Add conditional rendering
- [ ] Test integration

### Phase 5: Testing (1 hour)
- [ ] Test with sample data
- [ ] Test edge cases
- [ ] Test mobile responsiveness
- [ ] Test error handling

---

## Expected Results

### Standings Display
- ✅ All players ranked by points
- ✅ Match records visible
- ✅ Win percentages calculated
- ✅ Top 3 highlighted
- ✅ Search functionality working

### Points System
- ✅ 3 points per win
- ✅ 0 points per loss
- ✅ Accurate calculations
- ✅ Proper tie-breaking

### User Experience
- ✅ Clear visual hierarchy
- ✅ Mobile-friendly layout
- ✅ Fast loading
- ✅ Real-time updates

---

## Success Criteria

- ✅ StandingsTable component renders correctly
- ✅ Points calculated accurately (3 per win)
- ✅ Standings sorted correctly
- ✅ Search functionality works
- ✅ Top 3 players highlighted
- ✅ Mobile responsive
- ✅ 0 ESLint errors
- ✅ 0 TypeScript errors
- ✅ 0 runtime errors

---

## Time Allocation

- Component structure: 2 hours
- Points calculation: 2 hours
- Sorting logic: 1.5 hours
- Integration: 1.5 hours
- Testing: 1 hour
- Buffer: 0.5 hours

**Total: 8 hours**

---

## Next Steps (Day 30)

- Edit Profile & Settings
- Remove skill level from profile editing
- Add profile picture upload
- Settings page with logout

---

**Status:** 🚀 Ready to execute  
**Date:** December 27, 2024  
**Duration:** 8 hours  
**Next:** Day 30 - Edit Profile & Settings
