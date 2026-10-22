import Navigation from '@/components/Navigation';
import Footer from '@/components/Footer';
import DeathDateVerification from '@/components/admin/DeathDateVerification';
import { Shield } from 'lucide-react';

export const metadata = {
  title: 'אימות תאריך עברי - ניהול - אלכס שטרית',
  description: 'אימות התאריך העברי לפטירה',
};

export default function DeathDateAdminPage() {
  return (
    <>
      <Navigation />
      <main className="min-h-screen bg-background">
        {/* Header */}
        <section className="bg-linen py-12">
          <div className="container mx-auto px-4">
            <div className="flex items-center gap-3 justify-center mb-4">
              <Shield className="text-sand" size={32} />
              <h1 className="text-4xl font-bold text-center">
                אימות התאריך העברי
              </h1>
            </div>
            <p className="text-center text-gray-700 max-w-2xl mx-auto">
              קביעת התאריך העברי המדויק לפי שעת הפטירה ביחס לשקיעה
            </p>
          </div>
        </section>

        {/* Authentication Notice */}
        <section className="py-8">
          <div className="container mx-auto px-4">
            <div className="max-w-2xl mx-auto p-6 bg-amber-50 border-2 border-amber-200 rounded-lg mb-8">
              <h3 className="font-semibold mb-2 text-amber-900 flex items-center gap-2">
                <Shield size={20} />
                דורש הרשאת Super Admin
              </h3>
              <p className="text-sm text-amber-800">
                רק מנהלי-על (Super Admin) יכולים לאמת את התאריך העברי.
                אימות זה משפיע על כל חישובי תאריכי האזכרה.
              </p>
            </div>
          </div>
        </section>

        {/* Verification Component */}
        <section className="py-12">
          <div className="container mx-auto px-4">
            <div className="max-w-4xl mx-auto">
              <DeathDateVerification />
            </div>
          </div>
        </section>

        {/* Impact Notice */}
        <section className="py-8">
          <div className="container mx-auto px-4">
            <div className="max-w-4xl mx-auto p-6 bg-blue-50 border-2 border-blue-200 rounded-lg">
              <h3 className="font-semibold mb-3 text-blue-900">
                השפעת האימות
              </h3>
              <div className="text-sm text-blue-800 space-y-2">
                <p>
                  ✓ לאחר אימות התאריך, כל חישובי האזכרה יתבססו על התאריך המאומת
                </p>
                <p>
                  ✓ התאריך יוצג בכל הדפים (דף הבית, תפילות, וכו')
                </p>
                <p>
                  ✓ הפעולה מתועדת ביומן הפעולות (Audit Log)
                </p>
                <p>
                  ✓ ניתן לשנות את הבחירה בעתיד במידת הצורך
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
