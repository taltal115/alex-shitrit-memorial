'use client';

import { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight, Plus, Minus, Calendar, Clock, AlertCircle } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';

interface PrayerSection {
  id: string;
  section_id: string;
  section_order: number;
  title: string;
  hebrew_text: string;
  notes: string | null;
  source_url: string | null;
  verses: string[] | null;
  verification_status: 'pending_family_verification' | 'verified' | 'rejected';
  is_verified: boolean;
}

export default function PrayersContent() {
  const [prayerSections, setPrayerSections] = useState<PrayerSection[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentSection, setCurrentSection] = useState(0);
  const [textSize, setTextSize] = useState(20);

  useEffect(() => {
    async function fetchPrayerSections() {
      try {
        const supabase = createClient();
        const { data, error } = await supabase
          .from('prayer_section')
          .select('*')
          .order('section_order', { ascending: true });

        if (error) {
          console.error('Error fetching prayer sections:', error);
          setError('שגיאה בטעינת תפילות');
          return;
        }

        if (data) {
          setPrayerSections(data as PrayerSection[]);
        }
      } catch (err) {
        console.error('Error:', err);
        setError('שגיאה בטעינת תפילות');
      } finally {
        setLoading(false);
      }
    }

    fetchPrayerSections();
  }, []);

  const nextSection = () => {
    if (currentSection < prayerSections.length - 1) {
      setCurrentSection(currentSection + 1);
    }
  };

  const prevSection = () => {
    if (currentSection > 0) {
      setCurrentSection(currentSection - 1);
    }
  };

  const increaseTextSize = () => {
    if (textSize < 32) {
      setTextSize(textSize + 2);
    }
  };

  const decreaseTextSize = () => {
    if (textSize > 14) {
      setTextSize(textSize - 2);
    }
  };

  // Render verse with special handling for letter headings and name placeholders
  const renderVerse = (verse: string, index: number) => {
    // Check if this is a letter heading in Psalm 119 (format: [letter | position])
    const letterHeadingMatch = verse.match(/^\[(.+?)\s*\|\s*(\d+)\](.*)$/);
    if (letterHeadingMatch) {
      const [, letter, position, description] = letterHeadingMatch;
      return (
        <div key={index} className="mt-6 mb-3 text-center">
          <div className="inline-block px-6 py-3 bg-sand/10 border-2 border-sand rounded-lg">
            <span className="text-2xl font-bold text-sand">{letter}</span>
            {description && <span className="mr-2 text-sm text-gray-600">{description}</span>}
          </div>
        </div>
      );
    }

    // Check for name placeholder: [[NAME: ...]]
    const nameMatch = verse.match(/\[\[NAME:\s*(.+?)\]\]/);
    if (nameMatch) {
      const parts = verse.split(/\[\[NAME:.+?\]\]/);
      const name = nameMatch[1];
      return (
        <p key={index} className="mb-3 leading-loose">
          {parts[0]}
          <span className="inline-block px-3 py-1 mx-1 bg-amber-100 border-2 border-amber-400 rounded font-semibold text-amber-900">
            {name}
          </span>
          {parts[1]}
        </p>
      );
    }

    // Check if the line contains a missing space notice (like "לָ֫קָ֥חעֹֽשֵׂה־אֵ֑לֶּה")
    // This is a known issue in Psalm 15 that needs family verification
    // Regular verse
    return (
      <p key={index} className="mb-3 leading-loose">
        {verse}
      </p>
    );
  };

  if (loading) {
    return (
      <main className="min-h-screen bg-background">
        <section className="py-12">
          <div className="container mx-auto px-4 text-center">
            <p className="text-xl">טוען תפילות...</p>
          </div>
        </section>
      </main>
    );
  }

  if (error || prayerSections.length === 0) {
    return (
      <main className="min-h-screen bg-background">
        <section className="py-12">
          <div className="container mx-auto px-4 text-center">
            <p className="text-xl text-red-600">{error || 'לא נמצאו תפילות'}</p>
          </div>
        </section>
      </main>
    );
  }

  const currentPrayerSection = prayerSections[currentSection];

  return (
    <main className="min-h-screen bg-background">
      {/* Header */}
      <section className="bg-linen py-8 border-b-2 border-sand">
        <div className="container mx-auto px-4">
          <h1 className="text-3xl md:text-4xl font-bold text-center mb-4">
            תפילות לעילוי נשמת
          </h1>
          <h2 className="text-2xl md:text-3xl text-center text-sand mb-6">
            אלכס שטרית ז״ל
          </h2>

          {/* Azkara Date Info */}
          <div className="max-w-2xl mx-auto bg-background p-6 rounded-lg shadow-md">
            <div className="flex items-start gap-4">
              <Calendar className="text-sand mt-1 flex-shrink-0" size={24} />
              <div className="flex-1">
                <h3 className="font-semibold mb-2">מועד האזכרה הבא</h3>
                <p className="text-sm text-gray-600 mb-2 italic">
                  התאריך העברי ממתין לאימות סופי מהמשפחה
                </p>
                <p className="text-gray-700">
                  לאחר אימות התאריך העברי, יוצג כאן החישוב האוטומטי<br />
                  של מועד האזכרה הקרוב עם ספירה לאחור וקישורים ליומן
                </p>
              </div>
            </div>

            {/* Event Times Section */}
            <div className="mt-6 pt-6 border-t border-sand/20">
              <div className="flex items-start gap-4">
                <Clock className="text-sand mt-1 flex-shrink-0" size={24} />
                <div className="flex-1">
                  <h3 className="font-semibold mb-2">שעות האירוע</h3>
                  <p className="text-sm text-gray-600">
                    שעות ההתכנסות, התפילה, הביקור בקבר והסעודה<br />
                    יוזנו על ידי המשפחה באזור הניהול
                  </p>
                  <p className="text-xs text-gray-500 mt-2">
                    זמנים הלכתיים (שקיעה, צאת הכוכבים) מחושבים אוטומטית לפי מיקום בית העלמין
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Text Size Controls */}
      <section className="bg-linen py-4 sticky top-16 z-40 border-b border-sand/20">
        <div className="container mx-auto px-4">
          <div className="flex justify-center items-center gap-4">
            <span className="text-sm font-medium">גודל טקסט:</span>
            <button
              onClick={decreaseTextSize}
              disabled={textSize <= 14}
              className="p-2 bg-sand text-white rounded-lg hover:opacity-90 disabled:opacity-40 disabled:cursor-not-allowed"
              aria-label="הקטן טקסט"
            >
              <Minus size={20} />
            </button>
            <span className="text-sm font-medium w-12 text-center">{textSize}</span>
            <button
              onClick={increaseTextSize}
              disabled={textSize >= 32}
              className="p-2 bg-sand text-white rounded-lg hover:opacity-90 disabled:opacity-40 disabled:cursor-not-allowed"
              aria-label="הגדל טקסט"
            >
              <Plus size={20} />
            </button>
          </div>
        </div>
      </section>

      {/* Prayer Content */}
      <section className="py-8 md:py-12">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto">
            {/* Section Navigation */}
            <div className="mb-6 p-4 bg-linen rounded-lg">
              <div className="flex justify-between items-center">
                <button
                  onClick={prevSection}
                  disabled={currentSection === 0}
                  className="p-2 hover:bg-sand/20 rounded-lg disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                  aria-label="תפילה קודמת"
                >
                  <ChevronRight size={24} />
                </button>
                
                <div className="text-center">
                  <p className="text-sm text-gray-600">
                    {currentSection + 1} מתוך {prayerSections.length}
                  </p>
                  <p className="font-semibold">
                    {currentPrayerSection.title}
                  </p>
                </div>
                
                <button
                  onClick={nextSection}
                  disabled={currentSection === prayerSections.length - 1}
                  className="p-2 hover:bg-sand/20 rounded-lg disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                  aria-label="תפילה הבאה"
                >
                  <ChevronLeft size={24} />
                </button>
              </div>
            </div>

            {/* Verification Status Warning */}
            {currentPrayerSection.verification_status === 'pending_family_verification' && (
              <div className="mb-6 p-4 bg-amber-50 border-2 border-amber-300 rounded-lg">
                <div className="flex items-start gap-3">
                  <AlertCircle className="text-amber-600 mt-1 flex-shrink-0" size={20} />
                  <div className="flex-1">
                    <p className="font-semibold text-amber-900 mb-1">ממתין לאימות משפחתי</p>
                    <p className="text-sm text-amber-800">
                      נוסח תפילה זה טרם אושר על ידי המשפחה. הטקסט עשוי להשתנות.
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Missing Hashkava Text Warning */}
            {currentPrayerSection.section_id === 'hashkava-man' && (
              <div className="mb-6 p-4 bg-blue-50 border-2 border-blue-300 rounded-lg">
                <div className="flex items-start gap-3">
                  <AlertCircle className="text-blue-600 mt-1 flex-shrink-0" size={20} />
                  <div className="flex-1">
                    <p className="font-semibold text-blue-900 mb-1">השכבה חלקית</p>
                    <p className="text-sm text-blue-800">
                      הטקסט המלא של ההשכבה אחרי "טוב שם משמן טוב" ממתין לאישור המשפחה.
                      לא הוספנו טקסט שלא אומת במקור.
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Prayer Text */}
            <div className="bg-white p-6 md:p-10 rounded-lg shadow-lg min-h-[400px]">
              <h2 className="text-2xl font-bold mb-6 text-center border-b-2 border-sand pb-4">
                {currentPrayerSection.title}
              </h2>
              
              <div
                className="leading-relaxed text-right"
                style={{ fontSize: `${textSize}px` }}
                dir="rtl"
              >
                {currentPrayerSection.verses && currentPrayerSection.verses.length > 0 ? (
                  currentPrayerSection.verses.map((verse, index) => renderVerse(verse, index))
                ) : (
                  <p className="text-gray-500 italic text-center">
                    אין תוכן זמין לתפילה זו
                  </p>
                )}
              </div>

              {currentPrayerSection.notes && (
                <div className="mt-8 pt-6 border-t border-sand/20">
                  <p className="text-sm text-gray-600">
                    <span className="font-semibold">הערה: </span>
                    {currentPrayerSection.notes}
                  </p>
                </div>
              )}

              {currentPrayerSection.source_url && (
                <div className="mt-4">
                  <a
                    href={currentPrayerSection.source_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-xs text-sand hover:underline"
                  >
                    מקור בספריא ←
                  </a>
                </div>
              )}
            </div>

            {/* Quick Jump */}
            <div className="mt-8 p-4 bg-linen rounded-lg">
              <p className="text-sm font-medium mb-3 text-center">מעבר מהיר:</p>
              <div className="flex flex-wrap gap-2 justify-center">
                {prayerSections.map((section, index) => (
                  <button
                    key={section.id}
                    onClick={() => setCurrentSection(index)}
                    className={`px-4 py-2 rounded-lg text-sm transition-colors relative ${
                      currentSection === index
                        ? 'bg-sand text-white'
                        : 'bg-background hover:bg-sand/20'
                    }`}
                  >
                    {section.title.split('–')[0].trim()}
                    {section.verification_status === 'pending_family_verification' && (
                      <span className="absolute -top-1 -right-1 w-3 h-3 bg-amber-400 rounded-full border-2 border-white"></span>
                    )}
                  </button>
                ))}
              </div>
            </div>

            {/* Important Notice */}
            <div className="mt-8 p-6 bg-amber-50 border-2 border-amber-200 rounded-lg">
              <h3 className="font-semibold mb-2 text-amber-900">הערה חשובה</h3>
              <p className="text-sm text-amber-800">
                נוסחי התפילות באתר זה ממתינים לאימות סופי מהמשפחה בהתאם למנהג ולנוסח המשפחתי.
                <br /><br />
                אתר זה אינו מהווה מקור הלכתי ואינו מכיל הוראות הלכתיות.
                יש להתייעץ עם רב בכל שאלה הלכתית.
              </p>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
