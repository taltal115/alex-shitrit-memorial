'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import ShareButtons from './ShareButtons';
import { defaultSettings, loadSettings } from '@/lib/firebase/cms';

export default function Footer() {
  const currentYear = new Date().getFullYear();
  const [aboutText, setAboutText] = useState(defaultSettings.aboutText);
  const [contactText, setContactText] = useState(defaultSettings.contactText);
  const [privacyText, setPrivacyText] = useState(defaultSettings.privacyText);

  useEffect(() => {
    loadSettings()
      .then((settings) => {
        setAboutText(settings.aboutText);
        setContactText(settings.contactText);
        setPrivacyText(settings.privacyText);
      })
      .catch(() => undefined);
  }, []);

  return (
    <footer className="bg-linen mt-16 py-8">
      <div className="container mx-auto px-4">
        {/* Share Section */}
        <div className="mb-8 pb-6 border-b border-sand/20">
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <h3 className="font-semibold text-gray-700">שיתוף האתר:</h3>
            <ShareButtons />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* About */}
          <div>
            <h3 className="font-semibold mb-3">אודות</h3>
            <p className="text-sm text-gray-700">{aboutText}</p>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="font-semibold mb-3">קישורים</h3>
            <ul className="space-y-2 text-sm">
              <li>
                <Link href="/prayers" className="hover:text-sand">
                  תפילות ואזכרה
                </Link>
              </li>
              <li>
                <Link href="/memories" className="hover:text-sand">
                  שיתוף זיכרון
                </Link>
              </li>
              <li>
                <Link href="/admin" className="hover:text-sand">
                  כניסה למנהלים
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact & Privacy */}
          <div>
            <h3 className="font-semibold mb-3">פרטיות ויצירת קשר</h3>
            <p className="text-sm text-gray-700">{contactText}</p>
            <p className="text-xs text-gray-600 mt-4">{privacyText}</p>
          </div>
        </div>

        <div className="mt-8 pt-6 border-t border-sand/20 text-center text-sm text-gray-600">
          <p>© {currentYear} אתר ההנצחה של אלכס שטרית. כל הזכויות שמורות למשפחה.</p>
        </div>
      </div>
    </footer>
  );
}
