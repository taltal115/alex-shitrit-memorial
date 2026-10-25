import Navigation from '@/components/Navigation';
import Footer from '@/components/Footer';
import { GalleryGrid } from '@/components/content/PublishedContent';

export default function GalleryPage() {
  return (
    <>
      <Navigation />
      <main className="min-h-screen bg-background">
        {/* Header */}
        <section className="bg-linen py-12">
          <div className="container mx-auto px-4">
            <h1 className="text-4xl font-bold text-center mb-4">
              גלריית תמונות
            </h1>
            <p className="text-center text-gray-700 max-w-2xl mx-auto">
              אוסף תמונות מחיי המשפחה, אירועים וזכרונות יקרים
            </p>
          </div>
        </section>

        {/* Albums */}
        <section className="py-12">
          <div className="container mx-auto px-4">
            <div className="max-w-5xl mx-auto">
              <GalleryGrid />
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
