'use client';

import Link from 'next/link';
import { useAdminAuth } from '@/hooks/useAdminAuth';
import Navigation from '@/components/Navigation';
import Footer from '@/components/Footer';
import AdminSignIn from '@/components/admin/AdminSignIn';
import { signOutAdmin } from '@/lib/firebase/auth';
import { 
  User, 
  FileText, 
  Image, 
  MessageSquare, 
  Calendar, 
  Settings, 
  Shield,
  Download
} from 'lucide-react';

const adminSections: Array<{
  id: string;
  icon: typeof User;
  title: string;
  description: string;
  href: string;
}> = [
  {
    id: 'users',
    icon: User,
    title: 'ניהול משתמשים',
    description: 'הרשאות, תפקידים ואישורי גישה',
    href: '/admin/users',
  },
  {
    id: 'content',
    icon: FileText,
    title: 'ניהול תוכן',
    description: 'עריכת דף הבית, סיפור חיים ומורשת',
    href: '/admin/content',
  },
  {
    id: 'media',
    icon: Image,
    title: 'גלריה ומדיה',
    description: 'אלבומים, תמונות וסרטונים',
    href: '/admin/media',
  },
  {
    id: 'stories',
    icon: MessageSquare,
    title: 'אישור זכרונות',
    description: 'בדיקה ואישור סיפורים שהוגשו',
    href: '/admin/stories',
  },
  {
    id: 'prayers',
    icon: Calendar,
    title: 'תפילות ואזכרה',
    description: 'ניהול תפילות, תאריך אזכרה ושעות אירוע',
    href: '/admin/prayers',
  },
  {
    id: 'death-date',
    icon: Calendar,
    title: 'תאריך פטירה',
    description: 'אימות התאריך העברי לפי השקיעה',
    href: '/admin/death-date',
  },
  {
    id: 'settings',
    icon: Settings,
    title: 'הגדרות כלליות',
    description: 'הגדרות אתר, פרטיות וגיבויים',
    href: '/admin/settings',
  },
  {
    id: 'audit',
    icon: Shield,
    title: 'יומן פעולות',
    description: 'מעקב אחר שינויים ופעולות מנהלים',
    href: '/admin/audit',
  },
  {
    id: 'backup',
    icon: Download,
    title: 'גיבוי וייצוא',
    description: 'יצירת גיבוי מלא של התכנים והמדיה',
    href: '/admin/backup',
  },
];

export default function AdminPage() {
  const { loading, authorized, email } = useAdminAuth();

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
            {email && (
              <div className="mt-4 flex items-center justify-center gap-4 text-sm text-gray-600">
                <span>מחובר כ-{email}</span>
                <button type="button" onClick={() => signOutAdmin()} className="text-sand hover:underline">
                  יציאה
                </button>
              </div>
            )}
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
                  return (
                    <Link
                      key={section.id}
                      href={section.href}
                      className="bg-linen p-6 rounded-lg shadow-md hover:shadow-lg transition-shadow"
                    >
                      <div className="flex items-start gap-4">
                        <div className="p-3 bg-sand/20 rounded-lg">
                          <Icon className="text-sand" size={24} />
                        </div>
                        <div className="flex-1">
                          <h3 className="text-lg font-semibold mb-1">{section.title}</h3>
                          <p className="text-sm text-gray-600">{section.description}</p>
                        </div>
                      </div>
                    </Link>
                  );
                })}
              </div>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
