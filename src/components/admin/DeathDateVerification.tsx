'use client';

import { useState, useEffect } from 'react';
import { AlertCircle, CheckCircle, Calendar } from 'lucide-react';

interface MemorialData {
  id: string;
  gregorian_death_date: string;
  death_time_relative_to_sunset: 'pending' | 'before_sunset' | 'after_sunset';
  death_date_verified: boolean;
  hebrew_date_before_sunset_day: number;
  hebrew_date_before_sunset_month: string;
  hebrew_date_before_sunset_year: number;
  hebrew_date_after_sunset_day: number;
  hebrew_date_after_sunset_month: string;
  hebrew_date_after_sunset_year: number;
  death_date_verified_at: string | null;
}

export default function DeathDateVerification() {
  const [memorial, setMemorial] = useState<MemorialData | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    fetchMemorialData();
  }, []);

  const fetchMemorialData = async () => {
    try {
      const response = await fetch('/api/memorial/death-date');
      if (!response.ok) throw new Error('Failed to fetch memorial data');
      const data = await response.json();
      setMemorial(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setLoading(false);
    }
  };

  const handleVerify = async (choice: 'before_sunset' | 'after_sunset') => {
    if (!memorial) return;

    setSubmitting(true);
    setError(null);
    setSuccess(false);

    try {
      const response = await fetch('/api/memorial/death-date', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          death_time_relative_to_sunset: choice,
          hebrew_date_before_sunset_day: memorial.hebrew_date_before_sunset_day,
          hebrew_date_before_sunset_month: memorial.hebrew_date_before_sunset_month,
          hebrew_date_before_sunset_year: memorial.hebrew_date_before_sunset_year,
          hebrew_date_after_sunset_day: memorial.hebrew_date_after_sunset_day,
          hebrew_date_after_sunset_month: memorial.hebrew_date_after_sunset_month,
          hebrew_date_after_sunset_year: memorial.hebrew_date_after_sunset_year,
        }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Verification failed');
      }

      setSuccess(true);
      await fetchMemorialData();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="p-6 bg-linen rounded-lg">
        <p className="text-center">טוען...</p>
      </div>
    );
  }

  if (!memorial) {
    return (
      <div className="p-6 bg-red-50 border-2 border-red-200 rounded-lg">
        <p className="text-red-800">שגיאה בטעינת נתוני האזכרה</p>
      </div>
    );
  }

  const gregorianDate = new Date(memorial.gregorian_death_date);
  const gregorianFormatted = gregorianDate.toLocaleDateString('he-IL', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  return (
    <div className="space-y-6">
      {/* Status Banner */}
      {memorial.death_date_verified ? (
        <div className="p-6 bg-green-50 border-2 border-green-200 rounded-lg">
          <div className="flex items-start gap-3">
            <CheckCircle className="text-green-600 mt-1" size={24} />
            <div>
              <h3 className="font-semibold text-green-900 mb-2">
                התאריך העברי אומת
              </h3>
              <p className="text-sm text-green-800">
                התאריך העברי אושר על ידי מנהל ב-
                {memorial.death_date_verified_at &&
                  new Date(memorial.death_date_verified_at).toLocaleDateString('he-IL')}
              </p>
              <p className="text-sm text-green-800 mt-2">
                <strong>בחירה:</strong>{' '}
                {memorial.death_time_relative_to_sunset === 'before_sunset'
                  ? 'לפני השקיעה'
                  : 'אחרי השקיעה'}
              </p>
            </div>
          </div>
        </div>
      ) : (
        <div className="p-6 bg-amber-50 border-2 border-amber-200 rounded-lg">
          <div className="flex items-start gap-3">
            <AlertCircle className="text-amber-600 mt-1" size={24} />
            <div>
              <h3 className="font-semibold text-amber-900 mb-2">
                דרוש אימות התאריך העברי
              </h3>
              <p className="text-sm text-amber-800">
                יש לאמת האם הפטירה הייתה לפני או אחרי שקיעה
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Gregorian Date */}
      <div className="p-6 bg-linen rounded-lg">
        <div className="flex items-center gap-3 mb-4">
          <Calendar className="text-sand" size={24} />
          <h3 className="text-xl font-semibold">תאריך לועזי מאומת</h3>
        </div>
        <p className="text-2xl font-bold">{gregorianFormatted}</p>
      </div>

      {/* Candidate Hebrew Dates */}
      <div className="grid md:grid-cols-2 gap-6">
        {/* Before Sunset */}
        <div className="p-6 bg-white border-2 border-sand rounded-lg">
          <h4 className="font-semibold mb-4 text-lg">אם הפטירה הייתה לפני שקיעה</h4>
          <div className="mb-6">
            <p className="text-3xl font-bold text-sand mb-2">
              {memorial.hebrew_date_before_sunset_day} {memorial.hebrew_date_before_sunset_month}{' '}
              {memorial.hebrew_date_before_sunset_year}
            </p>
            <p className="text-sm text-gray-600">
              ט' בחשוון תשפ"א
            </p>
          </div>
          <button
            onClick={() => handleVerify('before_sunset')}
            disabled={submitting || memorial.death_date_verified}
            className={`w-full py-3 px-4 rounded-lg font-medium transition-colors ${
              memorial.death_time_relative_to_sunset === 'before_sunset' && memorial.death_date_verified
                ? 'bg-green-600 text-white'
                : 'bg-sand text-white hover:opacity-90 disabled:opacity-40'
            }`}
          >
            {memorial.death_time_relative_to_sunset === 'before_sunset' && memorial.death_date_verified
              ? '✓ בחירה נוכחית'
              : 'אמת תאריך זה'}
          </button>
        </div>

        {/* After Sunset */}
        <div className="p-6 bg-white border-2 border-sand rounded-lg">
          <h4 className="font-semibold mb-4 text-lg">אם הפטירה הייתה אחרי שקיעה</h4>
          <div className="mb-6">
            <p className="text-3xl font-bold text-sand mb-2">
              {memorial.hebrew_date_after_sunset_day} {memorial.hebrew_date_after_sunset_month}{' '}
              {memorial.hebrew_date_after_sunset_year}
            </p>
            <p className="text-sm text-gray-600">
              י' בחשוון תשפ"א
            </p>
          </div>
          <button
            onClick={() => handleVerify('after_sunset')}
            disabled={submitting || memorial.death_date_verified}
            className={`w-full py-3 px-4 rounded-lg font-medium transition-colors ${
              memorial.death_time_relative_to_sunset === 'after_sunset' && memorial.death_date_verified
                ? 'bg-green-600 text-white'
                : 'bg-sand text-white hover:opacity-90 disabled:opacity-40'
            }`}
          >
            {memorial.death_time_relative_to_sunset === 'after_sunset' && memorial.death_date_verified
              ? '✓ בחירה נוכחית'
              : 'אמת תאריך זה'}
          </button>
        </div>
      </div>

      {/* Explanation */}
      <div className="p-6 bg-blue-50 border border-blue-200 rounded-lg">
        <h4 className="font-semibold text-blue-900 mb-2">הסבר</h4>
        <p className="text-sm text-blue-800">
          היום העברי מתחיל בשקיעה. אם הפטירה הייתה <strong>לפני השקיעה</strong>, התאריך העברי הוא
          אותו יום עברי. אם הפטירה הייתה <strong>אחרי השקיעה</strong>, התאריך העברי הוא היום העברי
          הבא.
          <br />
          <br />
          יש להתייעץ עם המשפחה או עם רב כדי לקבוע את השעה המדויקת של הפטירה ביחס לשקיעה.
        </p>
      </div>

      {/* Error/Success Messages */}
      {error && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
          <p className="text-red-800">{error}</p>
        </div>
      )}

      {success && (
        <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
          <p className="text-green-800">התאריך אומת בהצלחה!</p>
        </div>
      )}
    </div>
  );
}
