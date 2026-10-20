import Navigation from '@/components/Navigation';
import Footer from '@/components/Footer';
import { BookOpen, Heart, Lightbulb, MessageCircle } from 'lucide-react';

const legacyCategories = [
  {
    id: 'values',
    icon: Heart,
    title: 'ערכים ועקרונות',
    description: 'העקרונות והערכים שהנחו את חייו',
    content: '[תוכן יסופק על ידי המשפחה]',
  },
  {
    id: 'sayings',
    icon: MessageCircle,
    title: 'אמרות ופתגמים',
    description: 'ביטויים, אמרות ופתגמים שהיו אופייניים',
    content: '[תוכן יסופק על ידי המשפחה]',
  },
  {
    id: 'advice',
    icon: Lightbulb,
    title: 'עצות ותובנות',
    description: 'חוכמת חיים שנצברה לאורך השנים',
    content: '[תוכן יסופק על ידי המשפחה]',
  },
  {
    id: 'traditions',
    icon: BookOpen,
    title: 'מסורות ומנהגים',
    description: 'מסורות משפחתיות ומנהגים שחשוב לשמר',
    content: '[תוכן יסופק על ידי המשפחה]',
  },
];

export default function LegacyPage() {
  return (
    <>
      <Navigation />
      <main className="min-h-screen bg-background">
        {/* Header */}
        <section className="bg-linen py-12">
          <div className="container mx-auto px-4">
            <h1 className="text-4xl font-bold text-center mb-4">
              מורשת ומסרים
            </h1>
            <p className="text-center text-gray-700 max-w-2xl mx-auto">
              ערכים, עצות, מסורות ומסרים שחשוב לשמר ולהעביר הלאה
            </p>
          </div>
        </section>

        {/* Legacy Sections */}
        <section className="py-12">
          <div className="container mx-auto px-4">
            <div className="max-w-4xl mx-auto space-y-8">
              {legacyCategories.map((category) => {
                const Icon = category.icon;
                return (
                  <div
                    key={category.id}
                    className="bg-linen p-8 rounded-lg shadow-md"
                  >
                    <div className="flex items-start gap-4 mb-4">
                      <div className="p-3 bg-sand/20 rounded-lg">
                        <Icon className="text-sand" size={32} />
                      </div>
                      <div className="flex-1">
                        <h2 className="text-2xl font-bold mb-2">{category.title}</h2>
                        <p className="text-gray-600">{category.description}</p>
                      </div>
                    </div>

                    <div className="mr-16 p-6 bg-background rounded-lg">
                      <p className="text-gray-700 italic">{category.content}</p>
                    </div>
                  </div>
                );
              })}

              {/* Messages to Children/Grandchildren */}
              <div className="bg-gradient-to-br from-sand/10 to-linen p-8 rounded-lg shadow-lg border-2 border-sand/20">
                <h2 className="text-2xl font-bold mb-4 text-center">
                  מסרים לילדים ולנכדים
                </h2>
                <div className="prose prose-lg max-w-none">
                  <p className="text-gray-700 italic text-center">
                    [מסרים אישיים, ברכות ועצות לדורות הבאים]
                    <br />
                    <span className="text-sm">(יסופק על ידי המשפחה)</span>
                  </p>
                </div>
              </div>

              {/* Admin Note */}
              <div className="p-6 bg-blue-50 border-2 border-blue-200 rounded-lg">
                <h3 className="font-semibold mb-2 text-blue-900">הערה למנהלים</h3>
                <p className="text-sm text-blue-800">
                  כל תוכן דף המורשת ניתן לעריכה מלאה מאזור הניהול.
                  ניתן להוסיף, לערוך ולארגן את הקטגוריות והתוכן בצורה חופשית.
                  <br /><br />
                  מומלץ לצבור את התוכן בהדרגה, בשיתוף בני המשפחה,
                  כדי ליצור תמונה מלאה ועשירה של המורשת והערכים.
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
