import Navigation from '@/components/Navigation';
import Footer from '@/components/Footer';
import { LifeStoryTimeline } from '@/components/content/PublishedContent';

export default function LifeStoryPage() {
  return (
    <>
      <Navigation />
      <main className="min-h-screen bg-background">
        {/* Header */}
        <section className="bg-linen py-12">
          <div className="container mx-auto px-4">
            <h1 className="text-4xl font-bold text-center mb-4">
              סיפור חייו של אלכס שטרית ז״ל
            </h1>
            <p className="text-center text-gray-700 max-w-2xl mx-auto">
              סיפור חיים עשיר, משפחה אוהבת, קריירה מצליחה ומורשת בלתי נשכחת
            </p>
          </div>
        </section>

        {/* Timeline */}
        <section className="py-12">
          <div className="container mx-auto px-4">
            <div className="max-w-4xl mx-auto">
              <LifeStoryTimeline />
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
