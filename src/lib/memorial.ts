// @ts-nocheck - Database types not fully generated yet
import { createClient } from '@/lib/supabase/server';
import type { HebrewDate } from '@/types';

/**
 * Get the verified Hebrew death date from the database
 * Falls back to environment variables if not set in DB
 */
export async function getHebrewDeathDate(): Promise<HebrewDate | null> {
  const supabase = createClient();

  try {
    const { data: memorial, error } = await supabase
      .from('memorial')
      .select(
        `
        death_date_verified,
        death_time_relative_to_sunset,
        hebrew_death_date_day,
        hebrew_death_date_month,
        hebrew_death_date_year,
        hebrew_date_before_sunset_day,
        hebrew_date_before_sunset_month,
        hebrew_date_before_sunset_year,
        hebrew_date_after_sunset_day,
        hebrew_date_after_sunset_month,
        hebrew_date_after_sunset_year
      `
      )
      .single();

    if (error) {
      console.error('Error fetching memorial death date:', error);
      return getHebrewDeathDateFromEnv();
    }

    // If verified and set in DB, use that
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

    // If not verified but candidates exist, show pending state
    // (This case is handled by the admin UI, but we can return null here)
    if (
      !memorial.death_date_verified &&
      memorial.hebrew_date_before_sunset_day &&
      memorial.hebrew_date_after_sunset_day
    ) {
      // Return null to indicate pending verification
      // The UI should show both candidates
      return null;
    }

    // Fall back to environment variables
    return getHebrewDeathDateFromEnv();
  } catch (error) {
    console.error('Unexpected error fetching death date:', error);
    return getHebrewDeathDateFromEnv();
  }
}

/**
 * Get Hebrew death date from environment variables (fallback)
 */
function getHebrewDeathDateFromEnv(): HebrewDate | null {
  const day = process.env.NEXT_PUBLIC_DEATH_DATE_HEBREW_DAY;
  const month = process.env.NEXT_PUBLIC_DEATH_DATE_HEBREW_MONTH;
  const year = process.env.NEXT_PUBLIC_DEATH_DATE_HEBREW_YEAR;

  if (!day || !month || !year) {
    return null;
  }

  return {
    day: parseInt(day, 10),
    month,
    year: parseInt(year, 10),
  };
}

/**
 * Get memorial verification status
 */
export async function getMemorialVerificationStatus(): Promise<{
  verified: boolean;
  status: 'pending' | 'before_sunset' | 'after_sunset';
  candidateBeforeSunset: HebrewDate | null;
  candidateAfterSunset: HebrewDate | null;
}> {
  const supabase = createClient();

  try {
    const { data: memorial } = await supabase
      .from('memorial')
      .select(
        `
        death_date_verified,
        death_time_relative_to_sunset,
        hebrew_date_before_sunset_day,
        hebrew_date_before_sunset_month,
        hebrew_date_before_sunset_year,
        hebrew_date_after_sunset_day,
        hebrew_date_after_sunset_month,
        hebrew_date_after_sunset_year
      `
      )
      .single();

    if (!memorial) {
      return {
        verified: false,
        status: 'pending',
        candidateBeforeSunset: null,
        candidateAfterSunset: null,
      };
    }

    return {
      verified: memorial.death_date_verified || false,
      status: (memorial.death_time_relative_to_sunset as any) || 'pending',
      candidateBeforeSunset:
        memorial.hebrew_date_before_sunset_day &&
        memorial.hebrew_date_before_sunset_month &&
        memorial.hebrew_date_before_sunset_year
          ? {
              day: memorial.hebrew_date_before_sunset_day,
              month: memorial.hebrew_date_before_sunset_month,
              year: memorial.hebrew_date_before_sunset_year,
            }
          : null,
      candidateAfterSunset:
        memorial.hebrew_date_after_sunset_day &&
        memorial.hebrew_date_after_sunset_month &&
        memorial.hebrew_date_after_sunset_year
          ? {
              day: memorial.hebrew_date_after_sunset_day,
              month: memorial.hebrew_date_after_sunset_month,
              year: memorial.hebrew_date_after_sunset_year,
            }
          : null,
    };
  } catch (error) {
    console.error('Error fetching verification status:', error);
    return {
      verified: false,
      status: 'pending',
      candidateBeforeSunset: null,
      candidateAfterSunset: null,
    };
  }
}
