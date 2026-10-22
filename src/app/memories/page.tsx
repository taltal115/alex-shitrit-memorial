import Navigation from '@/components/Navigation';
import Footer from '@/components/Footer';
import { Heart, User } from 'lucide-react';

export default function MemoriesPage() {
  return (
    <>
      <Navigation />
      <main className="min-h-screen bg-background">
        {/* Header */}
        <section className="bg-linen py-12">
          <div className="container mx-auto px-4">
            <h1 className="text-4xl font-bold text-center mb-4">
              זכרונות וסיפורים
            </h1>
            <p className="text-center text-gray-700 max-w-2xl mx-auto">
              משפחה, חברים ומכרים משתפים זכרונות, סיפורים ורגעים מיוחדים
            </p>
          </div>
        </section>

        {/* Share Memory Form */}
        <section className="py-12 bg-background">
          <div className="container mx-auto px-4">
            <div className="max-w-3xl mx-auto">
              <div className="bg-linen p-8 rounded-lg shadow-md">
                <div className="flex items-center gap-3 mb-6">
                  <Heart className="text-sand" size={32} />
                  <h2 className="text-2xl font-bold">שתפו זיכרון</h2>
                </div>

                <form className="space-y-6">
                  {/* Author Name */}
                  <div>
                    <label htmlFor="authorName" className="block text-sm font-medium mb-2">
                      שם מלא
                    </label>
                    <input
                      type="text"
                      id="authorName"
                      className="w-full px-4 py-2 rounded-lg border border-sand/30 focus:border-sand focus:ring-2 focus:ring-sand/20 outline-none"
                      placeholder="הזינו את שמכם"
                      required
                    />
                  </div>

                  {/* Relation */}
                  <div>
                    <label htmlFor="relation" className="block text-sm font-medium mb-2">
                      קשר אל המנוח
                    </label>
                    <input
                      type="text"
                      id="relation"
                      className="w-full px-4 py-2 rounded-lg border border-sand/30 focus:border-sand focus:ring-2 focus:ring-sand/20 outline-none"
                      placeholder="לדוגמה: בן, בת, נכד, חבר, עמית..."
                      required
                    />
                  </div>

                  {/* Title */}
                  <div>
                    <label htmlFor="title" className="block text-sm font-medium mb-2">
                      כותרת
                    </label>
                    <input
                      type="text"
                      id="title"
                      className="w-full px-4 py-2 rounded-lg border border-sand/30 focus:border-sand focus:ring-2 focus:ring-sand/20 outline-none"
                      placeholder="כותרת קצרה לסיפור"
                      required
                    />
                  </div>

                  {/* Story Content */}
                  <div>
                    <label htmlFor="content" className="block text-sm font-medium mb-2">
                      הזיכרון או הסיפור
                    </label>
                    <textarea
                      id="content"
                      rows={8}
                      className="w-full px-4 py-2 rounded-lg border border-sand/30 focus:border-sand focus:ring-2 focus:ring-sand/20 outline-none resize-y"
                      placeholder="שתפו זיכרון, סיפור או מחשבה..."
                      required
                    />
                  </div>

                  {/* Privacy Notice */}
                  <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                    <p className="text-sm text-blue-800">
                      <strong>הערה:</strong> כל הזכרונות והסיפורים עוברים אישור מנהלים לפני הפרסום.
                      המשפחה שומרת לעצמה את הזכות לא לפרסם תכנים שאינם מתאימים.
                    </p>
                  </div>

                  {/* Submit Button */}
                  <div className="flex gap-4">
                    <button
                      type="submit"
                      className="flex-1 bg-sand text-white px-6 py-3 rounded-lg hover:opacity-90 transition-opacity font-medium"
                      disabled
                    >
                      שליחת זיכרון
                    </button>
                  </div>

                  <p className="text-sm text-gray-600 text-center italic">
                    בפעולה זו אינה פעילה בגרסת ה-placeholder.<br />
                    תפעל לאחר הגדרת Supabase ואימות משתמשים.
                  </p>
                </form>
              </div>
            </div>
          </div>
        </section>

        {/* Published Memories */}
        <section className="py-12 bg-linen">
          <div className="container mx-auto px-4">
            <h2 className="text-3xl font-bold text-center mb-8">
              זכרונות שפורסמו
            </h2>

            <div className="max-w-4xl mx-auto space-y-6">
              {/* Placeholder for no memories yet */}
              <div className="bg-background p-8 rounded-lg shadow-md text-center">
                <User className="mx-auto mb-4 text-sand" size={48} />
                <h3 className="text-xl font-semibold mb-2">
                  עדיין אין זכרונות מאושרים
                </h3>
                <p className="text-gray-700">
                  זכרונות שיאושרו על ידי המשפחה יופיעו כאן.
                  <br />
                  היו הראשונים לשתף זיכרון!
                </p>
              </div>

              {/* Example Memory Card (hidden by default, template for approved stories) */}
              <div className="hidden bg-background p-6 rounded-lg shadow-md">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-full bg-sand/20 flex items-center justify-center flex-shrink-0">
                    <User className="text-sand" size={24} />
                  </div>
                  <div className="flex-1">
                    <div className="mb-2">
                      <h3 className="text-xl font-semibold">כותרת הזיכרון</h3>
                      <p className="text-sm text-gray-600">
                        שם המשתף • קשר למנוח • תאריך
                      </p>
                    </div>
                    <p className="text-gray-700 leading-relaxed">
                      תוכן הזיכרון יופיע כאן...
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
