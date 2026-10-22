# Psalm 119 Display Enhancements - TODO

## ✅ Completed
- [x] Correct spelling: יחיה → יחיא (ending in alef)
- [x] Replace ה eighth with א eighth (verses 1-8)
- [x] Update all occurrences in seed file, tests, hashkava [[NAME]]
- [x] Fetch correct verses from Sefaria with nikud
- [x] All tests passing (17/17)

## 🔄 Remaining Tasks

### 1. Enhanced Headers Above Each Eighth

**Requirement**: Show header above each eighth with full name and highlighted current letter

**Example for [א | 1]**:
```
┌────────────────────────────────────────┐
│  [א]לכס יחיא בן פורטונה                │
│  א׳ – אלכס                              │
└────────────────────────────────────────┘
```

**Implementation**:
- Parse section_id: `psalm119-name` or `psalm119-neshama`
- Extract letter from verse heading: `[א | 1]`
- Map letter position to word in name:
  - Letters 1-5: אלכס (positions א,ל,כ,ס,א)
  - Letters 6-9: יחיא (positions י,ח,י,א)
  - Letters 10-12: בן (positions ב,ן)
  - Letters 13-19: פורטונה (positions פ,ו,ר,ט,ו,נ,ה)
  - Letters 20-24: נשמה (positions נ,ש,מ,ה)
- Highlight current letter in name display
- Show label: `{letter}׳ – {word_name}`

**Component location**: `src/components/PrayersContent.tsx`
- Update `renderVerse()` function
- Add new function `renderPsalm119Header()`

### 2. Drop Caps for First Letter of Each Verse

**Requirement**: First letter of each verse as large drop cap (RTL-correct)

**CSS needed**:
```css
.verse-drop-cap::first-letter {
  float: right; /* RTL */
  font-size: 3em;
  line-height: 0.9;
  padding-left: 0.1em;
  color: var(--sand-color);
  font-weight: bold;
}
```

**Implementation**:
- Add `verse-drop-cap` class to verse paragraphs
- Exclude letter headings from drop cap treatment
- Test RTL layout at 375px

### 3. Quick-Jump Menu Enhancement

**Current**: Separate buttons for "תהילים קיט – אלכס..." and "תהילים קיט – נשמה"

**Required**: Single merged entry "תהילים קיט" with optional sub-navigation

**Implementation**:
```typescript
// In PrayersContent.tsx
const renderQuickJump = () => {
  const groupedSections = prayerSections.reduce((acc, section, index) => {
    if (section.section_id.startsWith('psalm119-')) {
      if (!acc.psalm119) {
        acc.psalm119 = { sections: [], firstIndex: index };
      }
      acc.psalm119.sections.push({ section, index });
    } else {
      acc.other.push({ section, index });
    }
    return acc;
  }, { psalm119: null, other: [] });
  
  // Render merged button for psalm119 group
  // Optional: expand/collapse sub-navigation for individual letters
};
```

**UI**:
- Main button: "תהילים קיט"
- On click: Jump to first psalm119 section
- Optional: Expand to show letter-by-letter navigation

### 4. Testing

**Required tests**:
- [ ] Header displays correct name with highlighted letter
- [ ] Drop caps render correctly in RTL
- [ ] Quick-jump menu merges psalm119 entries
- [ ] Mobile 375px: All enhancements visible and functional
- [ ] Static build passes

**Test file**: `__tests__/prayer-sections.test.ts` or new `__tests__/psalm119-display.test.ts`

## Implementation Notes

### Letter-to-Word Mapping
```typescript
const NAME_LETTERS = {
  'אלכס': ['א', 'ל', 'כ', 'ס'],  // positions 1-4
  'יחיא': ['י', 'ח', 'י', 'א'],  // positions 5-8
  'בן': ['ב', 'ן'],              // positions 9-10
  'פורטונה': ['פ', 'ו', 'ר', 'ט', 'ו', 'נ', 'ה']  // positions 11-17
};

const NESHAMA_LETTERS = ['נ', 'ש', 'מ', 'ה'];  // positions 18-21
```

### Handling Repeated Letters
- א appears twice (positions 1, 8)
- י appears twice (positions 5, 7)
- ו appears twice (positions 12, 15)
- ן is treated as final form of נ

### RTL Layout Considerations
- Drop caps must float right, not left
- Letter highlighting should preserve RTL text flow
- Mobile layout must not break Hebrew text rendering

## Files to Modify

1. `src/components/PrayersContent.tsx` - Main component
2. `src/styles/globals.css` or component styles - Drop cap CSS
3. `__tests__/psalm119-display.test.ts` - New test file (optional)
4. `__tests__/prayer-sections.test.ts` - Update existing tests

## Acceptance Criteria

- [ ] Each Psalm 119 eighth shows header with full name
- [ ] Current letter is visually highlighted in header
- [ ] Label shows `{letter}׳ – {word}` (e.g., "א׳ – אלכס")
- [ ] First letter of each verse is a large drop cap
- [ ] Drop caps work correctly in RTL layout
- [ ] Quick-jump shows single "תהילים קיט" entry
- [ ] All tests pass
- [ ] Static build succeeds
- [ ] Mobile 375px layout works correctly

## Priority

**High Priority**:
1. Enhanced headers (most visible to users)
2. Quick-jump menu merge (improves navigation)

**Medium Priority**:
3. Drop caps (aesthetic enhancement)
