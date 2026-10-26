'use client';

import { useEffect, useState } from 'react';
import { calculateNextYahrzeit, type YahrzeitInfo } from '@/utils/yahrzeit';
import { Calendar } from 'lucide-react';
import Link from 'next/link';
import { CopyText } from '@/components/edit/EditableText';

interface YahrzeitCountdownProps {
  hebrewDay: number;
  hebrewMonth: string;
  hebrewYear: number;
  deathYear: number;
  timezone?: string;
}

export default function YahrzeitCountdown({
  hebrewDay,
  hebrewMonth,
  hebrewYear,
  deathYear,
  timezone = 'Asia/Jerusalem',
}: YahrzeitCountdownProps) {
  const [yahrzeit, setYahrzeit] = useState<YahrzeitInfo | null>(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    
    // Initial calculation
    const updateYahrzeit = () => {
      const info = calculateNextYahrzeit(hebrewDay, hebrewMonth, hebrewYear, timezone);
      setYahrzeit(info);
    };
    
    updateYahrzeit();
    
    // Update every second for countdown
    const interval = setInterval(updateYahrzeit, 1000);
    
    return () => clearInterval(interval);
  }, [hebrewDay, hebrewMonth, hebrewYear, timezone]);

  // Prevent hydration mismatch by not rendering until mounted
  if (!mounted || !yahrzeit) {
    return (
      <section className="py-12 bg-linen">
        <div className="container mx-auto px-4">
          <div className="max-w-2xl mx-auto text-center">
            <Calendar className="mx-auto mb-4 text-sand" size={48} />
            <h2 className="text-3xl font-bold mb-4">
            <CopyText id="yahrzeit.title" fallback="האזכרה הבאה" />
          </h2>
            <div className="bg-background p-6 rounded-lg shadow-md">
              <div className="animate-pulse">
                <div className="h-4 bg-sand/20 rounded mb-4"></div>
                <div className="h-8 bg-sand/20 rounded mb-4"></div>
                <div className="h-16 bg-sand/20 rounded"></div>
              </div>
            </div>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="py-12 bg-linen">
      <div className="container mx-auto px-4">
        <div className="max-w-2xl mx-auto text-center">
          <Calendar className="mx-auto mb-4 text-sand" size={48} />
          <h2 className="text-3xl font-bold mb-4">
            <CopyText id="yahrzeit.title" fallback="האזכרה הבאה" />
          </h2>
          
          <div className="bg-background p-8 rounded-lg shadow-md">
            {yahrzeit.isToday ? (
              <div className="mb-6 p-4 bg-sand/10 border-2 border-sand rounded-lg">
                <p className="text-2xl font-bold text-sand mb-2">
                  🕯️ היום יום האזכרה 🕯️
                </p>
                <p className="text-lg">
                  {yahrzeit.yearsSince} שנים מאז פטירתו
                </p>
              </div>
            ) : null}
            
            {/* Hebrew Date */}
            <div className="mb-6">
              <p className="text-sm text-gray-600 mb-2">
                <CopyText id="yahrzeit.hebrewLabel" fallback="תאריך עברי" />
              </p>
              <p className="text-3xl font-bold text-sand mb-1">
                {yahrzeit.hebrewDate}
              </p>
              <p className="text-lg text-gray-700">
                {yahrzeit.dayOfWeek}
              </p>
            </div>
            
            {/* Gregorian Date */}
            <div className="mb-6">
              <p className="text-sm text-gray-600 mb-2">
                <CopyText id="yahrzeit.gregorianLabel" fallback="תאריך לועזי" />
              </p>
              <p className="text-xl font-semibold">
                {yahrzeit.gregorianFormatted}
              </p>
            </div>
            
            {/* Years Since */}
            <div className="mb-8 p-4 bg-linen rounded-lg">
              <p className="text-2xl font-bold text-sand">
                {yahrzeit.yearsSince} שנים מאז פטירתו
              </p>
            </div>
            
            {/* Countdown */}
            {!yahrzeit.isToday && (
              <div className="mb-8">
                <p className="text-sm text-gray-600 mb-4">
                  <CopyText id="yahrzeit.countdown" fallback="ספירה לאחור" />
                </p>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 max-w-md mx-auto">
                  {/* Days */}
                  <div className="bg-linen p-3 sm:p-4 rounded-lg">
                    <p className="text-2xl sm:text-3xl font-bold text-sand">
                      {yahrzeit.daysUntil}
                    </p>
                    <p className="text-xs sm:text-sm text-gray-600">
                      <CopyText id="yahrzeit.days" fallback="ימים" />
                    </p>
                  </div>
                  
                  {/* Hours */}
                  <div className="bg-linen p-3 sm:p-4 rounded-lg">
                    <p className="text-2xl sm:text-3xl font-bold text-sand">
                      {yahrzeit.hoursUntil}
                    </p>
                    <p className="text-xs sm:text-sm text-gray-600">
                      <CopyText id="yahrzeit.hours" fallback="שעות" />
                    </p>
                  </div>
                  
                  {/* Minutes */}
                  <div className="bg-linen p-3 sm:p-4 rounded-lg">
                    <p className="text-2xl sm:text-3xl font-bold text-sand">
                      {yahrzeit.minutesUntil}
                    </p>
                    <p className="text-xs sm:text-sm text-gray-600">
                      <CopyText id="yahrzeit.minutes" fallback="דקות" />
                    </p>
                  </div>
                  
                  {/* Seconds */}
                  <div className="bg-linen p-3 sm:p-4 rounded-lg">
                    <p className="text-2xl sm:text-3xl font-bold text-sand">
                      {yahrzeit.secondsUntil}
                    </p>
                    <p className="text-xs sm:text-sm text-gray-600">
                      <CopyText id="yahrzeit.seconds" fallback="שניות" />
                    </p>
                  </div>
                </div>
              </div>
            )}
            
            {/* CTA */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                href="/#prayers"
                className="bg-sand text-white px-6 py-3 rounded-lg hover:opacity-90 transition-opacity font-medium"
              >
                <CopyText id="yahrzeit.prayersButton" fallback="קריאת תפילות לעילוי נשמתו" />
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
