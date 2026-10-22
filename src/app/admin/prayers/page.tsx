'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAdminAuth } from '@/hooks/useAdminAuth';
import Navigation from '@/components/Navigation';
import Footer from '@/components/Footer';
import { sephardiPrayerSections } from '@/data/sephardi-prayers';
import { createClient } from '@/lib/supabase/client';
import { isSupabaseConfigured } from '@/lib/supabase/env';
import { CheckCircle, XCircle, AlertCircle, Edit, ExternalLink, Shield } from 'lucide-react';
import type { Database } from '@/types/database';

const localPrayerSections: PrayerSection[] = sephardiPrayerSections.map((section) => ({
  ...section,
  verified_at: null,
  verified_by: null,
}));

interface PrayerSection {
  id: string;
  section_id: string;
  section_order: number;
  title: string;
  notes: string | null;
  source_url: string | null;
  verses: string[] | null;
  verification_status: 'pending_family_verification' | 'verified' | 'rejected';
  is_verified: boolean;
  verified_at: string | null;
  verified_by: string | null;
}

export default function PrayersAdminPage() {
  const router = useRouter();
  const { loading: authLoading, authorized } = useAdminAuth();
  const [prayerSections, setPrayerSections] = useState<PrayerSection[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [updating, setUpdating] = useState<string | null>(null);
  const [usingLocalPrayers, setUsingLocalPrayers] = useState(false);

  useEffect(() => {
    if (!authLoading && authorized) {
      fetchPrayerSections();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [authLoading, authorized]);

  async function fetchPrayerSections() {
    if (!isSupabaseConfigured()) {
      setPrayerSections(localPrayerSections);
      setUsingLocalPrayers(true);
      setLoading(false);
      return;
    }

    try {
      const supabase = createClient();
      const { data, error: fetchError } = await supabase
        .from('prayer_section')
        .select('*')
        .order('section_order', { ascending: true });

      if (fetchError) {
        console.error('Error fetching prayer sections:', fetchError);
        setError('שגיאה בטעינת תפילות');
        return;
      }

      setUsingLocalPrayers(false);
      setError(null);
      if (data) {
        setPrayerSections(data as PrayerSection[]);
      }
    } catch (err) {
      console.error('Error:', err);
      setError('שגיאה בטעינת תפילות');
    } finally {
      setLoading(false);
    }
  }

  async function updateVerificationStatus(
    sectionId: string,
    newStatus: 'pending_family_verification' | 'verified' | 'rejected'
  ) {
    setUpdating(sectionId);
    try {
      const supabase = createClient();
      
      // Get current user for verified_by
      const { data: { user } } = await supabase.auth.getUser();
      
      type UpdateData = Database['public']['Tables']['prayer_section']['Update'];

      const updateData: UpdateData = {
        verification_status: newStatus,
        is_verified: newStatus === 'verified',
      };

      if (newStatus === 'verified') {
        updateData.verified_at = new Date().toISOString();
        updateData.verified_by = user?.id || null;
      } else {
        // Clear verification fields when resetting or rejecting
        updateData.verified_at = null;
        updateData.verified_by = null;
      }

      const { data, error } = await (supabase
        .from('prayer_section')
        // @ts-expect-error - Supabase auth-helpers type inference issue
        .update(updateData)
        .eq('id', sectionId)
        .select());

      if (error) {
        console.error('Error updating prayer section:', error);
        alert('שגיאה בעדכון סטטוס');
        return;
      }

      // Check if update succeeded (RLS may have blocked it)
      if (!data || data.length === 0) {
        alert('העדכון נחסם. ייתכן שאין לך הרשאות מספיקות.');
        return;
      }

      // Refresh the list
      await fetchPrayerSections();
      alert('סטטוס עודכן בהצלחה');
    } catch (err) {
      console.error('Error:', err);
      alert('שגיאה בעדכון סטטוס');
    } finally {
      setUpdating(null);
    }
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'verified':
        return (
          <span className="inline-flex items-center gap-1 px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm font-medium">
            <CheckCircle size={16} />
            מאומת
          </span>
        );
      case 'rejected':
        return (
          <span className="inline-flex items-center gap-1 px-3 py-1 bg-red-100 text-red-800 rounded-full text-sm font-medium">
            <XCircle size={16} />
            נדחה
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1 px-3 py-1 bg-amber-100 text-amber-800 rounded-full text-sm font-medium">
            <AlertCircle size={16} />
            ממתין לאימות
          </span>
        );
    }
  };

  if (authLoading) {
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
              <div className="bg-amber-50 border-2 border-amber-300 rounded-lg p-8 text-center">
                <Shield className="mx-auto mb-4 text-amber-600" size={48} />
                <h2 className="text-2xl font-bold mb-4 text-amber-900">
                  נדרשת הזדהות
                </h2>
                <p className="text-amber-800 mb-6">
                  דף זה מיועד למנהלי האתר בלבד.
                  <br />
                  יש להתחבר כדי לגשת לניהול תפילות.
                </p>
                <button
                  onClick={() => router.push('/admin')}
                  className="px-6 py-3 bg-sand text-white rounded-lg hover:opacity-90 transition-opacity"
                >
                  חזרה לדף הניהול
                </button>
              </div>
            </div>
          </div>
        </main>
        <Footer />
      </>
    );
  }

  if (loading) {
    return (
      <>
        <Navigation />
        <main className="min-h-screen bg-background py-12">
          <div className="container mx-auto px-4 text-center">
            <p className="text-xl">טוען...</p>
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
              ניהול תפילות
            </h1>
            <p className="text-center text-gray-700 max-w-2xl mx-auto">
              אימות ועריכת נוסחי תפילות לאזכרה
            </p>
          </div>
        </section>

        {/* Auth Notice */}
        <section className="py-8">
          <div className="container mx-auto px-4">
            <div className="max-w-4xl mx-auto p-4 bg-blue-50 border-2 border-blue-200 rounded-lg">
              <p className="text-sm text-blue-800">
                <strong>הערה:</strong> בגרסת ייצור, דף זה יהיה נגיש רק למנהלי האתר לאחר אימות.
                כרגע, לצורכי פיתוח, הדף זמין לצפייה.
              </p>
            </div>
          </div>
        </section>

        {/* Prayer Sections List */}
        <section className="py-8">
          <div className="container mx-auto px-4">
            <div className="max-w-4xl mx-auto space-y-6">
              {usingLocalPrayers && (
                <div className="p-4 bg-amber-50 border-2 border-amber-200 rounded-lg text-amber-900">
                  מוצגים נוסחי התפילה המקומיים. שמירת סטטוס אימות תפעל אחרי חיבור Supabase.
                </div>
              )}

              {error && (
                <div className="p-4 bg-red-50 border-2 border-red-200 rounded-lg text-red-800">
                  {error}
                </div>
              )}

              {prayerSections.map((section) => (
                <div
                  key={section.id}
                  className="bg-white p-6 rounded-lg shadow-md border-2 border-gray-200"
                >
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <span className="text-sm font-medium text-gray-500">
                          #{section.section_order}
                        </span>
                        <h3 className="text-lg font-bold">{section.title}</h3>
                      </div>
                      {getStatusBadge(section.verification_status)}
                    </div>
                  </div>

                  {section.notes && (
                    <div className="mb-4 p-3 bg-gray-50 rounded border border-gray-200">
                      <p className="text-sm text-gray-700">
                        <span className="font-semibold">הערות: </span>
                        {section.notes}
                      </p>
                    </div>
                  )}

                  {section.source_url && (
                    <div className="mb-4">
                      <a
                        href={section.source_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1 text-sm text-sand hover:underline"
                      >
                        <ExternalLink size={14} />
                        מקור בספריא
                      </a>
                    </div>
                  )}

                  <div className="mb-4 text-sm text-gray-600">
                    <strong>מספר פסוקים:</strong> {section.verses?.length || 0}
                  </div>

                  {/* Status Update Buttons */}
                  <div className="flex flex-col sm:flex-row gap-2 sm:gap-3 border-t pt-4">
                    <button
                      onClick={() => updateVerificationStatus(section.id, 'verified')}
                      disabled={usingLocalPrayers || updating === section.id || section.verification_status === 'verified'}
                      className="flex-1 flex items-center justify-center gap-2 px-4 py-2 text-sm sm:text-base bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                      <CheckCircle size={18} />
                      <span className="whitespace-nowrap">{section.verification_status === 'verified' ? 'מאומת' : 'אמת'}</span>
                    </button>
                    
                    <button
                      onClick={() => updateVerificationStatus(section.id, 'pending_family_verification')}
                      disabled={usingLocalPrayers || updating === section.id || section.verification_status === 'pending_family_verification'}
                      className="flex-1 flex items-center justify-center gap-2 px-4 py-2 text-sm sm:text-base bg-amber-600 text-white rounded-lg hover:bg-amber-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                      <AlertCircle size={18} />
                      <span className="whitespace-nowrap">{section.verification_status === 'pending_family_verification' ? 'ממתין' : 'החזר להמתנה'}</span>
                    </button>

                    <button
                      onClick={() => updateVerificationStatus(section.id, 'rejected')}
                      disabled={usingLocalPrayers || updating === section.id || section.verification_status === 'rejected'}
                      className="flex-1 flex items-center justify-center gap-2 px-4 py-2 text-sm sm:text-base bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                      <XCircle size={18} />
                      <span className="whitespace-nowrap">{section.verification_status === 'rejected' ? 'נדחה' : 'דחה'}</span>
                    </button>
                  </div>

                  {section.verified_at && (
                    <div className="mt-3 text-xs text-gray-500">
                      אושר ב: {new Date(section.verified_at).toLocaleString('he-IL')}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Family Verification Checklist */}
        <section className="py-12 bg-linen">
          <div className="container mx-auto px-4">
            <div className="max-w-4xl mx-auto">
              <h2 className="text-2xl font-bold mb-6 text-center">
                רשימת אימות למשפחה
              </h2>
              
              <div className="bg-white p-6 rounded-lg shadow-md">
                <p className="mb-4 font-semibold">נקודות לאימות עם המשפחה:</p>
                <ul className="space-y-2 text-sm">
                  <li className="flex items-start gap-2">
                    <span className="text-amber-600 mt-1">•</span>
                    <span><strong>כתיב השם:</strong> "אלכס יחיה בן פורטונה" - אימות האיות העברי המדויק</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-amber-600 mt-1">•</span>
                    <span><strong>פתיחה:</strong> איזה מזמור נהוג בקהילה - טו, טז, שניהם, או אחר?</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-amber-600 mt-1">•</span>
                    <span><strong>תהילים טו:</strong> בפסוק האחרון חסר רווח בין "לָקָח" ל"עֹשֵׂה" (טעות בניקוד המקור)</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-amber-600 mt-1">•</span>
                    <span><strong>השכבה:</strong> הטקסט המלא אחרי "טוב שם משמן טוב" חסר - נדרש נוסח שלם מהמשפחה</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-amber-600 mt-1">•</span>
                    <span><strong>קדיש:</strong> אימות הנוסח הספרדי המדויק לפי מנהג הקהילה</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-amber-600 mt-1">•</span>
                    <span><strong>כללי:</strong> האם יש פסוקים נוספים או שינויים במנהג המשפחתי?</span>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
