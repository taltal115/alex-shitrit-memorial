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
      expect(url).toContain('אזכרה');
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
