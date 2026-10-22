/**
 * Tests for calendar/ICS file generation
 */

// Mock the ics library to avoid ESM module issues in Jest
jest.mock('ics', () => ({
  createEvents: (events: any[]) => {
    if (!events || events.length === 0 || !events[0].title || !events[0].start) {
      return { error: new Error('Invalid event'), value: undefined };
    }
    const event = events[0];
    const location = event.location || '';
    const description = event.description || '';
    const icsContent = `BEGIN:VCALENDAR
VERSION:2.0
PRODID:-//Test//Test//EN
BEGIN:VEVENT
SUMMARY:${event.title}
DESCRIPTION:${description}
LOCATION:${location}
END:VEVENT
END:VCALENDAR`;
    return { error: null, value: icsContent };
  }
}));

import {
  generateICSFile,
  generateGoogleCalendarUrl,
} from '@/utils/calendar';
import type { AzkaraDate } from '@/types';

describe('Calendar Generation', () => {
  const mockAzkara: AzkaraDate = {
    hebrewDate: {
      day: 10,
      month: 'Cheshvan',
      year: 5784,
    },
    gregorianDate: new Date('2023-10-24'),
    weekday: 'Tuesday',
    weekdayHebrew: 'יום שלישי',
    daysUntil: 10,
  };

  describe('generateICSFile', () => {
    it('should generate valid ICS content', () => {
      const ics = generateICSFile(mockAzkara, 'אלכס שטרית');
      
      expect(ics).toBeTruthy();
      expect(ics).toContain('BEGIN:VCALENDAR');
      expect(ics).toContain('BEGIN:VEVENT');
      expect(ics).toContain('אזכרה');
      expect(ics).toContain('END:VEVENT');
      expect(ics).toContain('END:VCALENDAR');
    });

    it('should include event details', () => {
      const ics = generateICSFile(
        mockAzkara,
        'אלכס שטרית',
        {
          location: 'בית העלמין',
          description: 'יום אזכרה משפחתי',
          startTime: '10:00',
        }
      );
      
      expect(ics).toContain('בית העלמין');
    });

    it('should handle missing optional details', () => {
      const ics = generateICSFile(mockAzkara, 'אלכס שטרית');
      
      expect(ics).toBeTruthy();
      expect(ics).toContain('BEGIN:VCALENDAR');
    });
  });

  describe('generateGoogleCalendarUrl', () => {
    it('should generate valid Google Calendar URL', () => {
      const url = generateGoogleCalendarUrl(mockAzkara, 'אלכס שטרית');
      
      expect(url).toContain('calendar.google.com');
      expect(url).toContain('action=TEMPLATE');
      // Hebrew text is URL-encoded in the URL
      expect(url).toContain('%D7%90%D7%96%D7%9B%D7%A8%D7%94'); // "אזכרה" encoded
    });

    it('should include event details in URL', () => {
      const url = generateGoogleCalendarUrl(
        mockAzkara,
        'אלכס שטרית',
        {
          location: 'בית העלמין',
          description: 'יום אזכרה',
          startTime: '10:00',
        }
      );
      
      expect(url).toContain('location=');
      expect(url).toContain('details=');
      expect(url).toContain('dates=');
    });

    it('should encode dates in correct format', () => {
      const url = generateGoogleCalendarUrl(mockAzkara, 'אלכס שטרית');
      
      // Google Calendar expects format: YYYYMMDDTHHMMSSZ
      expect(url).toMatch(/dates=\d{8}T\d{6}Z/);
    });
  });
});
