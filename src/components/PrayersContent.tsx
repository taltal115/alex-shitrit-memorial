'use client';

import { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight, Plus, Minus, Calendar, Clock, AlertCircle } from 'lucide-react';
import { sephardiPrayerSections } from '@/data/sephardi-prayers';
import { listPrayerSections } from '@/lib/firebase/data';
import { isFirebaseConfigured } from '@/lib/firebase/config';
import { SHOW_PENDING_SECTIONS_PUBLICLY } from '@/config/prayers';

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
      if (!isFirebaseConfigured()) {
        setPrayerSections(sephardiPrayerSections);
        setLoading(false);
        return;
      }

      try {
        const data = await listPrayerSections();
        const visible = data.filter((section) =>
          SHOW_PENDING_SECTIONS_PUBLICLY
            ? section.verification_status !== 'rejected'
            : section.is_verified
        );
        setPrayerSections(visible.length > 0 ? visible : sephardiPrayerSections);
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

  // Letter-to-word mapping for Psalm 119
  const getLetterMapping = (position: number, sectionId: string) => {
    const nameWords = [
      { word: 'אלכס', letters: ['א', 'ל', 'כ', 'ס'] },
      { word: 'יחיא', letters: ['י', 'ח', 'י', 'א'] },
      { word: 'בן', letters: ['ב', 'ן'] },
      { word: 'פורטונה', letters: ['פ', 'ו', 'ר', 'ט', 'ו', 'נ', 'ה'] }
    ];
    
    const neshemaWord = { word: 'נשמה', letters: ['נ', 'ש', 'מ', 'ה'] };
    
    if (sectionId === 'psalm119-name') {
      let currentPos = 1;
      for (const { word, letters } of nameWords) {
        if (position >= currentPos && position < currentPos + letters.length) {
          const letterIndex = position - currentPos;
          return {
            fullName: 'אלכס יחיא בן פורטונה',
            currentWord: word,
            currentLetter: letters[letterIndex],
            letterPosition: position
          };
        }
        currentPos += letters.length;
      }
    } else if (sectionId === 'psalm119-neshama') {
      const letterIndex = position - 1;
      if (letterIndex >= 0 && letterIndex < neshemaWord.letters.length) {
        return {
          fullName: 'נשמה',
          currentWord: neshemaWord.word,
          currentLetter: neshemaWord.letters[letterIndex],
          letterPosition: position
        };
      }
    }
    
    return null;
  };

  // Render Psalm 119 header with highlighted letter
  const renderPsalm119Header = (letter: string, position: number, sectionId: string) => {
    const mapping = getLetterMapping(position, sectionId);
    
    if (!mapping) return null;
    
    // Build array of letters with their positions in the full name
    const buildLetterPositions = (text: string, sectionId: string) => {
      const allWords = sectionId === 'psalm119-name' 
        ? [
            { word: 'אלכס', letters: ['א', 'ל', 'כ', 'ס'] },
            { word: 'יחיא', letters: ['י', 'ח', 'י', 'א'] },
            { word: 'בן', letters: ['ב', 'ן'] },
            { word: 'פורטונה', letters: ['פ', 'ו', 'ר', 'ט', 'ו', 'נ', 'ה'] }
          ]
        : [{ word: 'נשמה', letters: ['נ', 'ש', 'מ', 'ה'] }];
      
      const letterPositions: { char: string; pos: number; isSpace: boolean; charIndex: number }[] = [];
      let currentPos = 1;
      let charIndex = 0;
      
      for (let wordIdx = 0; wordIdx < allWords.length; wordIdx++) {
        const { letters: wordLetters } = allWords[wordIdx];
        
        for (let i = 0; i < wordLetters.length; i++) {
          letterPositions.push({
            char: text[charIndex],
            pos: currentPos,
            isSpace: false,
            charIndex
          });
          currentPos++;
          charIndex++;
        }
        
        // Add space after word (except last word)
        if (wordIdx < allWords.length - 1 && charIndex < text.length) {
          letterPositions.push({
            char: ' ',
            pos: -1,
            isSpace: true,
            charIndex
          });
          charIndex++;
        }
      }
      
      return letterPositions;
    };
    
    const letterPositions = buildLetterPositions(mapping.fullName, sectionId);
    
    return (
      <div className="mb-4 p-4 bg-sand/5 border-2 border-sand/20 rounded-lg">
        <div className="text-center text-2xl mb-2 leading-loose">
          {letterPositions.map((item, idx) => {
            if (item.isSpace) return <span key={idx}> </span>;
            
            const isHighlighted = item.pos === position;
            
            return (
              <span
                key={idx}
                className={isHighlighted ? 'text-sand font-bold text-3xl' : ''}
              >
                {item.char}
              </span>
            );
          })}
        </div>
        <div className="text-center text-lg text-sand font-semibold">
          {letter}׳ – {mapping.currentWord}
        </div>
      </div>
    );
  };

  // Check if a verse is a letter heading
  const isLetterHeading = (verse: string) => {
    return /^\[(.+?)\s*\|\s*(\d+)\](.*)$/.test(verse);
  };

  // Render verse with special handling for letter headings and name placeholders
  const renderVerse = (verse: string, index: number, verses: string[]) => {
    // Check if this is a letter heading in Psalm 119 (format: [letter | position])
    const letterHeadingMatch = verse.match(/^\[(.+?)\s*\|\s*(\d+)\](.*)$/);
    if (letterHeadingMatch) {
      const [, letter, position, description] = letterHeadingMatch;
      const sectionId = currentPrayerSection.section_id;
      const showEnhancedHeader = sectionId === 'psalm119-name' || sectionId === 'psalm119-neshama';
      
      return (
        <div key={index}>
          {showEnhancedHeader && renderPsalm119Header(letter, parseInt(position), sectionId)}
          <div className="mt-6 mb-3 text-center">
            <div className="inline-block px-6 py-3 bg-sand/10 border-2 border-sand rounded-lg">
              <span className="text-2xl font-bold text-sand">{letter}</span>
              {description && <span className="mr-2 text-sm text-gray-600">{description}</span>}
            </div>
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
    // Regular verse - apply drop cap ONLY if previous verse was a letter heading or this is the first verse
    const isPsalm119 = currentPrayerSection.section_id === 'psalm119-name' || 
                       currentPrayerSection.section_id === 'psalm119-neshama';
    
    const isFirstVerseAfterHeading = index > 0 && isLetterHeading(verses[index - 1]);
    const isFirstVerse = index === 0;
    const shouldHaveDropCap = isPsalm119 && (isFirstVerseAfterHeading || isFirstVerse);
    
    return (
      <p key={index} className={`mb-3 leading-loose ${shouldHaveDropCap ? 'verse-drop-cap' : ''}`}>
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

  if (error) {
    return (
      <main className="min-h-screen bg-background">
        <section className="py-12">
          <div className="container mx-auto px-4 text-center">
            <p className="text-xl text-red-600">{error}</p>
          </div>
        </section>
      </main>
    );
  }

  if (prayerSections.length === 0) {
    return (
      <main className="min-h-screen bg-background">
        <section className="py-12">
          <div className="container mx-auto px-4">
            <div className="max-w-2xl mx-auto text-center">
              <div className="bg-linen p-8 rounded-lg shadow-md">
                <h2 className="text-2xl font-bold mb-4">תפילות באזכרה</h2>
                <p className="text-lg mb-4">
                  נוסחי התפילות עדיין בתהליך אימות משפחתי
                </p>
                <p className="text-gray-600">
                  התכנים יפורסמו בקרוב לאחר אישור המשפחה והרב
                </p>
              </div>
            </div>
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
                  currentPrayerSection.verses.map((verse, index) => renderVerse(verse, index, currentPrayerSection.verses || []))
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
                {(() => {
                  const renderedSections: JSX.Element[] = [];
                  let psalm119Merged = false;
                  
                  prayerSections.forEach((section, index) => {
                    const isPsalm119 = section.section_id === 'psalm119-name' || 
                                       section.section_id === 'psalm119-neshama';
                    
                    if (isPsalm119 && !psalm119Merged) {
                      // Render merged Psalm 119 button (links to first psalm119 section)
                      const hasPending = prayerSections.some(s => 
                        (s.section_id === 'psalm119-name' || s.section_id === 'psalm119-neshama') &&
                        s.verification_status === 'pending_family_verification'
                      );
                      
                      renderedSections.push(
                        <button
                          key="psalm119-merged"
                          onClick={() => setCurrentSection(index)}
                          className={`px-4 py-2 rounded-lg text-sm transition-colors relative ${
                            currentPrayerSection.section_id === 'psalm119-name' || 
                            currentPrayerSection.section_id === 'psalm119-neshama'
                              ? 'bg-sand text-white'
                              : 'bg-background hover:bg-sand/20'
                          }`}
                        >
                          תהילים קיט
                          {hasPending && (
                            <span className="absolute -top-1 -right-1 w-3 h-3 bg-amber-400 rounded-full border-2 border-white"></span>
                          )}
                        </button>
                      );
                      psalm119Merged = true;
                    } else if (!isPsalm119) {
                      // Render regular section button
                      renderedSections.push(
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
                      );
                    }
                  });
                  
                  return renderedSections;
                })()}
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
