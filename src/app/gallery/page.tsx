import Navigation from '@/components/Navigation';
import Footer from '@/components/Footer';
import { ImageIcon } from 'lucide-react';

const albumCategories = [
  { id: 'family', title: 'תמונות משפחתיות', description: 'רגעים משפחתיים מיוחדים' },
  { id: 'events', title: 'אירועים ומועדים', description: 'חגים, שמחות ואירועים' },
  { id: 'travels', title: 'טיולים ונופש', description: 'מסעות וחוויות' },
  { id: 'work', title: 'עבודה וקהילה', description: 'רגעים מהעבודה והפעילות הקהילתית' },
];

export default function GalleryPage() {
  return (
    <>
      <Navigation />
      <main className="min-h-screen bg-background">
        {/* Header */}
        <section className="bg-linen py-12">
          <div className="container mx-auto px-4">
            <h1 className="text-4xl font-bold text-center mb-4">
              גלריית תמונות
            </h1>
            <p className="text-center text-gray-700 max-w-2xl mx-auto">
              אוסף תמונות מחיי המשפחה, אירועים וזכרונות יקרים
            </p>
          </div>
        </section>

        {/* Albums */}
        <section className="py-12">
          <div className="container mx-auto px-4">
            <div className="grid md:grid-cols-2 gap-8 max-w-5xl mx-auto">
              {albumCategories.map((album) => (
                <div
                  key={album.id}
                  className="bg-linen rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow"
                >
                  {/* Album Cover Placeholder */}
                  <div className="aspect-video bg-sand/20 flex items-center justify-center">
                    <ImageIcon className="text-sand" size={64} />
                  </div>

                  {/* Album Info */}
                  <div className="p-6">
                    <h2 className="text-2xl font-bold mb-2">{album.title}</h2>
                    <p className="text-gray-700 mb-4">{album.description}</p>
                    <p className="text-sm text-gray-600 italic">
                      תמונות יתווספו על ידי המשפחה
                    </p>
                  </div>
                </div>
              ))}
            </div>

            {/* Upload Info for Registered Users */}
            <div className="mt-12 max-w-3xl mx-auto p-6 bg-blue-50 border-2 border-blue-200 rounded-lg">
              <h3 className="font-semibold mb-2 text-blue-900">שיתוף תמונות</h3>
              <p className="text-sm text-blue-800 mb-4">
                משתמשים רשומים יכולים להעלות תמונות וסרטונים.
                כל תוכן עובר אישור מנהלים לפני פרסום.
              </p>
              <button
                className="bg-sand text-white px-6 py-2 rounded-lg hover:opacity-90 transition-opacity"
                disabled
              >
                העלאת תמונה (דורש התחברות)
              </button>
            </div>

            {/* Admin Note */}
            <div className="mt-8 max-w-3xl mx-auto p-6 bg-amber-50 border-2 border-amber-200 rounded-lg">
              <h3 className="font-semibold mb-2 text-amber-900">הערה למנהלים</h3>
              <p className="text-sm text-amber-800">
                מאזור הניהול ניתן:
                <br />• ליצור ולנהל אלבומים
                <br />• להעלות תמונות וסרטונים
                <br />• להוסיף כיתובים, תיוג ותאריכים
                <br />• לאשר תמונות שהועלו על ידי משתמשים
                <br />• לארגן ולסדר את התצוגה
              </p>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
