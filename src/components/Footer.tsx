'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import ShareButtons from './ShareButtons';
import { CopyText, EditableText } from '@/components/edit/EditableText';
import { defaultSettings, loadSettings, saveSettings } from '@/lib/firebase/cms';

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
            <h3 className="font-semibold text-gray-700">
              <CopyText id="footer.share" fallback="שיתוף האתר:" />
            </h3>
            <ShareButtons />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* About */}
          <div>
            <h3 className="font-semibold mb-3">
              <CopyText id="footer.aboutTitle" fallback="אודות" />
            </h3>
            <EditableText
              as="p"
              block
              multiline
              className="text-sm text-gray-700"
              value={aboutText}
              onSave={async (about) => {
                const settings = await loadSettings();
                await saveSettings({ ...settings, aboutText: about });
                setAboutText(about);
              }}
            />
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="font-semibold mb-3">
              <CopyText id="footer.links" fallback="קישורים" />
            </h3>
            <ul className="space-y-2 text-sm">
              <li>
                <Link href="/#prayers" className="hover:text-sand">
                  <CopyText id="footer.prayers" fallback="תפילות ואזכרה" />
                </Link>
              </li>
              <li>
                <Link href="/#memories" className="hover:text-sand">
                  <CopyText id="footer.memories" fallback="שיתוף זיכרון" />
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
            <h3 className="font-semibold mb-3">
              <CopyText id="footer.contactTitle" fallback="פרטיות ויצירת קשר" />
            </h3>
            <EditableText
              as="p"
              block
              multiline
              className="text-sm text-gray-700"
              value={contactText}
              onSave={async (contact) => {
                const settings = await loadSettings();
                await saveSettings({ ...settings, contactText: contact });
                setContactText(contact);
              }}
            />
            <div className="mt-4">
              <EditableText
                as="p"
                block
                multiline
                className="text-xs text-gray-600"
                value={privacyText}
                onSave={async (privacy) => {
                  const settings = await loadSettings();
                  await saveSettings({ ...settings, privacyText: privacy });
                  setPrivacyText(privacy);
                }}
              />
            </div>
          </div>
        </div>

        <div className="mt-8 pt-6 border-t border-sand/20 text-center text-sm text-gray-600">
          <p>
            © {currentYear}{' '}
            <CopyText id="footer.copyright" fallback="אתר ההנצחה של אלכס שטרית. כל הזכויות שמורות למשפחה." />
          </p>
        </div>
      </div>
    </footer>
  );
}
