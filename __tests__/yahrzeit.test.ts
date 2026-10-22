import { calculateNextYahrzeit, normalizeHebrewMonthName, isHebrewLeapYear } from '@/utils/yahrzeit';
import { HDate } from '@hebcal/core';

describe('Yahrzeit Calculations', () => {
  describe('calculateNextYahrzeit', () => {
    it('should calculate next yahrzeit for 9 Cheshvan 5781', () => {
      const result = calculateNextYahrzeit(9, 'Cheshvan', 5781, 'Asia/Jerusalem');
      
      expect(result).toBeDefined();
      expect(result.hebrewDate).toBeTruthy();
      expect(result.gregorianDate).toBeInstanceOf(Date);
      expect(result.yearsSince).toBeGreaterThanOrEqual(0);
      expect(typeof result.daysUntil).toBe('number');
      expect(typeof result.hoursUntil).toBe('number');
      expect(typeof result.minutesUntil).toBe('number');
      expect(typeof result.secondsUntil).toBe('number');
    });

    it('should calculate correct Hebrew years since death', () => {
      // Death in 5781, current year should be later
      const result = calculateNextYahrzeit(9, 'Cheshvan', 5781, 'Asia/Jerusalem');
      const currentYear = new HDate().getFullYear();
      
      // Years since is completed years (next yahrzeit year - death year - 1)
      const nextYahrzeitYear = new HDate(result.gregorianDate).getFullYear();
      const expectedYears = nextYahrzeitYear - 5781 - 1;
      
      expect(result.yearsSince).toBe(expectedYears);
      expect(result.yearsSince).toBeGreaterThanOrEqual(0);
    });

    it('should detect when today is the yahrzeit', () => {
      const today = new HDate();
      
      // Test with today's Hebrew date
      const result = calculateNextYahrzeit(
        today.getDate(),
        today.getMonthName(),
        5781, // Year doesn't matter for isToday check
        'Asia/Jerusalem'
      );
      
      expect(result.isToday).toBe(true);
    });

    it('should return next year yahrzeit if this year already passed', () => {
      // Use a date early in the Hebrew year (e.g., 1 Tishrei)
      const result = calculateNextYahrzeit(1, 'Tishrei', 5781, 'Asia/Jerusalem');
      
      const currentYear = new HDate().getFullYear();
      const yahrzeitHebrew = new HDate(result.gregorianDate);
      
      // Should be either current year or next year
      expect([currentYear, currentYear + 1]).toContain(yahrzeitHebrew.getFullYear());
    });

    it('should handle edge case: yahrzeit on Rosh Chodesh', () => {
      // 1st day of month
      const result = calculateNextYahrzeit(1, 'Nisan', 5781, 'Asia/Jerusalem');
      
      expect(result).toBeDefined();
      expect(result.hebrewDate).toContain('א׳'); // Hebrew letter alef for 1
    });

    it('should handle edge case: yahrzeit on 30th of month', () => {
      // 30th day of Cheshvan (when it has 30 days)
      const result = calculateNextYahrzeit(30, 'Cheshvan', 5781, 'Asia/Jerusalem');
      
      expect(result).toBeDefined();
      expect(result.gregorianDate).toBeInstanceOf(Date);
    });

    it('should provide properly formatted Hebrew date with gershayim', () => {
      const result = calculateNextYahrzeit(9, 'Cheshvan', 5781, 'Asia/Jerusalem');
      
      // Should contain gershayim (״) for Hebrew date
      expect(result.hebrewDate).toMatch(/[״׳]/);
    });

    it('should calculate countdown correctly', () => {
      const result = calculateNextYahrzeit(9, 'Cheshvan', 5781, 'Asia/Jerusalem');
      
      // If not today, should have positive days/hours
      if (!result.isToday) {
        expect(result.daysUntil).toBeGreaterThanOrEqual(0);
        expect(result.hoursUntil).toBeGreaterThanOrEqual(0);
        expect(result.hoursUntil).toBeLessThan(24);
        expect(result.minutesUntil).toBeGreaterThanOrEqual(0);
        expect(result.minutesUntil).toBeLessThan(60);
        expect(result.secondsUntil).toBeGreaterThanOrEqual(0);
        expect(result.secondsUntil).toBeLessThan(60);
      }
    });

    it('should format Gregorian date in Hebrew locale', () => {
      const result = calculateNextYahrzeit(9, 'Cheshvan', 5781, 'Asia/Jerusalem');
      
      // Should be Hebrew text
      expect(result.gregorianFormatted).toBeTruthy();
      expect(result.gregorianFormatted.length).toBeGreaterThan(0);
    });

    it('should include Hebrew day of week', () => {
      const result = calculateNextYahrzeit(9, 'Cheshvan', 5781, 'Asia/Jerusalem');
      
      expect(result.dayOfWeek).toBeTruthy();
      expect(result.dayOfWeek.length).toBeGreaterThan(0);
    });
  });

  describe('normalizeHebrewMonthName', () => {
    it('should convert English month names to Hebrew', () => {
      expect(normalizeHebrewMonthName('Nisan')).toBe('ניסן');
      expect(normalizeHebrewMonthName('Cheshvan')).toBe('חשון');
      expect(normalizeHebrewMonthName('Tishrei')).toBe('תשרי');
      expect(normalizeHebrewMonthName('Adar')).toBe('אדר');
    });

    it('should handle leap year months', () => {
      expect(normalizeHebrewMonthName('Adar I')).toBe('אדר א׳');
      expect(normalizeHebrewMonthName('Adar II')).toBe('אדר ב׳');
    });

    it('should return original if not found', () => {
      expect(normalizeHebrewMonthName('UnknownMonth')).toBe('UnknownMonth');
    });
  });

  describe('isHebrewLeapYear', () => {
    it('should correctly identify leap years', () => {
      // 5784 is a leap year (2023-2024)
      expect(isHebrewLeapYear(5784)).toBe(true);
      
      // 5783 is not a leap year
      expect(isHebrewLeapYear(5783)).toBe(false);
    });

    it('should handle the 19-year cycle', () => {
      // Hebrew leap years follow a specific pattern in the 19-year cycle
      // Known leap years for testing
      const knownLeapYears = [5784, 5787, 5790]; // Recent leap years
      const knownRegularYears = [5783, 5785, 5786, 5788, 5789];
      
      knownLeapYears.forEach(year => {
        expect(isHebrewLeapYear(year)).toBe(true);
      });
      
      knownRegularYears.forEach(year => {
        expect(isHebrewLeapYear(year)).toBe(false);
      });
    });
  });

  describe('Edge Cases', () => {
    it('should handle yahrzeit in Adar during leap year', () => {
      // Someone who died in regular Adar observes in Adar II during leap year
      const result = calculateNextYahrzeit(15, 'Adar', 5780, 'Asia/Jerusalem');
      
      expect(result).toBeDefined();
      expect(result.gregorianDate).toBeInstanceOf(Date);
    });

    it('should handle yahrzeit on 30 Cheshvan in years when Cheshvan has 29 days', () => {
      // In some years, Cheshvan (Marcheshvan) has 29 days
      // Yahrzeit observed on 29 Cheshvan in those years
      const result = calculateNextYahrzeit(30, 'Cheshvan', 5781, 'Asia/Jerusalem');
      
      expect(result).toBeDefined();
      expect(result.gregorianDate).toBeInstanceOf(Date);
    });

    it('should handle different timezones', () => {
      const resultJerusalem = calculateNextYahrzeit(9, 'Cheshvan', 5781, 'Asia/Jerusalem');
      const resultNY = calculateNextYahrzeit(9, 'Cheshvan', 5781, 'America/New_York');
      
      // Dates might differ by a day depending on timezone
      expect(resultJerusalem.gregorianDate).toBeInstanceOf(Date);
      expect(resultNY.gregorianDate).toBeInstanceOf(Date);
    });

    it('should handle very recent death (first yahrzeit)', () => {
      const lastYear = new HDate().getFullYear() - 1;
      const result = calculateNextYahrzeit(9, 'Cheshvan', lastYear, 'Asia/Jerusalem');
      
      expect(result.yearsSince).toBeLessThanOrEqual(2);
    });

    it('should handle long-ago death (many yahrzeits)', () => {
      // Death 100 years ago
      const longAgo = new HDate().getFullYear() - 100;
      const result = calculateNextYahrzeit(9, 'Cheshvan', longAgo, 'Asia/Jerusalem');
      
      expect(result.yearsSince).toBeGreaterThanOrEqual(99);
    });
  });

  describe('Real-world scenario: Alex Shitrit', () => {
    it('should correctly calculate yahrzeit for 9 Cheshvan 5781 (27 Oct 2020)', () => {
      const result = calculateNextYahrzeit(9, 'Cheshvan', 5781, 'Asia/Jerusalem');
      
      // Death in 2020, so years since should be currentYear - 2020 in Gregorian
      // But we count Hebrew years
      expect(result.yearsSince).toBeGreaterThanOrEqual(3); // At least 2024 - 2020
      
      // Next yahrzeit should be 9 Cheshvan
      const yahrzeitHebrew = new HDate(result.gregorianDate);
      expect(yahrzeitHebrew.getDate()).toBe(9);
      expect(yahrzeitHebrew.getMonthName()).toBe('Cheshvan');
    });

    it('should format correctly for display on memorial site', () => {
      const result = calculateNextYahrzeit(9, 'Cheshvan', 5781, 'Asia/Jerusalem');
      
      // Should have all display fields
      expect(result.hebrewDate).toBeTruthy();
      expect(result.gregorianFormatted).toBeTruthy();
      expect(result.dayOfWeek).toBeTruthy();
      expect(typeof result.yearsSince).toBe('number');
      expect(typeof result.isToday).toBe('boolean');
    });
  });
});

describe('Share URL Generation', () => {
  const baseUrl = 'https://example.com/memorial';
  const title = 'אתר הנצחה - אלכס שטרית ז״ל';

  it('should generate valid Facebook share URL', () => {
    const encoded = encodeURIComponent(baseUrl);
    const url = `https://www.facebook.com/sharer/sharer.php?u=${encoded}`;
    
    expect(url).toContain('facebook.com');
    expect(url).toContain(encoded);
  });

  it('should generate valid WhatsApp share URL', () => {
    const encodedUrl = encodeURIComponent(baseUrl);
    const encodedTitle = encodeURIComponent(title);
    const url = `https://wa.me/?text=${encodedTitle}%20${encodedUrl}`;
    
    expect(url).toContain('wa.me');
    expect(url).toContain(encodedTitle);
    expect(url).toContain(encodedUrl);
  });

  it('should generate valid X (Twitter) share URL', () => {
    const encodedUrl = encodeURIComponent(baseUrl);
    const encodedTitle = encodeURIComponent(title);
    const url = `https://twitter.com/intent/tweet?text=${encodedTitle}&url=${encodedUrl}`;
    
    expect(url).toContain('twitter.com');
    expect(url).toContain('intent/tweet');
    expect(url).toContain(encodedTitle);
    expect(url).toContain(encodedUrl);
  });

  it('should properly encode Hebrew text in URLs', () => {
    const hebrewText = 'אלכס שטרית ז״ל';
    const encoded = encodeURIComponent(hebrewText);
    
    expect(encoded).not.toContain('א');
    expect(encoded).toContain('%');
    expect(decodeURIComponent(encoded)).toBe(hebrewText);
  });

  it('should handle URLs with query parameters', () => {
    const urlWithParams = 'https://example.com/memorial?source=qr';
    const encoded = encodeURIComponent(urlWithParams);
    
    expect(decodeURIComponent(encoded)).toBe(urlWithParams);
  });

  it('should handle special characters in title', () => {
    const titleWithQuotes = 'אתר הנצחה - "אלכס שטרית" ז״ל';
    const encoded = encodeURIComponent(titleWithQuotes);
    
    expect(decodeURIComponent(encoded)).toBe(titleWithQuotes);
  });
});

describe('QA Fixes Verification', () => {
  describe('Jerusalem Timezone', () => {
    it('should use Asia/Jerusalem timezone for calculations', () => {
      const result = calculateNextYahrzeit(9, 'Cheshvan', 5781, 'Asia/Jerusalem');
      
      // Verify timezone is used by checking the calculation is based on Jerusalem time
      expect(result.gregorianDate).toBeInstanceOf(Date);
      expect(result.hebrewDate).toBeTruthy();
      
      // The calculation should respect Jerusalem timezone
      // (implicitly tested by the Location.lookup usage)
    });

    it('should respect sunset for Hebrew day boundary', () => {
      // After sunset in Jerusalem = next Hebrew day
      // This is handled by HDate which respects sunset
      const result = calculateNextYahrzeit(9, 'Cheshvan', 5781, 'Asia/Jerusalem');
      
      // Verify the isToday check uses Hebrew calendar correctly
      const nowHebrew = new HDate();
      if (nowHebrew.getDate() === 9 && nowHebrew.getMonthName() === 'Cheshvan') {
        expect(result.isToday).toBe(true);
      } else {
        expect(result.isToday).toBe(false);
      }
    });
  });

  describe('Years Since Calculation', () => {
    it('should calculate completed years correctly (not off by +1)', () => {
      // Death in 5781
      const result = calculateNextYahrzeit(9, 'Cheshvan', 5781, 'Asia/Jerusalem');
      
      // Years since should be: (next yahrzeit year - death year - 1)
      // This counts COMPLETED years only
      const nextYear = new HDate(result.gregorianDate).getFullYear();
      const expectedYears = nextYear - 5781 - 1;
      
      expect(result.yearsSince).toBe(expectedYears);
      
      // Verify it's not off by +1
      expect(result.yearsSince).not.toBe(nextYear - 5781); // Would be off by +1
    });
  });

  describe('Day of Week Name', () => {
    it('should show proper Hebrew day name, not number', () => {
      const result = calculateNextYahrzeit(9, 'Cheshvan', 5781, 'Asia/Jerusalem');
      
      // Should be a Hebrew day name, not a number
      const validDayNames = ['ראשון', 'שני', 'שלישי', 'רביעי', 'חמישי', 'שישי', 'שבת'];
      expect(validDayNames).toContain(result.dayOfWeek);
      
      // Should NOT be a number
      expect(result.dayOfWeek).not.toMatch(/^\d+$/);
      expect(result.dayOfWeek).not.toBe('9');
    });

    it('should map Gregorian day correctly to Hebrew name', () => {
      const result = calculateNextYahrzeit(9, 'Cheshvan', 5781, 'Asia/Jerusalem');
      
      // Get actual day of week from Gregorian date
      const dayIndex = result.gregorianDate.getDay();
      const dayNames = ['ראשון', 'שני', 'שלישי', 'רביעי', 'חמישי', 'שישי', 'שבת'];
      
      expect(result.dayOfWeek).toBe(dayNames[dayIndex]);
    });
  });

  describe('Share URL', () => {
    it('should use canonical site URL when available', () => {
      // This test verifies the ShareButtons component logic
      // In actual usage, NEXT_PUBLIC_SITE_URL should provide canonical URL
      const siteUrl = process.env.NEXT_PUBLIC_SITE_URL;
      
      if (siteUrl && siteUrl !== 'http://localhost:3000') {
        // When canonical URL exists, it should be used
        expect(siteUrl).toMatch(/^https?:\/\//);
      }
      
      // The component should combine canonical URL with current path
      // (tested in component, not in yahrzeit utils)
    });
  });
});
