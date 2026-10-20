import { HDate, HebrewCalendar, Location, Zmanim, months } from '@hebcal/core';
import type { HebrewDate, AzkaraDate, HalachicTimes } from '@/types';

/**
 * Convert Hebrew date to Gregorian for a specific year
 * CRITICAL: This is the source of truth for azkara date calculation
 */
export function getAzkaraDateForYear(
  hebrewDeathDate: HebrewDate,
  gregorianYear: number
): AzkaraDate {
  // Create Hebrew date object for the original yahrzeit
  const originalHd = new HDate(
    hebrewDeathDate.day,
    hebrewDeathDate.month,
    hebrewDeathDate.year
  );
  
  // Calculate the Hebrew year for the target Gregorian year
  // Hebrew year typically starts in September/October
  const targetHebrewYear = gregorianYear - 1240 + 3760; // Approximate conversion
  
  // Create the yahrzeit date in the target Hebrew year
  const targetYahrzeit = new HDate(
    hebrewDeathDate.day,
    hebrewDeathDate.month,
    targetHebrewYear
  );
  
  // Convert to Gregorian date
  const gregorianDate = targetYahrzeit.greg();
  
  // If the calculated date is in the wrong Gregorian year, adjust
  if (gregorianDate.getFullYear() !== gregorianYear) {
    const adjustedYear = gregorianDate.getFullYear() < gregorianYear 
      ? targetHebrewYear + 1 
      : targetHebrewYear - 1;
    const adjustedYahrzeit = new HDate(
      hebrewDeathDate.day,
      hebrewDeathDate.month,
      adjustedYear
    );
    const adjustedGregorian = adjustedYahrzeit.greg();
    
    // Calculate days until azkara
    const today = new Date();
    const timeDiff = adjustedGregorian.getTime() - today.getTime();
    const daysUntil = Math.ceil(timeDiff / (1000 * 60 * 60 * 24));
    
    return {
      hebrewDate: {
        day: adjustedYahrzeit.getDate(),
        month: adjustedYahrzeit.getMonthName(),
        year: adjustedYahrzeit.getFullYear(),
      },
      gregorianDate: adjustedGregorian,
      weekday: adjustedGregorian.toLocaleDateString('en-US', { weekday: 'long' }),
      weekdayHebrew: adjustedYahrzeit.render('he'),
      daysUntil,
    };
  }
  
  // Calculate days until azkara
  const today = new Date();
  const timeDiff = gregorianDate.getTime() - today.getTime();
  const daysUntil = Math.ceil(timeDiff / (1000 * 60 * 60 * 24));
  
  return {
    hebrewDate: {
      day: targetYahrzeit.getDate(),
      month: targetYahrzeit.getMonthName(),
      year: targetYahrzeit.getFullYear(),
    },
    gregorianDate,
    weekday: gregorianDate.toLocaleDateString('en-US', { weekday: 'long' }),
    weekdayHebrew: targetYahrzeit.render('he'),
    daysUntil,
  };
}

/**
 * Get next azkara date from today
 */
export function getNextAzkaraDate(hebrewDeathDate: HebrewDate): AzkaraDate {
  const currentYear = new Date().getFullYear();
  
  // Try current year first
  const currentYearAzkara = getAzkaraDateForYear(hebrewDeathDate, currentYear);
  
  // If it's passed, get next year's
  if (currentYearAzkara.daysUntil < 0) {
    return getAzkaraDateForYear(hebrewDeathDate, currentYear + 1);
  }
  
  return currentYearAzkara;
}

/**
 * Get azkara dates for current and next year
 */
export function getUpcomingAzkaraDates(hebrewDeathDate: HebrewDate): AzkaraDate[] {
  const currentYear = new Date().getFullYear();
  const currentYearAzkara = getAzkaraDateForYear(hebrewDeathDate, currentYear);
  const nextYearAzkara = getAzkaraDateForYear(hebrewDeathDate, currentYear + 1);
  
  // If current year has passed, return next two years
  if (currentYearAzkara.daysUntil < 0) {
    const followingYearAzkara = getAzkaraDateForYear(hebrewDeathDate, currentYear + 2);
    return [nextYearAzkara, followingYearAzkara];
  }
  
  return [currentYearAzkara, nextYearAzkara];
}

/**
 * Calculate halachic times (sunset, tzeit) for a specific date and location
 * Used for cemetery events - family event times are stored separately
 */
export function getHalachicTimes(
  date: Date,
  latitude: number,
  longitude: number,
  timezone: string = 'Asia/Jerusalem'
): HalachicTimes {
  const location = new Location(
    latitude,
    longitude,
    latitude > 29 && latitude < 34 && longitude > 34 && longitude < 36, // il (Israel)
    timezone
  );
  
  const hdate = new HDate(date);
  const zmanim = new Zmanim(location, hdate, false); // false = use Location tzid
  
  return {
    sunset: zmanim.sunset(),
    tzeit: zmanim.tzeit(),
    location: {
      latitude,
      longitude,
      timezone,
    },
  };
}

/**
 * Determine if a Gregorian date/time falls before or after sunset
 * CRITICAL for verifying which Hebrew date applies
 */
export function isAfterSunset(
  gregorianDate: Date,
  timeOfDay: string, // HH:MM format
  latitude: number,
  longitude: number
): boolean {
  const [hours, minutes] = timeOfDay.split(':').map(Number);
  const dateWithTime = new Date(gregorianDate);
  dateWithTime.setHours(hours, minutes, 0, 0);
  
  const times = getHalachicTimes(gregorianDate, latitude, longitude);
  
  return dateWithTime > times.sunset;
}

/**
 * Get Hebrew date for a Gregorian date at a specific time
 */
export function getHebrewDateAtTime(
  gregorianDate: Date,
  timeOfDay: string | null,
  latitude: number,
  longitude: number
): HebrewDate {
  let hdate = new HDate(gregorianDate);
  
  // If time is provided and it's after sunset, use next day's Hebrew date
  if (timeOfDay && isAfterSunset(gregorianDate, timeOfDay, latitude, longitude)) {
    const nextDay = new Date(gregorianDate);
    nextDay.setDate(nextDay.getDate() + 1);
    hdate = new HDate(nextDay);
  }
  
  return {
    day: hdate.getDate(),
    month: hdate.getMonthName(),
    year: hdate.getFullYear(),
  };
}

/**
 * Format Hebrew date for display
 */
export function formatHebrewDate(date: HebrewDate, locale: 'he' | 'en' = 'he'): string {
  const hd = new HDate(date.day, date.month, date.year);
  return hd.render(locale);
}

/**
 * Format Gregorian date for Hebrew display
 */
export function formatGregorianDate(date: Date, locale: 'he' | 'en' = 'he'): string {
  return date.toLocaleDateString(locale === 'he' ? 'he-IL' : 'en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
}
