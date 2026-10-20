'use client';

import { useState } from 'react';
import { ChevronLeft, ChevronRight, Plus, Minus, Calendar, Clock } from 'lucide-react';

// PLACEHOLDER prayer sections - to be replaced with actual verified content from family
const prayerSections = [
  {
    id: 1,
    title: 'פתיחה',
    hebrewText: '[ברכת הפתיחה תאומת על ידי המשפחה לפי המנהג]',
    notes: 'נוסח הפתיחה יאומת על ידי המשפחה',
  },
  {
    id: 2,
    title: 'תהילים לפי האותיות',
    hebrewText: '[פרקי תהילים לפי אותיות השם יאומתו על ידי המשפחה]',
    notes: 'יש לאמת את פרקי התהילים המדויקים לפי המנהג המשפחתי',
  },
  {
    id: 3,
    title: 'תהילים לאותיות נשמה',
    hebrewText: '[פרקי תהילים לאותיות נ.ש.מ.ה - יש לאמת אם נכלל במנהג המשפחתי]',
    notes: 'לאימות: האם המנהג המשפחתי כולל פרקים אלו',
  },
  {
    id: 4,
    title: 'תפילת הנשמה',
    hebrewText: '[נוסח תפילת הנשמה יאומת על ידי המשפחה]',
    notes: 'לאימות: האם תפילה זו נכללת במנהג המשפחתי',
  },
  {
    id: 5,
    title: 'קדיש',
    hebrewText: 'הערה חשובה: אמירת קדיש תלויה בהלכה ובמנהג המשפחה.\n\nיש להתייעץ עם רב לגבי מי רשאי לומר קדיש ובאילו נסיבות.\n\nאתר זה אינו מכיל הוראות הלכתיות ואינו מהווה מקור הלכתי.',
    notes: 'הערה כללית בלבד - לא מכילה הוראות הלכתיות',
  },
  {
    id: 6,
    title: 'סיום',
    hebrewText: 'טוֹב שֵׁם מִשֶּׁמֶן טוֹב וְיוֹם הַמָּוֶת מִיּוֹם הִוָּלְדוֹ\n\n(קהלת ז:א)',
    notes: 'פסוק סיום מספר קהלת',
  },
];

export default function PrayersContent() {
  const [currentSection, setCurrentSection] = useState(0);
  const [textSize, setTextSize] = useState(18);

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
                    {prayerSections[currentSection].title}
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

            {/* Prayer Text */}
            <div className="bg-white p-6 md:p-10 rounded-lg shadow-lg min-h-[400px]">
              <h2 className="text-2xl font-bold mb-6 text-center border-b-2 border-sand pb-4">
                {prayerSections[currentSection].title}
              </h2>
              
              <div
                className="leading-relaxed whitespace-pre-wrap"
                style={{ fontSize: `${textSize}px` }}
              >
                {prayerSections[currentSection].hebrewText}
              </div>

              {prayerSections[currentSection].notes && (
                <div className="mt-8 pt-6 border-t border-sand/20">
                  <p className="text-sm text-gray-600 italic">
                    הערה: {prayerSections[currentSection].notes}
                  </p>
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
                    className={`px-4 py-2 rounded-lg text-sm transition-colors ${
                      currentSection === index
                        ? 'bg-sand text-white'
                        : 'bg-background hover:bg-sand/20'
                    }`}
                  >
                    {section.title}
                  </button>
                ))}
              </div>
            </div>

            {/* Important Notice */}
            <div className="mt-8 p-6 bg-amber-50 border-2 border-amber-200 rounded-lg">
              <h3 className="font-semibold mb-2 text-amber-900">הערה חשובה</h3>
              <p className="text-sm text-amber-800">
                נוסחי התפילות באתר זה הינם placeholders בלבד ויוחלפו בנוסחים המדויקים
                שיאומתו על ידי המשפחה בהתאם למנהג ולנוסח המשפחתי.
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
