import { createEvents, EventAttributes } from 'ics';
import type { AzkaraDate } from '@/types';

/**
 * Generate ICS calendar file for azkara event
 */
export function generateICSFile(
  azkara: AzkaraDate,
  memorialName: string,
  eventDetails?: {
    location?: string;
    description?: string;
    startTime?: string;
  }
): string | null {
  const startDate = new Date(azkara.gregorianDate);
  
  // If start time is provided, set it; otherwise use 10:00 AM as default
  if (eventDetails?.startTime) {
    const [hours, minutes] = eventDetails.startTime.split(':').map(Number);
    startDate.setHours(hours, minutes, 0, 0);
  } else {
    startDate.setHours(10, 0, 0, 0);
  }
  
  // Event lasts 2 hours by default
  const endDate = new Date(startDate);
  endDate.setHours(endDate.getHours() + 2);
  
  const event: EventAttributes = {
    start: [
      startDate.getFullYear(),
      startDate.getMonth() + 1,
      startDate.getDate(),
      startDate.getHours(),
      startDate.getMinutes(),
    ],
    end: [
      endDate.getFullYear(),
      endDate.getMonth() + 1,
      endDate.getDate(),
      endDate.getHours(),
      endDate.getMinutes(),
    ],
    title: `אזכרה - ${memorialName}`,
    description: eventDetails?.description || `יום האזכרה של ${memorialName}`,
    location: eventDetails?.location || 'LOCATION_TO_BE_CONFIRMED',
    status: 'CONFIRMED' as const,
    busyStatus: 'BUSY' as const,
    organizer: { name: 'Memorial Website' },
  };
  
  const { error, value } = createEvents([event]);
  
  if (error) {
    console.error('Error creating ICS file:', error);
    return null;
  }
  
  return value || null;
}

/**
 * Generate Google Calendar URL
 */
export function generateGoogleCalendarUrl(
  azkara: AzkaraDate,
  memorialName: string,
  eventDetails?: {
    location?: string;
    description?: string;
    startTime?: string;
  }
): string {
  const startDate = new Date(azkara.gregorianDate);
  
  if (eventDetails?.startTime) {
    const [hours, minutes] = eventDetails.startTime.split(':').map(Number);
    startDate.setHours(hours, minutes, 0, 0);
  } else {
    startDate.setHours(10, 0, 0, 0);
  }
  
  const endDate = new Date(startDate);
  endDate.setHours(endDate.getHours() + 2);
  
  const formatDateForGoogle = (date: Date) => {
    return date.toISOString().replace(/-|:|\.\d+/g, '');
  };
  
  const params = new URLSearchParams({
    action: 'TEMPLATE',
    text: `אזכרה - ${memorialName}`,
    dates: `${formatDateForGoogle(startDate)}/${formatDateForGoogle(endDate)}`,
    details: eventDetails?.description || `יום האזכרה של ${memorialName}`,
    location: eventDetails?.location || 'LOCATION_TO_BE_CONFIRMED',
  });
  
  return `https://calendar.google.com/calendar/render?${params.toString()}`;
}

/**
 * Generate Apple Calendar URL (webcal)
 */
export function generateAppleCalendarUrl(icsContent: string): string {
  // In production, this would point to an API endpoint that serves the ICS file
  // For now, we'll use a data URL approach
  const base64 = Buffer.from(icsContent).toString('base64');
  return `data:text/calendar;base64,${base64}`;
}
