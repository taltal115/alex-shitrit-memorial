// __mocks__/ics.ts
// Mock the ics library to avoid ESM module issues in Jest

export function createEvent(event: any): { error: Error | null; value: string } {
  // Simple mock implementation
  if (!event.title || !event.start) {
    return { error: new Error('Invalid event'), value: '' };
  }
  
  // Return a simple iCal format string
  const icalString = `BEGIN:VCALENDAR
VERSION:2.0
PRODID:-//Test//Test//EN
BEGIN:VEVENT
UID:${Date.now()}@test.com
DTSTART:${event.start.join('')}
DTEND:${event.end.join('')}
SUMMARY:${event.title}
DESCRIPTION:${event.description || ''}
LOCATION:${event.location || ''}
END:VEVENT
END:VCALENDAR`;
  
  return { error: null, value: icalString };
}
