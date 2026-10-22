import Navigation from '@/components/Navigation';
import Footer from '@/components/Footer';
import { ChevronDown } from 'lucide-react';

const timelineCategories = [
  { id: 'childhood', title: 'ילדות', description: '[פרטים יסופקו על ידי המשפחה]' },
  { id: 'family', title: 'משפחה', description: '[פרטים יסופקו על ידי המשפחה]' },
  { id: 'marriage', title: 'נישואין', description: '[פרטים יסופקו על ידי המשפחה]' },
  { id: 'children', title: 'ילדים', description: '[פרטים יסופקו על ידי המשפחה]' },
  { id: 'grandchildren', title: 'נכדים', description: '[פרטים יסופקו על ידי המשפחה]' },
  { id: 'work', title: 'עבודה וקריירה', description: '[פרטים יסופקו על ידי המשפחה]' },
  { id: 'hobbies', title: 'תחביבים ותחומי עניין', description: '[פרטים יסופקו על ידי המשפחה]' },
  { id: 'milestones', title: 'אירועים ואבני דרך', description: '[פרטים יסופקו על ידי המשפחה]' },
];

export default function LifeStoryPage() {
  return (
    <>
      <Navigation />
      <main className="min-h-screen bg-background">
        {/* Header */}
        <section className="bg-linen py-12">
          <div className="container mx-auto px-4">
            <h1 className="text-4xl font-bold text-center mb-4">
              סיפור חייו של אלכס שטרית ז״ל
            </h1>
            <p className="text-center text-gray-700 max-w-2xl mx-auto">
              סיפור חיים עשיר, משפחה אוהבת, קריירה מצליחה ומורשת בלתי נשכחת
            </p>
          </div>
        </section>

        {/* Timeline */}
        <section className="py-12">
          <div className="container mx-auto px-4">
            <div className="max-w-4xl mx-auto">
              <div className="space-y-8">
                {timelineCategories.map((category, index) => (
                  <div
                    key={category.id}
                    className="bg-linen p-6 rounded-lg shadow-md"
                  >
                    <div className="flex items-start gap-4">
                      {/* Timeline dot */}
                      <div className="flex flex-col items-center">
                        <div className="w-4 h-4 bg-sand rounded-full" />
                        {index < timelineCategories.length - 1 && (
                          <div className="w-0.5 h-full bg-sand/30 mt-2" style={{ minHeight: '60px' }} />
                        )}
                      </div>

                      {/* Content */}
                      <div className="flex-1 pb-4">
                        <h2 className="text-2xl font-bold mb-3">{category.title}</h2>
                        <div className="prose prose-lg">
                          <p className="text-gray-700 italic">{category.description}</p>
                          
                          {/* Placeholder for photos */}
                          <div className="mt-4 p-4 bg-background rounded-lg border-2 border-dashed border-sand/30">
                            <p className="text-sm text-gray-600 text-center">
                              תמונות ותיעוד יתווספו כאן על ידי המשפחה
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Admin Note */}
              <div className="mt-12 p-6 bg-blue-50 border-2 border-blue-200 rounded-lg">
                <h3 className="font-semibold mb-2 text-blue-900">הערה למנהלים</h3>
                <p className="text-sm text-blue-800">
                  כל הפרקים לעיל ניתנים לעריכה מלאה דרך אזור הניהול.
                  ניתן להוסיף תוכן עשיר, תמונות, תאריכים וסיפורים מפורטים לכל קטגוריה.
                  הקטגוריות ניתנות להרחבה, לשינוי סדר ולהסתרה לפי הצורך.
                </p>
              </div>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
