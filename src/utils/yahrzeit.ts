import { HDate, HebrewCalendar, Location, greg } from '@hebcal/core';

export interface YahrzeitInfo {
  hebrewDate: string; // e.g., "ט׳ בחשון תשפ״ה"
  gregorianDate: Date;
  dayOfWeek: string; // Hebrew day of week
  gregorianFormatted: string; // e.g., "15 באוקטובר 2024"
  yearsSince: number; // Hebrew years since death
  isToday: boolean;
  daysUntil: number;
  hoursUntil: number;
  minutesUntil: number;
  secondsUntil: number;
}

/**
 * Calculate the next yahrzeit (Hebrew anniversary of death)
 * 
 * @param hebrewDay - Day of Hebrew death date (e.g., 9)
 * @param hebrewMonth - Hebrew month name (e.g., "Cheshvan")
 * @param hebrewYear - Hebrew year of death (e.g., 5781)
 * @param timezone - Timezone for calculations (default: 'Asia/Jerusalem')
 * @returns YahrzeitInfo object with next yahrzeit details
 */
export function calculateNextYahrzeit(
  hebrewDay: number,
  hebrewMonth: string,
  hebrewYear: number,
  timezone: string = 'Asia/Jerusalem'
): YahrzeitInfo {
  // Create Jerusalem location for accurate Hebrew calendar calculations
  const location = Location.lookup('Jerusalem');
  
  // Get current time in Jerusalem timezone
  const now = new Date();
  const nowJerusalem = new Date(now.toLocaleString('en-US', { timeZone: timezone }));
  
  // Get current Hebrew date at sunset in Jerusalem
  // After sunset = next Hebrew day
  const nowHebrew = new HDate(nowJerusalem);
  const currentHebrewYear = nowHebrew.getFullYear();
  
  // Create Hebrew date for this year's yahrzeit
  let nextYahrzeitHebrew = new HDate(hebrewDay, hebrewMonth, currentHebrewYear);
  let nextYahrzeitGregorian = nextYahrzeitHebrew.greg();
  
  // If this year's yahrzeit has passed, get next year's
  if (nextYahrzeitGregorian < nowJerusalem) {
    nextYahrzeitHebrew = new HDate(hebrewDay, hebrewMonth, currentHebrewYear + 1);
    nextYahrzeitGregorian = nextYahrzeitHebrew.greg();
  }
  
  // Calculate years since death
  // If next yahrzeit is in the future this Hebrew year, we haven't completed that year yet
  const yearsSinceRaw = nextYahrzeitHebrew.getFullYear() - hebrewYear;
  const yearsSince = yearsSinceRaw - 1; // Subtract 1 because we count completed years
  
  // Check if today is the yahrzeit (check at Jerusalem time)
  const isToday = nowHebrew.getDate() === hebrewDay && 
                  nowHebrew.getMonthName() === hebrewMonth;
  
  // Calculate time until yahrzeit (use browser's actual time for countdown)
  const msUntil = nextYahrzeitGregorian.getTime() - now.getTime();
  const daysUntil = Math.floor(msUntil / (1000 * 60 * 60 * 24));
  const hoursUntil = Math.floor((msUntil % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
  const minutesUntil = Math.floor((msUntil % (1000 * 60 * 60)) / (1000 * 60));
  const secondsUntil = Math.floor((msUntil % (1000 * 60)) / 1000);
  
  // Format Hebrew date with proper gershayim
  const hebrewDateFormatted = nextYahrzeitHebrew.renderGematriya();
  
  // Get Hebrew day of week name properly
  const gregorianDayOfWeek = nextYahrzeitGregorian.getDay();
  const hebrewDayNames = ['ראשון', 'שני', 'שלישי', 'רביעי', 'חמישי', 'שישי', 'שבת'];
  const dayOfWeekName = hebrewDayNames[gregorianDayOfWeek];
  
  // Format Gregorian date in Hebrew
  const gregorianFormatted = formatGregorianDateHebrew(nextYahrzeitGregorian, timezone);
  
  return {
    hebrewDate: hebrewDateFormatted,
    gregorianDate: nextYahrzeitGregorian,
    dayOfWeek: dayOfWeekName,
    gregorianFormatted,
    yearsSince,
    isToday,
    daysUntil,
    hoursUntil,
    minutesUntil,
    secondsUntil,
  };
}

/**
 * Format Gregorian date in Hebrew locale
 */
function formatGregorianDateHebrew(date: Date, timezone: string = 'Asia/Jerusalem'): string {
  const options: Intl.DateTimeFormatOptions = {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    timeZone: timezone
  };
  
  return date.toLocaleDateString('he-IL', options);
}

/**
 * Get Hebrew month name from English
 * Used for compatibility with different month name formats
 */
export function normalizeHebrewMonthName(month: string): string {
  const monthMap: Record<string, string> = {
    'Nisan': 'ניסן',
    'Iyyar': 'אייר',
    'Sivan': 'סיוון',
    'Tamuz': 'תמוז',
    'Av': 'אב',
    'Elul': 'אלול',
    'Tishrei': 'תשרי',
    'Cheshvan': 'חשון',
    'Kislev': 'כסלו',
    'Tevet': 'טבת',
    'Shvat': 'שבט',
    'Adar': 'אדר',
    'Adar I': 'אדר א׳',
    'Adar II': 'אדר ב׳',
  };
  
  return monthMap[month] || month;
}

/**
 * Check if a date is a Hebrew leap year
 * (Handles Adar I vs Adar II for yahrzeits)
 */
export function isHebrewLeapYear(year: number): boolean {
  return new HDate(1, 'Nisan', year).isLeapYear();
}
