-- This migration creates placeholder data
-- IMPORTANT: Replace with actual data once verified by family

-- Insert memorial record for Alex Shitrit
INSERT INTO memorial (
  hebrew_name,
  english_name,
  gregorian_death_date,
  death_date_verified,
  portrait_url,
  quote,
  intro_text
) VALUES (
  'אלכס שטרית', -- PLACEHOLDER: Verify correct Hebrew spelling
  'Alex Shitrit',
  '2020-10-27',
  false, -- NOT VERIFIED: Need to confirm if death was before or after sunset
  NULL, -- PLACEHOLDER: Family to provide portrait photo
  'PLACEHOLDER_QUOTE_TO_BE_PROVIDED_BY_FAMILY',
  'PLACEHOLDER_INTRO_TEXT_TO_BE_PROVIDED_BY_FAMILY'
);

-- Note: Hebrew death date is intentionally left NULL until verified
-- Family must confirm whether death occurred before or after sunset on 27 Oct 2020
-- to determine if Hebrew date is 10 Cheshvan 5781 or 11 Cheshvan 5781

-- Insert placeholder prayer sections (NOT VERIFIED - family must provide actual nusach)
INSERT INTO prayer_section (memorial_id, section_order, title, hebrew_text, notes, is_verified)
SELECT
  m.id,
  1,
  'פתיחה',
  'PLACEHOLDER_OPENING_BLESSING_TO_BE_VERIFIED_BY_FAMILY',
  'נוסח הפתיחה יאומת על ידי המשפחה לפי המנהג',
  false
FROM memorial m
WHERE m.english_name = 'Alex Shitrit';

INSERT INTO prayer_section (memorial_id, section_order, title, hebrew_text, notes, is_verified)
SELECT
  m.id,
  2,
  'תהילים לפי האותיות',
  'PLACEHOLDER_TEHILLIM_CHAPTERS_TO_BE_VERIFIED_BY_FAMILY',
  'פרקי תהילים לפי אותיות השם יאומתו על ידי המשפחה',
  false
FROM memorial m
WHERE m.english_name = 'Alex Shitrit';

INSERT INTO prayer_section (memorial_id, section_order, title, hebrew_text, notes, is_verified)
SELECT
  m.id,
  3,
  'תהילים לאותיות נשמה',
  'PLACEHOLDER_NESHAMA_TEHILLIM_TO_BE_VERIFIED_BY_FAMILY',
  'יש לאמת אם המנהג המשפחתי כולל פרקים אלו',
  false
FROM memorial m
WHERE m.english_name = 'Alex Shitrit';

INSERT INTO prayer_section (memorial_id, section_order, title, hebrew_text, notes, is_verified)
SELECT
  m.id,
  4,
  'תפילת הנשמה',
  'PLACEHOLDER_NESHAMA_PRAYER_TO_BE_VERIFIED_BY_FAMILY',
  'יש לאמת אם המנהג המשפחתי כולל תפילה זו',
  false
FROM memorial m
WHERE m.english_name = 'Alex Shitrit';

INSERT INTO prayer_section (memorial_id, section_order, title, hebrew_text, notes, is_verified)
SELECT
  m.id,
  5,
  'קדיש',
  'הערה: אמירת קדיש תלויה בהלכה ובמנהג המשפחה. יש להתייעץ עם רב לגבי מי רשאי לומר קדיש.',
  'לא מכילה הוראות הלכתיות - רק הערה כללית',
  false
FROM memorial m
WHERE m.english_name = 'Alex Shitrit';

INSERT INTO prayer_section (memorial_id, section_order, title, hebrew_text, notes, is_verified)
SELECT
  m.id,
  6,
  'סיום',
  'טוב שֵׁם מִשֶּׁמֶן טוֹב וְיוֹם הַמָּוֶת מִיּוֹם הִוָּלְדוֹ',
  'פסוק מקהלת ז:א',
  false
FROM memorial m
WHERE m.english_name = 'Alex Shitrit';

-- Insert placeholder timeline events (family must provide actual dates and details)
INSERT INTO timeline_event (memorial_id, category, title, description, sort_order, is_published)
SELECT
  m.id,
  'childhood',
  'ילדות',
  'PLACEHOLDER_CHILDHOOD_DETAILS_TO_BE_PROVIDED_BY_FAMILY',
  1,
  false
FROM memorial m
WHERE m.english_name = 'Alex Shitrit';

INSERT INTO timeline_event (memorial_id, category, title, description, sort_order, is_published)
SELECT
  m.id,
  'family',
  'משפחה',
  'PLACEHOLDER_FAMILY_DETAILS_TO_BE_PROVIDED_BY_FAMILY',
  2,
  false
FROM memorial m
WHERE m.english_name = 'Alex Shitrit';

INSERT INTO timeline_event (memorial_id, category, title, description, sort_order, is_published)
SELECT
  m.id,
  'marriage',
  'נישואין',
  'PLACEHOLDER_MARRIAGE_DETAILS_TO_BE_PROVIDED_BY_FAMILY',
  3,
  false
FROM memorial m
WHERE m.english_name = 'Alex Shitrit';

INSERT INTO timeline_event (memorial_id, category, title, description, sort_order, is_published)
SELECT
  m.id,
  'children',
  'ילדים',
  'PLACEHOLDER_CHILDREN_DETAILS_TO_BE_PROVIDED_BY_FAMILY',
  4,
  false
FROM memorial m
WHERE m.english_name = 'Alex Shitrit';

INSERT INTO timeline_event (memorial_id, category, title, description, sort_order, is_published)
SELECT
  m.id,
  'grandchildren',
  'נכדים',
  'PLACEHOLDER_GRANDCHILDREN_DETAILS_TO_BE_PROVIDED_BY_FAMILY',
  5,
  false
FROM memorial m
WHERE m.english_name = 'Alex Shitrit';

INSERT INTO timeline_event (memorial_id, category, title, description, sort_order, is_published)
SELECT
  m.id,
  'work',
  'עבודה וקריירה',
  'PLACEHOLDER_WORK_DETAILS_TO_BE_PROVIDED_BY_FAMILY',
  6,
  false
FROM memorial m
WHERE m.english_name = 'Alex Shitrit';

INSERT INTO timeline_event (memorial_id, category, title, description, sort_order, is_published)
SELECT
  m.id,
  'hobbies',
  'תחביבים ותחומי עניין',
  'PLACEHOLDER_HOBBIES_TO_BE_PROVIDED_BY_FAMILY',
  7,
  false
FROM memorial m
WHERE m.english_name = 'Alex Shitrit';

-- Insert placeholder albums
INSERT INTO album (memorial_id, title, description, category, sort_order, is_published)
SELECT
  m.id,
  'תמונות משפחתיות',
  'PLACEHOLDER_ALBUM_DESCRIPTION',
  'family',
  1,
  false
FROM memorial m
WHERE m.english_name = 'Alex Shitrit';

INSERT INTO album (memorial_id, title, description, category, sort_order, is_published)
SELECT
  m.id,
  'אירועים ומועדים',
  'PLACEHOLDER_ALBUM_DESCRIPTION',
  'events',
  2,
  false
FROM memorial m
WHERE m.english_name = 'Alex Shitrit';
