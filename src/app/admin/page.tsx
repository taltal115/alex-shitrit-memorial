'use client';

import Link from 'next/link';
import { useAdminAuth } from '@/hooks/useAdminAuth';
import Navigation from '@/components/Navigation';
import Footer from '@/components/Footer';
import AdminSignIn from '@/components/admin/AdminSignIn';
import { 
  User, 
  FileText, 
  Image, 
  MessageSquare, 
  Calendar, 
  Settings, 
  Shield,
  Database,
  Download
} from 'lucide-react';

const adminSections: Array<{
  id: string;
  icon: typeof User;
  title: string;
  description: string;
  href?: string;
}> = [
  {
    id: 'users',
    icon: User,
    title: 'ניהול משתמשים',
    description: 'הרשאות, תפקידים ואישורי גישה',
  },
  {
    id: 'content',
    icon: FileText,
    title: 'ניהול תוכן',
    description: 'עריכת דף הבית, סיפור חיים ומורשת',
  },
  {
    id: 'media',
    icon: Image,
    title: 'גלריה ומדיה',
    description: 'אלבומים, תמונות וסרטונים',
  },
  {
    id: 'stories',
    icon: MessageSquare,
    title: 'אישור זכרונות',
    description: 'בדיקה ואישור סיפורים שהוגשו',
  },
  {
    id: 'prayers',
    icon: Calendar,
    title: 'תפילות ואזכרה',
    description: 'ניהול תפילות, תאריך אזכרה ושעות אירוע',
    href: '/admin/prayers',
  },
  {
    id: 'settings',
    icon: Settings,
    title: 'הגדרות כלליות',
    description: 'הגדרות אתר, פרטיות וגיבויים',
  },
  {
    id: 'audit',
    icon: Shield,
    title: 'יומן פעולות',
    description: 'מעקב אחר שינויים ופעולות מנהלים',
  },
  {
    id: 'backup',
    icon: Download,
    title: 'גיבוי וייצוא',
    description: 'יצירת גיבוי מלא של התכנים והמדיה',
  },
];

export default function AdminPage() {
  const { loading, authorized } = useAdminAuth();

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
                title="נדרשת הזדהות"
                message="דף זה מיועד למנהלי האתר בלבד. יש להתחבר כדי לגשת לאזור הניהול."
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
            <h1 className="text-4xl font-bold text-center mb-4">
              אזור ניהול
            </h1>
            <p className="text-center text-gray-700 max-w-2xl mx-auto">
              ניהול מקיף של כל תכני האתר והגדרותיו
            </p>
          </div>
        </section>

        {/* Admin Sections Grid */}
        <section className="py-12">
          <div className="container mx-auto px-4">
            <div className="max-w-6xl mx-auto">
              <h2 className="text-2xl font-bold mb-6 text-center">
                כלי ניהול
              </h2>

              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {adminSections.map((section) => {
                  const Icon = section.icon;
                  const className = `bg-linen p-6 rounded-lg shadow-md transition-shadow ${
                    section.href ? 'hover:shadow-lg' : 'cursor-not-allowed opacity-60'
                  }`;
                  const body = (
                    <div className="flex items-start gap-4">
                      <div className="p-3 bg-sand/20 rounded-lg">
                        <Icon className="text-sand" size={24} />
                      </div>
                      <div className="flex-1">
                        <h3 className="text-lg font-semibold mb-1">
                          {section.title}
                        </h3>
                        <p className="text-sm text-gray-600">
                          {section.description}
                        </p>
                      </div>
                    </div>
                  );

                  if (section.href) {
                    return (
                      <Link key={section.id} href={section.href} className={className}>
                        {body}
                      </Link>
                    );
                  }

                  return (
                    <div key={section.id} className={className}>
                      {body}
                    </div>
                  );
                })}
              </div>

              {/* Implementation Notes */}
              <div className="mt-12 p-6 bg-blue-50 border-2 border-blue-200 rounded-lg">
                <h3 className="font-semibold mb-3 text-blue-900">
                  תכונות אזור הניהול (להשלמה)
                </h3>
                <div className="text-sm text-blue-800 space-y-2">
                  <p><strong>✓ ניהול משתמשים:</strong> הוספת מנהלים, שינוי תפקידים, ניהול הרשאות</p>
                  <p><strong>✓ עריכת תוכן:</strong> עורך WYSIWYG לכל הדפים והטקסטים</p>
                  <p><strong>✓ ניהול מדיה:</strong> העלאה, ארגון ואישור של תמונות וסרטונים</p>
                  <p><strong>✓ אישור תכנים:</strong> מערכת workflow לאישור סיפורים ותמונות</p>
                  <p><strong>✓ ניהול תפילות:</strong> עריכת נוסחי תפילות ואימות תאריכים</p>
                  <p><strong>✓ לוח אזכרה:</strong> הזנת שעות אירועים וניהול לוח השנה</p>
                  <p><strong>✓ גיבוי:</strong> ייצוא מלא של DB ומדיה כקובץ ZIP</p>
                  <p><strong>✓ יומן פעולות:</strong> מעקב מלא אחר כל שינוי ופעולה</p>
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
