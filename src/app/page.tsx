import Link from 'next/link';
import Image from 'next/image';
import Navigation from '@/components/Navigation';
import Footer from '@/components/Footer';
import YahrzeitCountdown from '@/components/YahrzeitCountdown';
import { BookOpen, Heart, ImageIcon } from 'lucide-react';

export default function HomePage() {
  return (
    <>
      <Navigation />
      <main className="min-h-screen">
        {/* Hero Section */}
        <section className="bg-linen py-16">
          <div className="container mx-auto px-4">
            <div className="grid md:grid-cols-2 gap-12 items-center">
              {/* Portrait */}
              <div className="flex justify-center">
                <div className="relative w-64 h-64 md:w-80 md:h-80 bg-sand/20 rounded-lg shadow-lg flex items-center justify-center">
                  {/* PLACEHOLDER: Family to provide portrait photo */}
                  <p className="text-center text-sand px-8">
                    תמונת פורטרט<br />
                    יסופקו על ידי המשפחה
                  </p>
                </div>
              </div>

              {/* Name and Info */}
              <div className="text-center md:text-right">
                <h1 className="text-3xl md:text-4xl font-bold mb-2 leading-tight">
                  אלכס שטרית בן פורטונה ומכלוף
                </h1>
                <h2 className="text-2xl md:text-3xl text-sand mb-6">
                  ז״ל
                </h2>
                
                {/* Dates */}
                <div className="mb-6 p-4 bg-background/50 rounded-lg">
                  <p className="text-xl font-semibold mb-3">
                    1950 – 2020
                  </p>
                  <p className="text-lg text-gray-700 mb-1">
                    תאריך פטירה עברי:
                  </p>
                  <p className="text-2xl font-bold text-sand mb-2">
                    ט׳ בחשון תשפ״א
                  </p>
                  <p className="text-sm text-gray-600">
                    27 באוקטובר 2020
                  </p>
                </div>

                {/* Quote Placeholder */}
                <blockquote className="text-xl italic text-gray-700 mb-6 border-r-4 border-sand pr-4">
                  ציטוט או פסוק לזכרו<br />
                  <span className="text-sm not-italic">(יסופק על ידי המשפחה)</span>
                </blockquote>

                {/* CTA Buttons */}
                <div className="flex flex-col sm:flex-row gap-4 justify-center md:justify-start">
                  <Link
                    href="/prayers"
                    className="bg-sand text-white px-6 py-3 rounded-lg hover:opacity-90 transition-opacity font-medium"
                  >
                    קריאת תפילות
                  </Link>
                  <Link
                    href="/memories"
                    className="bg-background border-2 border-sand text-text px-6 py-3 rounded-lg hover:bg-linen transition-colors font-medium"
                  >
                    שיתוף זיכרון
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Introduction */}
        <section className="py-12 bg-background">
          <div className="container mx-auto px-4">
            <div className="max-w-3xl mx-auto">
              <p className="text-lg leading-relaxed text-center">
                <span className="italic text-gray-600">
                  [טקסט הקדמה על אלכס - יסופק על ידי המשפחה]
                </span>
              </p>
            </div>
          </div>
        </section>

        {/* Next Yahrzeit Countdown */}
        <YahrzeitCountdown
          hebrewDay={9}
          hebrewMonth="Cheshvan"
          hebrewYear={5781}
          deathYear={2020}
          timezone="Asia/Jerusalem"
        />

        {/* Quick Links */}
        <section className="py-16 bg-background">
          <div className="container mx-auto px-4">
            <h2 className="text-3xl font-bold text-center mb-12">גלה עוד</h2>
            
            <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
              {/* Life Story */}
              <Link
                href="/life-story"
                className="bg-linen p-8 rounded-lg shadow-md hover:shadow-lg transition-shadow text-center group"
              >
                <BookOpen className="mx-auto mb-4 text-sand group-hover:scale-110 transition-transform" size={48} />
                <h3 className="text-xl font-semibold mb-2">סיפור החיים</h3>
                <p className="text-gray-700">
                  הכירו את סיפור חייו, משפחתו, הישגיו ומורשתו
                </p>
              </Link>

              {/* Gallery */}
              <Link
                href="/gallery"
                className="bg-linen p-8 rounded-lg shadow-md hover:shadow-lg transition-shadow text-center group"
              >
                <ImageIcon className="mx-auto mb-4 text-sand group-hover:scale-110 transition-transform" size={48} />
                <h3 className="text-xl font-semibold mb-2">גלריה</h3>
                <p className="text-gray-700">
                  צפו באלבומים ובתמונות מחיי המשפחה
                </p>
              </Link>

              {/* Memories */}
              <Link
                href="/memories"
                className="bg-linen p-8 rounded-lg shadow-md hover:shadow-lg transition-shadow text-center group"
              >
                <Heart className="mx-auto mb-4 text-sand group-hover:scale-110 transition-transform" size={48} />
                <h3 className="text-xl font-semibold mb-2">זכרונות</h3>
                <p className="text-gray-700">
                  קראו ושתפו זכרונות וסיפורים מחייו
                </p>
              </Link>
            </div>
          </div>
        </section>

        {/* Featured Memories Preview */}
        <section className="py-12 bg-linen">
          <div className="container mx-auto px-4">
            <h2 className="text-3xl font-bold text-center mb-8">זכרונות אחרונים</h2>
            
            <div className="max-w-4xl mx-auto">
              <div className="bg-background p-6 rounded-lg shadow-md text-center">
                <p className="text-gray-600 italic">
                  זכרונות שיאושרו על ידי המשפחה יופיעו כאן.<br />
                  בינתיים, אתם מוזמנים לשתף זיכרון משלכם.
                </p>
                <Link
                  href="/memories"
                  className="inline-block mt-4 text-sand hover:underline font-medium"
                >
                  שיתוף זיכרון ←
                </Link>
              </div>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
