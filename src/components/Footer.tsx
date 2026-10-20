import Link from 'next/link';

export default function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-linen mt-16 py-8">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* About */}
          <div>
            <h3 className="font-semibold mb-3">אודות</h3>
            <p className="text-sm text-gray-700">
              אתר הנצחה מקוון לזכרו של אלכס שטרית ז"ל
            </p>
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
            <p className="text-sm text-gray-700">
              לשאלות או לעדכון פרטים, אנא פנו למשפחה.
            </p>
            <p className="text-xs text-gray-600 mt-4">
              כל התכנים באתר מוגנים ומנוהלים על ידי המשפחה.
            </p>
          </div>
        </div>

        <div className="mt-8 pt-6 border-t border-sand/20 text-center text-sm text-gray-600">
          <p>© {currentYear} אתר ההנצחה של אלכס שטרית. כל הזכויות שמורות למשפחה.</p>
        </div>
      </div>
    </footer>
  );
}
