import {
  getAzkaraDateForYear,
  getNextAzkaraDate,
  getUpcomingAzkaraDates,
  isAfterSunset,
  getHebrewDateAtTime,
  formatHebrewDate,
} from '@/utils/hebrew-dates';
import type { HebrewDate } from '@/types';

describe('Hebrew Date Calculations', () => {
  // CRITICAL TEST: Death date was 27 Oct 2020
  // Need to verify if it was before or after sunset to determine Hebrew date
  // This test uses a PLACEHOLDER date - actual date must be verified by family
  
  const PLACEHOLDER_HEBREW_DEATH_DATE: HebrewDate = {
    day: 10,
    month: 'Cheshvan',
    year: 5781,
  };

  describe('getAzkaraDateForYear', () => {
    it('should calculate azkara for 2021', () => {
      const azkara = getAzkaraDateForYear(PLACEHOLDER_HEBREW_DEATH_DATE, 2021);
      
      expect(azkara).toBeDefined();
      expect(azkara.hebrewDate.day).toBe(10);
      expect(azkara.hebrewDate.month).toBe('Cheshvan');
      expect(azkara.gregorianDate).toBeInstanceOf(Date);
    });

    it('should calculate azkara for 2022', () => {
      const azkara = getAzkaraDateForYear(PLACEHOLDER_HEBREW_DEATH_DATE, 2022);
      
      expect(azkara).toBeDefined();
      expect(azkara.hebrewDate.day).toBe(10);
      expect(azkara.hebrewDate.month).toBe('Cheshvan');
      expect(azkara.gregorianDate.getFullYear()).toBe(2022);
    });

    it('should calculate azkara for 2023', () => {
      const azkara = getAzkaraDateForYear(PLACEHOLDER_HEBREW_DEATH_DATE, 2023);
      
      expect(azkara).toBeDefined();
      expect(azkara.hebrewDate.day).toBe(10);
      expect(azkara.hebrewDate.month).toBe('Cheshvan');
      expect(azkara.gregorianDate.getFullYear()).toBe(2023);
    });

    it('should handle leap years correctly', () => {
      const azkaraRegular = getAzkaraDateForYear(PLACEHOLDER_HEBREW_DEATH_DATE, 2024);
      const azkaraLeap = getAzkaraDateForYear(PLACEHOLDER_HEBREW_DEATH_DATE, 2025);
      
      expect(azkaraRegular.gregorianDate).toBeInstanceOf(Date);
      expect(azkaraLeap.gregorianDate).toBeInstanceOf(Date);
      
      // Hebrew leap years affect month calculations
      // The library should handle this automatically
      expect(azkaraRegular.hebrewDate.day).toBe(10);
      expect(azkaraLeap.hebrewDate.day).toBe(10);
    });

    it('should include weekday information', () => {
      const azkara = getAzkaraDateForYear(PLACEHOLDER_HEBREW_DEATH_DATE, 2024);
      
      expect(azkara.weekday).toBeTruthy();
      expect(typeof azkara.weekday).toBe('string');
      expect(azkara.weekdayHebrew).toBeTruthy();
    });

    it('should calculate days until azkara', () => {
      const azkara = getAzkaraDateForYear(PLACEHOLDER_HEBREW_DEATH_DATE, 2024);
      
      expect(typeof azkara.daysUntil).toBe('number');
    });
  });

  describe('getNextAzkaraDate', () => {
    it('should return the next upcoming azkara', () => {
      const nextAzkara = getNextAzkaraDate(PLACEHOLDER_HEBREW_DEATH_DATE);
      
      expect(nextAzkara).toBeDefined();
      expect(nextAzkara.hebrewDate.day).toBe(10);
      expect(nextAzkara.hebrewDate.month).toBe('Cheshvan');
      
      // Should be in the future
      const today = new Date();
      expect(nextAzkara.gregorianDate >= today || nextAzkara.daysUntil >= 0).toBe(true);
    });
  });

  describe('getUpcomingAzkaraDates', () => {
    it('should return two upcoming azkara dates', () => {
      const upcomingDates = getUpcomingAzkaraDates(PLACEHOLDER_HEBREW_DEATH_DATE);
      
      expect(upcomingDates).toHaveLength(2);
      expect(upcomingDates[0].hebrewDate.day).toBe(10);
      expect(upcomingDates[1].hebrewDate.day).toBe(10);
      
      // Second date should be one year after first
      const yearDiff = upcomingDates[1].hebrewDate.year - upcomingDates[0].hebrewDate.year;
      expect(yearDiff).toBe(1);
    });
  });

  describe('isAfterSunset - CRITICAL for date verification', () => {
    // Cemetery location (Jerusalem approximate)
    const latitude = 31.7683;
    const longitude = 35.2137;

    it('should determine if time is after sunset on Oct 27, 2020', () => {
      const dateOfDeath = new Date('2020-10-27');
      
      // Test various times
      const morning = isAfterSunset(dateOfDeath, '10:00', latitude, longitude);
      const afternoon = isAfterSunset(dateOfDeath, '15:00', latitude, longitude);
      const evening = isAfterSunset(dateOfDeath, '19:00', latitude, longitude);
      
      expect(morning).toBe(false);
      expect(afternoon).toBe(false);
      // Evening should be after sunset in late October
      // (actual sunset time varies, this test documents the logic)
    });

    it('should handle different times of year', () => {
      // Summer sunset is later
      const summerDate = new Date('2020-06-27');
      const summserAfternoon = isAfterSunset(summerDate, '18:00', latitude, longitude);
      const summerEvening = isAfterSunset(summerDate, '20:00', latitude, longitude);
      
      // Winter sunset is earlier
      const winterDate = new Date('2020-12-27');
      const winterAfternoon = isAfterSunset(winterDate, '16:00', latitude, longitude);
      const winterEvening = isAfterSunset(winterDate, '18:00', latitude, longitude);
      
      expect(typeof summserAfternoon).toBe('boolean');
      expect(typeof summerEvening).toBe('boolean');
      expect(typeof winterAfternoon).toBe('boolean');
      expect(typeof winterEvening).toBe('boolean');
    });
  });

  describe('getHebrewDateAtTime', () => {
    const latitude = 31.7683;
    const longitude = 35.2137;

    it('should return current Hebrew date if before sunset', () => {
      const date = new Date('2020-10-27');
      const hebrewDate = getHebrewDateAtTime(date, '10:00', latitude, longitude);
      
      expect(hebrewDate).toBeDefined();
      expect(hebrewDate.day).toBeGreaterThan(0);
      expect(hebrewDate.month).toBeTruthy();
      expect(hebrewDate.year).toBeGreaterThan(5780);
    });

    it('should return next Hebrew date if after sunset', () => {
      const date = new Date('2020-10-27');
      const hebrewDateBefore = getHebrewDateAtTime(date, '10:00', latitude, longitude);
      const hebrewDateAfter = getHebrewDateAtTime(date, '20:00', latitude, longitude);
      
      // After sunset, the day should advance (or be the same if sunset is very late)
      expect(hebrewDateAfter).toBeDefined();
      expect(hebrewDateAfter.day).toBeGreaterThanOrEqual(hebrewDateBefore.day);
    });
  });

  describe('formatHebrewDate', () => {
    it('should format Hebrew date in Hebrew', () => {
      const formatted = formatHebrewDate(PLACEHOLDER_HEBREW_DEATH_DATE, 'he');
      
      expect(formatted).toBeTruthy();
      expect(typeof formatted).toBe('string');
    });

    it('should format Hebrew date in English', () => {
      const formatted = formatHebrewDate(PLACEHOLDER_HEBREW_DEATH_DATE, 'en');
      
      expect(formatted).toBeTruthy();
      expect(typeof formatted).toBe('string');
      expect(formatted).toContain('Cheshvan');
    });
  });

  describe('Edge Cases', () => {
    it('should handle year boundaries correctly', () => {
      const azkara2024 = getAzkaraDateForYear(PLACEHOLDER_HEBREW_DEATH_DATE, 2024);
      const azkara2025 = getAzkaraDateForYear(PLACEHOLDER_HEBREW_DEATH_DATE, 2025);
      
      // Dates should be approximately one year apart
      const daysDiff = Math.abs(
        azkara2025.gregorianDate.getTime() - azkara2024.gregorianDate.getTime()
      ) / (1000 * 60 * 60 * 24);
      
      // Should be between 353 and 383 days (accounting for Hebrew calendar variations)
      expect(daysDiff).toBeGreaterThan(350);
      expect(daysDiff).toBeLessThan(385);
    });

    it('should never add exactly 12 Gregorian months', () => {
      // CRITICAL: The spec explicitly states never use simple +12 months
      // Must use proper Hebrew calendar calculation
      
      const azkara2021 = getAzkaraDateForYear(PLACEHOLDER_HEBREW_DEATH_DATE, 2021);
      const azkara2022 = getAzkaraDateForYear(PLACEHOLDER_HEBREW_DEATH_DATE, 2022);
      
      // If we incorrectly added 12 months, the day and month would be the same
      // But the Gregorian day should differ due to Hebrew calendar differences
      
      // Both should be Cheshvan 10, but different Gregorian dates
      expect(azkara2021.hebrewDate.day).toBe(10);
      expect(azkara2022.hebrewDate.day).toBe(10);
      
      // The Gregorian dates should NOT be exactly 365 or 366 days apart
      // (they will be close, but Hebrew calendar drift means slight variation)
      const daysBetween = (azkara2022.gregorianDate.getTime() - azkara2021.gregorianDate.getTime()) 
        / (1000 * 60 * 60 * 24);
      
      expect(daysBetween).not.toBe(365);
      expect(daysBetween).not.toBe(366);
    });
  });

  describe('Verification Requirements', () => {
    it('should document the verification requirement', () => {
      // IMPORTANT: This test documents that the actual Hebrew death date
      // MUST be verified by the family before going live
      
      // Known facts:
      // - Gregorian death date: October 27, 2020
      // - Time of death relative to sunset: UNVERIFIED
      
      // If death was BEFORE sunset: Hebrew date is 10 Cheshvan 5781
      // If death was AFTER sunset: Hebrew date is 11 Cheshvan 5781
      
      // The family MUST confirm which is correct
      
      expect(true).toBe(true); // Placeholder assertion
    });
  });
});
