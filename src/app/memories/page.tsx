'use client';

import { useEffect, useState } from 'react';
import Navigation from '@/components/Navigation';
import Footer from '@/components/Footer';
import { PublishedStories } from '@/components/content/PublishedContent';
import { Heart } from 'lucide-react';
import { defaultSettings, loadSettings, submitStory } from '@/lib/firebase/cms';

const inputClass =
  'w-full px-4 py-2 rounded-lg border border-sand/30 focus:border-sand focus:ring-2 focus:ring-sand/20 outline-none';

export default function MemoriesPage() {
  const [authorName, setAuthorName] = useState('');
  const [authorRelation, setAuthorRelation] = useState('');
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [notice, setNotice] = useState(defaultSettings.memoryNotice);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    loadSettings()
      .then((settings) => setNotice(settings.memoryNotice))
      .catch(() => undefined);
  }, []);

  async function onSubmit(event: React.FormEvent) {
    event.preventDefault();
    setBusy(true);
    setError(null);
    setMessage(null);
    try {
      await submitStory({
        authorName: authorName.trim(),
        authorRelation: authorRelation.trim(),
        title: title.trim(),
        content: content.trim(),
      });
      setAuthorName('');
      setAuthorRelation('');
      setTitle('');
      setContent('');
      setMessage('הזיכרון נשלח. הוא יפורסם אחרי אישור המשפחה.');
    } catch {
      setError('שליחת הזיכרון נכשלה. נסו שוב בעוד רגע.');
    } finally {
      setBusy(false);
    }
  }

  return (
    <>
      <Navigation />
      <main className="min-h-screen bg-background">
        <section className="bg-linen py-12">
          <div className="container mx-auto px-4">
            <h1 className="text-4xl font-bold text-center mb-4">זכרונות וסיפורים</h1>
            <p className="text-center text-gray-700 max-w-2xl mx-auto">
              משפחה, חברים ומכרים משתפים זכרונות, סיפורים ורגעים מיוחדים
            </p>
          </div>
        </section>

        <section className="py-12 bg-background">
          <div className="container mx-auto px-4">
            <div className="max-w-3xl mx-auto">
              <form onSubmit={onSubmit} className="bg-linen p-8 rounded-lg shadow-md space-y-6">
                <div className="flex items-center gap-3">
                  <Heart className="text-sand" size={32} />
                  <h2 className="text-2xl font-bold">שתפו זיכרון</h2>
                </div>
                <label className="block">
                  <span className="block text-sm font-medium mb-2">שם מלא</span>
                  <input required value={authorName} onChange={(event) => setAuthorName(event.target.value)} className={inputClass} placeholder="הזינו את שמכם" />
                </label>
                <label className="block">
                  <span className="block text-sm font-medium mb-2">קשר אל המנוח</span>
                  <input required value={authorRelation} onChange={(event) => setAuthorRelation(event.target.value)} className={inputClass} placeholder="לדוגמה: בן, בת, נכד, חבר, עמית..." />
                </label>
                <label className="block">
                  <span className="block text-sm font-medium mb-2">כותרת</span>
                  <input required value={title} onChange={(event) => setTitle(event.target.value)} className={inputClass} placeholder="כותרת קצרה לסיפור" />
                </label>
                <label className="block">
                  <span className="block text-sm font-medium mb-2">הזיכרון או הסיפור</span>
                  <textarea required rows={8} value={content} onChange={(event) => setContent(event.target.value)} className={`${inputClass} resize-y`} placeholder="שתפו זיכרון, סיפור או מחשבה..." />
                </label>
                <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                  <p className="text-sm text-blue-800">{notice}</p>
                </div>
                <button type="submit" disabled={busy} className="w-full bg-sand text-white px-6 py-3 rounded-lg hover:opacity-90 font-medium disabled:opacity-50">
                  {busy ? 'שולח...' : 'שליחת זיכרון'}
                </button>
                {message && <p className="text-green-800 text-center">{message}</p>}
                {error && <p className="text-red-700 text-center">{error}</p>}
              </form>
            </div>
          </div>
        </section>

        <section className="py-12 bg-linen">
          <div className="container mx-auto px-4">
            <h2 className="text-3xl font-bold text-center mb-8">זכרונות שפורסמו</h2>
            <div className="max-w-4xl mx-auto">
              <PublishedStories />
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
