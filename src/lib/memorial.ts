import type { HebrewDate } from '@/types';
import { defaultMemorial, getMemorial } from '@/lib/firebase/data';
import { isFirebaseConfigured } from '@/lib/firebase/config';

/**
 * Verified Hebrew death date. Uses Firestore when Firebase is configured,
 * otherwise the built-in memorial record or environment fallback.
 */
export async function getHebrewDeathDate(): Promise<HebrewDate | null> {
  if (!isFirebaseConfigured()) {
    return hebrewDateFromDefault();
  }

  try {
    const memorial = await getMemorial();
    if (
      memorial.death_date_verified &&
      memorial.hebrew_death_date_day &&
      memorial.hebrew_death_date_month &&
      memorial.hebrew_death_date_year
    ) {
      return {
        day: memorial.hebrew_death_date_day,
        month: memorial.hebrew_death_date_month,
        year: memorial.hebrew_death_date_year,
      };
    }

    return null;
  } catch (error) {
    console.error('Unexpected error fetching death date:', error);
    return hebrewDateFromDefault();
  }
}

function hebrewDateFromDefault(): HebrewDate | null {
  const day = process.env.NEXT_PUBLIC_DEATH_DATE_HEBREW_DAY;
  const month = process.env.NEXT_PUBLIC_DEATH_DATE_HEBREW_MONTH;
  const year = process.env.NEXT_PUBLIC_DEATH_DATE_HEBREW_YEAR;

  if (day && month && year && day !== 'PENDING_VERIFICATION') {
    return {
      day: parseInt(day, 10),
      month,
      year: parseInt(year, 10),
    };
  }

  if (!defaultMemorial.hebrew_death_date_day || !defaultMemorial.hebrew_death_date_month) {
    return null;
  }

  return {
    day: defaultMemorial.hebrew_death_date_day,
    month: defaultMemorial.hebrew_death_date_month,
    year: defaultMemorial.hebrew_death_date_year ?? 5781,
  };
}

export async function getMemorialVerificationStatus(): Promise<{
  verified: boolean;
  status: 'pending' | 'before_sunset' | 'after_sunset';
  candidateBeforeSunset: HebrewDate | null;
  candidateAfterSunset: HebrewDate | null;
}> {
  const empty = {
    verified: false,
    status: 'pending' as const,
    candidateBeforeSunset: null,
    candidateAfterSunset: null,
  };

  try {
    const memorial = isFirebaseConfigured() ? await getMemorial() : defaultMemorial;
    return {
      verified: memorial.death_date_verified,
      status: memorial.death_time_relative_to_sunset,
      candidateBeforeSunset: {
        day: memorial.hebrew_date_before_sunset_day,
        month: memorial.hebrew_date_before_sunset_month,
        year: memorial.hebrew_date_before_sunset_year,
      },
      candidateAfterSunset: {
        day: memorial.hebrew_date_after_sunset_day,
        month: memorial.hebrew_date_after_sunset_month,
        year: memorial.hebrew_date_after_sunset_year,
      },
    };
  } catch (error) {
    console.error('Error fetching verification status:', error);
    return empty;
  }
}
