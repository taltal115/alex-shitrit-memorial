import Navigation from '@/components/Navigation';
import Footer from '@/components/Footer';
import { LegacyContent } from '@/components/content/PublishedContent';

export default function LegacyPage() {
  return (
    <>
      <Navigation />
      <main className="min-h-screen bg-background">
        {/* Header */}
        <section className="bg-linen py-12">
          <div className="container mx-auto px-4">
            <h1 className="text-4xl font-bold text-center mb-4">
              מורשת ומסרים
            </h1>
            <p className="text-center text-gray-700 max-w-2xl mx-auto">
              ערכים, עצות, מסורות ומסרים שחשוב לשמר ולהעביר הלאה
            </p>
          </div>
        </section>

        {/* Legacy Sections */}
        <section className="py-12">
          <div className="container mx-auto px-4">
            <div className="max-w-4xl mx-auto">
              <LegacyContent />
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
