# אתר הנצחה - אלכס שטרית ז"ל

אתר הנצחה מקוון לזכרו של אלכס שטרית, בנוי עם Next.js, TypeScript, Supabase, ומותאם לעברית RTL עם נגישות מלאה.

## 🎯 תכונות עיקריות

- **דף בית** - פורטרט, ציטוט, הקדמה, ספירה לאזכרה הבאה
- **סיפור חיים** - ציר זמן עם פרקים: ילדות, משפחה, נישואין, ילדים, נכדים, עבודה, תחביבים
- **גלריה** - אלבומי תמונות וסרטונים ממוינים לפי קטגוריות
- **זכרונות** - משפחה וחברים משתפים סיפורים (עם מערכת אישור)
- **תפילות (/prayers)** - עמוד מהיר ללא התחברות, מותאם לסריקת QR, עם שליטת גודל טקסט וניווט
- **מורשת** - ערכים, פתגמים, עצות, מסורות משפחתיות
- **אזור ניהול (CMS)** - ממשק מלא לניהול תכנים, משתמשים, אישורים, תפילות, לוח אזכרה

## 📋 דרישות מקדימות

- Node.js 18.x או גבוה יותר
- npm או yarn
- חשבון Supabase (ראה הגדרה למטה)

## 🚀 התקנה והרצה מקומית

### 1. שכפול והתקנת dependencies

```bash
git clone <repository-url>
cd <repository-name>
npm install
```

### 2. הגדרת משתני סביבה

העתק את קובץ הדוגמה ליצירת `.env.local`:

```bash
cp .env.example .env.local
```

ערוך את `.env.local` והשלם את הערכים הבאים:

```env
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key-here

# Site Configuration
NEXT_PUBLIC_SITE_URL=http://localhost:3000

# Hebrew Date Configuration
# ⚠️ CRITICAL: Requires family verification!
# Death occurred on 27 Oct 2020
# If BEFORE sunset: 9 Cheshvan 5781
# If AFTER sunset: 10 Cheshvan 5781
NEXT_PUBLIC_DEATH_DATE_HEBREW_DAY=PENDING_VERIFICATION
NEXT_PUBLIC_DEATH_DATE_HEBREW_MONTH=PENDING_VERIFICATION
NEXT_PUBLIC_DEATH_DATE_HEBREW_YEAR=PENDING_VERIFICATION

# Cemetery Location (for halachic times calculation)
NEXT_PUBLIC_CEMETERY_LATITUDE=31.7683
NEXT_PUBLIC_CEMETERY_LONGITUDE=35.2137
NEXT_PUBLIC_CEMETERY_TIMEZONE=Asia/Jerusalem
```

### 3. הגדרת Supabase

#### יצירת פרויקט Supabase

1. עבור אל [supabase.com](https://supabase.com)
2. צור פרויקט חדש
3. העתק את ה-URL וה-anon key מהגדרות הפרויקט

#### הרצת Migrations

```bash
# התקן את Supabase CLI
npm install -g supabase

# התחבר לפרויקט
supabase link --project-ref your-project-ref

# הרץ את ה-migrations
supabase db push
```

לחלופין, העתק את תוכן הקבצים מ-`supabase/migrations/` והרץ אותם ישירות ב-SQL Editor של Supabase.

#### הגדרת Authentication

1. בפאנל Supabase, עבור אל **Authentication > Providers**
2. הפעל **Google OAuth**:
   - הרשם ל-Google Cloud Console
   - צור OAuth 2.0 credentials
   - הוסף את ה-Client ID ו-Client Secret ב-Supabase
3. הפעל **Email authentication**
4. הגדר Email Templates (אופציונלי)

#### הגדרת Storage

1. עבור אל **Storage**
2. צור bucket בשם `media`
3. הגדר Storage policies (או השתמש ב-RLS policies המוגדרות)

### 4. הרצה מקומית

```bash
npm run dev
```

האתר יהיה זמין ב: `http://localhost:3000`

## 🧪 הרצת Tests

```bash
# הרץ את כל ה-tests
npm test

# הרץ tests במצב watch
npm run test:watch

# type-check
npm run type-check
```

### Tests חשובים

- **hebrew-dates.test.ts** - בדיקת חישוב תאריכי אזכרה (CRITICAL)
- **calendar.test.ts** - בדיקת יצירת קבצי ICS ו-Google Calendar
- **qr.test.ts** - בדיקת יצירת קודי QR

## 🏗️ מבנה הפרויקט

```
/
├── src/
│   ├── app/                    # Next.js App Router pages
│   │   ├── page.tsx           # דף בית
│   │   ├── prayers/           # תפילות (QR target)
│   │   ├── life-story/        # סיפור חיים
│   │   ├── gallery/           # גלריה
│   │   ├── memories/          # זכרונות
│   │   ├── legacy/            # מורשת
│   │   └── admin/             # אזור ניהול
│   ├── components/            # React components
│   ├── lib/                   # Supabase clients
│   ├── types/                 # TypeScript type definitions
│   └── utils/                 # Utility functions
│       ├── hebrew-dates.ts    # חישובי תאריכים עבריים
│       ├── calendar.ts        # יצירת קבצי לוח שנה
│       └── qr.ts              # יצירת קודי QR
├── supabase/
│   └── migrations/            # SQL migrations
├── __tests__/                 # Jest tests
└── public/                    # Static assets
```

## 📊 Schema - טבלאות מרכזיות

- **memorial** - מידע מרכזי על הנפטר
- **timeline_event** - אירועי ציר הזמן
- **story** - זכרונות שהוגשו
- **album** - אלבומי תמונות
- **media_asset** - תמונות וסרטונים
- **user_profile** - פרופילי משתמשים
- **user_membership** - הרשאות ותפקידים
- **prayer_section** - נוסחי תפילות
- **memorial_schedule** - לוח אזכרה שנתי
- **approval_record** - מעקב אישורים
- **audit_log** - יומן פעולות
- **consent_record** - הסכמות משתמשים

כל הטבלאות מוגנות ב-Row Level Security (RLS).

## 🔒 תפקידים והרשאות

1. **Visitor** - גישה לתוכן ציבורי ותפילות
2. **Registered** - העלאת תמונות וסיפורים (דורש אישור)
3. **Content Manager** - אישור ועריכת תכנים
4. **Super Admin** - שליטה מלאה, ניהול משתמשים, הגדרות

## 🎨 עיצוב

### פלטת צבעים

- **Background**: `#F4F0E8` - רקע חם
- **Text**: `#242521` - טקסט כהה
- **Sand**: `#B3A184` - אקצנט חול
- **Linen**: `#E5DED1` - לינן בהיר

### Typography

- גופנים: System fonts מותאמים לעברית
- RTL by default
- גודל טקסט ניתן לשליטה (תפילות)
- קריאות גבוהה, ניגודיות מתאימה

### נגישות

- WCAG 2.1 AA compliant
- כפתורים בגודל מינימלי 44x44px
- תמיכה ב-keyboard navigation
- תמיכה ב-screen readers
- ניגודיות גבוהה

## 📅 חישוב תאריכי אזכרה

### ⚠️ CRITICAL: אימות נדרש

התאריך העברי **חייב** לעבור אימות משפחתי:

- **תאריך לועזי ידוע**: 27 אוקטובר 2020
- **שעת הפטירה ביחס לשקיעה**: לא אומת

**אם הפטירה הייתה לפני שקיעה**: ט' בחשוון תשפ"א (9 Cheshvan 5781)  
**אם הפטירה הייתה אחרי שקיעה**: י' בחשוון תשפ"א (10 Cheshvan 5781)

### שימוש ב-Hebcal

הפרויקט משתמש ב-`@hebcal/core` לחישובים מדויקים:
- ממיר בין לועזי לעברי
- מחשב תאריכי יארצייט (אזכרה)
- מטפל בשנים מעוברות אוטומטית
- **לעולם לא** משתמש ב-+12 חודשים פשוטים

### זמנים הלכתיים

- שקיעה וצאת הכוכבים מחושבים לפי מיקום בית העלמין
- אזור זמן: `Asia/Jerusalem` (כולל DST)
- **מופרד** משעות האירוע המשפחתי (מוזנות ידנית)

## 📱 קוד QR

### יצירת QR

```typescript
import { generateQRCodeSVG, generateQRCodePNG } from '@/utils/qr';

// SVG for web
const svg = await generateQRCodeSVG('https://site.com/prayers');

// High-res PNG for print
const png = await generateQRCodePNG('https://site.com/prayers');
```

### המלצות

- URL קצר וקבוע: `/prayers`
- שימוש בדומיין מותאם אישית (למשל `alexshitrit.com/prayers`)
- כיתוב מתחת: "לקריאת התפילות ולהנצחת זכרו — סרקו כאן"
- גרסת SVG לאתר, PNG ברזולוציה גבוהה להדפסה/חריטה

## 📤 Deployment

### Firebase App Hosting (מומלץ)

הפרויקט מוגדר לפריסה ב-Firebase App Hosting עם Next.js SSR.

**ראה [FIREBASE_DEPLOYMENT.md](./FIREBASE_DEPLOYMENT.md) להוראות שלב-אחר-שלב מלאות.**

**סיכום מהיר**:
1. צור פרויקט Firebase (דרישה: Blaze plan)
2. הגדר secrets ב-Cloud Secret Manager
3. חבר repository מ-GitHub
4. הפעל deployment אוטומטי
5. הוסף custom domain

**עלויות צפויות**: $25-60/חודש (כולל Supabase)

### Vercel (אלטרנטיבה)

```bash
# התקן Vercel CLI
npm i -g vercel

# Deploy
vercel

# Production deploy
vercel --prod
```

הגדר משתני סביבה ב-Vercel Dashboard.

### הגדרת דומיין מותאם

1. רכוש דומיין (למשל: `alexshitrit.com`)
2. הגדר ב-Vercel או בספק ה-hosting
3. עדכן `NEXT_PUBLIC_SITE_URL`
4. הגדר SSL certificate (אוטומטי ב-Vercel)

## 💰 עלויות ו-Free Tier

### Supabase Free Tier

- **Database**: 500MB
- **Storage**: 1GB
- **Bandwidth**: 2GB/חודש
- **Auth users**: ללא הגבלה

**צפי עלויות**:
- התחלה: חינם
- צמיחה בינונית: $25-50/חודש
- שימוש גבוה: $100+/חודש

### Vercel Free Tier

- **Bandwidth**: 100GB/חודש
- **Builds**: 6,000 דקות/חודש
- **Serverless functions**: 100GB-Hours

**צפי עלויות**:
- אתר אישי/משפחתי: בדרך כלל בחינם
- טרפיק גבוה: $20+/חודש

### דומיין

- רכישה: $10-30/שנה (תלוי ב-TLD)
- חידוש שנתי נדרש

### סה"כ - תחזית

- **חודשים ראשונים**: $0-10/חודש (+ דומיין)
- **שימוש ממוצע**: $30-70/חודש
- **שימוש גבוה**: $100-200/חודש

## 🛠️ תחזוקה

### גיבויים

1. **Database**: 
   - Supabase מספק גיבויים אוטומטיים (פרויקטים בתשלום)
   - ייצוא ידני דרך אזור הניהול
2. **Storage**:
   - גיבוי ידני של ה-bucket
   - שמור עותק מקומי של כל המדיה

### עדכונים

```bash
# עדכון dependencies
npm update

# בדיקת vulnerabilities
npm audit

# תיקון אוטומטי
npm audit fix
```

## ⚠️ Placeholders שדורשים השלמה

הפרויקט כולל placeholders מפורשים ב:

1. **תמונה**: אין תמונת פורטרט - המשפחה צריכה לספק
2. **טקסטים**: כל התכנים ביוגרפיים מסומנים כ-PLACEHOLDER
3. **תפילות**: נוסחי התפילות דורשים אימות ע"י המשפחה לפי המנהג
4. **תאריך עברי**: דורש אימות סופי (לפני/אחרי שקיעה)
5. **פרטי משפחה**: ילדים, נכדים, אירועים - המשפחה תשלים

## 🔐 Security

- אימות דרך Supabase Auth (Google OAuth + Email)
- Row Level Security (RLS) על כל הטבלאות
- הגבלת גודל ק files
- Rate limiting על טפסים ציבוריים
- Audit log למעקב אחר פעולות מנהלים
- אין סיסמאות שמורות ישירות

## 📚 משאבים נוספים

- [Next.js Documentation](https://nextjs.org/docs)
- [Supabase Documentation](https://supabase.com/docs)
- [Hebcal API](https://www.hebcal.com/home/developer-apis)
- [WCAG Guidelines](https://www.w3.org/WAI/WCAG21/quickref/)

## 🤝 תמיכה

לשאלות או בעיות, פנו למשפחה או למפתח.

## 📄 License

כל התכנים והקוד באתר זה שייכים למשפחת שטרית.  
שימוש מסחרי או העתקה אסורים ללא אישור מפורש.

---

**הערה חשובה**: אתר זה נבנה באהבה ובכבוד לזכרו של אלכס שטרית ז"ל.  
כל התכנים דורשים אימות משפחתי לפני פרסום סופי.
