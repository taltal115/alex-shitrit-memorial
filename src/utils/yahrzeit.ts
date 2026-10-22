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
  const now = new Date();
  
  // Get current Hebrew year
  const nowHebrew = new HDate(now);
  const currentHebrewYear = nowHebrew.getFullYear();
  
  // Calculate years since death in Hebrew calendar
  const yearsSince = currentHebrewYear - hebrewYear;
  
  // Create Hebrew date for this year's yahrzeit
  let nextYahrzeitHebrew = new HDate(hebrewDay, hebrewMonth, currentHebrewYear);
  let nextYahrzeitGregorian = nextYahrzeitHebrew.greg();
  
  // If this year's yahrzeit has passed, get next year's
  if (nextYahrzeitGregorian < now) {
    nextYahrzeitHebrew = new HDate(hebrewDay, hebrewMonth, currentHebrewYear + 1);
    nextYahrzeitGregorian = nextYahrzeitHebrew.greg();
  }
  
  // Check if today is the yahrzeit
  const todayHebrew = new HDate(now);
  const isToday = todayHebrew.getDate() === hebrewDay && 
                  todayHebrew.getMonthName() === hebrewMonth;
  
  // Calculate time until yahrzeit
  const msUntil = nextYahrzeitGregorian.getTime() - now.getTime();
  const daysUntil = Math.floor(msUntil / (1000 * 60 * 60 * 24));
  const hoursUntil = Math.floor((msUntil % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
  const minutesUntil = Math.floor((msUntil % (1000 * 60 * 60)) / (1000 * 60));
  const secondsUntil = Math.floor((msUntil % (1000 * 60)) / 1000);
  
  // Format Hebrew date with proper gershayim
  const hebrewDateFormatted = nextYahrzeitHebrew.renderGematriya();
  
  // Get Hebrew day of week
  const dayOfWeek = nextYahrzeitHebrew.render('he');
  const dayOfWeekName = dayOfWeek.split(' ')[0]; // Extract day name
  
  // Format Gregorian date in Hebrew
  const gregorianFormatted = formatGregorianDateHebrew(nextYahrzeitGregorian);
  
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
function formatGregorianDateHebrew(date: Date): string {
  const options: Intl.DateTimeFormatOptions = {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    timeZone: 'Asia/Jerusalem'
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
