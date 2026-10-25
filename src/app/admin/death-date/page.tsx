'use client';

import { useAdminAuth } from '@/hooks/useAdminAuth';
import Navigation from '@/components/Navigation';
import Footer from '@/components/Footer';
import DeathDateVerification from '@/components/admin/DeathDateVerification';
import AdminSignIn from '@/components/admin/AdminSignIn';
import { Shield } from 'lucide-react';

export default function DeathDateAdminPage() {
  const { loading, authorized } = useAdminAuth('super_admin');

  if (loading) {
    return (
      <>
        <Navigation />
        <main className="min-h-screen bg-background py-12">
          <div className="container mx-auto px-4 text-center">
            <p className="text-xl">בודק הרשאות...</p>
          </div>
        </main>
        <Footer />
      </>
    );
  }

  if (!authorized) {
    return (
      <>
        <Navigation />
        <main className="min-h-screen bg-background py-12">
          <div className="container mx-auto px-4">
            <div className="max-w-2xl mx-auto">
              <AdminSignIn
                title="נדרשת הרשאת Super Admin"
                message="דף זה מיועד למנהלי-על בלבד. רק Super Admin יכול לאמת תאריכים עבריים."
              />
            </div>
          </div>
        </main>
        <Footer />
      </>
    );
  }

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
