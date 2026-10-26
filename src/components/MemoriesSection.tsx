'use client';

import { useEffect, useState } from 'react';
import { Heart } from 'lucide-react';
import { CopyText, EditableText } from '@/components/edit/EditableText';
import { PublishedStories } from '@/components/content/PublishedContent';
import { defaultSettings, loadSettings, saveSettings, submitStory } from '@/lib/firebase/cms';

const inputClass =
  'w-full px-4 py-2 rounded-lg border border-sand/30 focus:border-sand focus:ring-2 focus:ring-sand/20 outline-none';

export default function MemoriesSection() {
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
    <div className="space-y-12">
      <form onSubmit={onSubmit} className="bg-linen p-8 rounded-lg shadow-md space-y-6">
        <div className="flex items-center gap-3">
          <Heart className="text-sand" size={32} />
          <h2 className="text-2xl font-bold">
            <CopyText id="memories.formTitle" fallback="שתפו זיכרון" />
          </h2>
        </div>
        <label className="block">
          <span className="block text-sm font-medium mb-2">
            <CopyText id="memories.nameLabel" fallback="שם מלא" />
          </span>
          <input required value={authorName} onChange={(event) => setAuthorName(event.target.value)} className={inputClass} placeholder="הזינו את שמכם" />
        </label>
        <label className="block">
          <span className="block text-sm font-medium mb-2">
            <CopyText id="memories.relationLabel" fallback="קשר אל המנוח" />
          </span>
          <input required value={authorRelation} onChange={(event) => setAuthorRelation(event.target.value)} className={inputClass} placeholder="לדוגמה: בן, בת, נכד, חבר, עמית..." />
        </label>
        <label className="block">
          <span className="block text-sm font-medium mb-2">
            <CopyText id="memories.titleLabel" fallback="כותרת" />
          </span>
          <input required value={title} onChange={(event) => setTitle(event.target.value)} className={inputClass} placeholder="כותרת קצרה לסיפור" />
        </label>
        <label className="block">
          <span className="block text-sm font-medium mb-2">
            <CopyText id="memories.bodyLabel" fallback="הזיכרון או הסיפור" />
          </span>
          <textarea required rows={8} value={content} onChange={(event) => setContent(event.target.value)} className={`${inputClass} resize-y`} placeholder="שתפו זיכרון, סיפור או מחשבה..." />
        </label>
        <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
          <EditableText
            as="p"
            block
            multiline
            className="text-sm text-blue-800"
            value={notice}
            onSave={async (memoryNotice) => {
              const settings = await loadSettings();
              await saveSettings({ ...settings, memoryNotice });
              setNotice(memoryNotice);
            }}
          />
        </div>
        <button type="submit" disabled={busy} className="w-full bg-sand text-white px-6 py-3 rounded-lg hover:opacity-90 font-medium disabled:opacity-50">
          {busy ? 'שולח...' : 'שליחת זיכרון'}
        </button>
        {message && <p className="text-green-800 text-center">{message}</p>}
        {error && <p className="text-red-700 text-center">{error}</p>}
      </form>

      <div>
        <h2 className="text-3xl font-bold text-center mb-8">
          <CopyText id="memories.publishedTitle" fallback="זכרונות שפורסמו" />
        </h2>
        <PublishedStories />
      </div>
    </div>
  );
}
