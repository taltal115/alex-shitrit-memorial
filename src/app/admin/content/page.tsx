'use client';

import { useEffect, useState } from 'react';
import AdminShell from '@/components/admin/AdminShell';
import UploadIndicator from '@/components/admin/UploadIndicator';
import {
  defaultHome,
  defaultLegacySections,
  defaultLifeChapters,
  deleteLegacySection,
  deleteLifeChapter,
  isSectionCustomized,
  listLegacySections,
  listLifeChapters,
  loadHome,
  saveHome,
  saveLegacySection,
  saveLifeChapter,
  storageErrorMessage,
  uploadPortrait,
  type HomeContent,
  type LegacySection,
  type LifeChapter,
} from '@/lib/firebase/cms';

const inputClass =
  'w-full px-4 py-2 rounded-lg border border-sand/30 focus:border-sand focus:ring-2 focus:ring-sand/20 outline-none';

function ContentEditor() {
  const [home, setHome] = useState<HomeContent>(defaultHome);
  const [chapters, setChapters] = useState<LifeChapter[]>([]);
  const [sections, setSections] = useState<LegacySection[]>([]);
  const [savedChapters, setSavedChapters] = useState<string[]>([]);
  const [savedSections, setSavedSections] = useState<string[]>([]);
  const [chapterCustom, setChapterCustom] = useState(false);
  const [legacyCustom, setLegacyCustom] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [uploadingPortrait, setUploadingPortrait] = useState(false);

  useEffect(() => {
    async function load() {
      const [nextHome, lifeCustom, legacyFlag, remoteChapters, remoteSections] = await Promise.all([
        loadHome(),
        isSectionCustomized('lifeStory'),
        isSectionCustomized('legacy'),
        listLifeChapters(),
        listLegacySections(),
      ]);
      setHome(nextHome);
      setChapterCustom(lifeCustom);
      setLegacyCustom(legacyFlag);
      setChapters(lifeCustom ? remoteChapters : defaultLifeChapters.map((item) => ({ ...item })));
      setSections(legacyFlag ? remoteSections : defaultLegacySections.map((item) => ({ ...item })));
      setSavedChapters(lifeCustom ? remoteChapters.map((item) => item.id) : []);
      setSavedSections(legacyFlag ? remoteSections.map((item) => item.id) : []);
    }
    load().catch(() => setError('שגיאה בטעינת התוכן'));
  }, []);

  async function onSaveHome(event: React.FormEvent) {
    event.preventDefault();
    setBusy(true);
    setError(null);
    setMessage(null);
    try {
      await saveHome(home);
      setMessage('דף הבית נשמר');
    } catch {
      setError('שמירת דף הבית נכשלה');
    } finally {
      setBusy(false);
    }
  }

  async function onPortrait(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    event.target.value = '';
    if (!file) return;
    setUploadingPortrait(true);
    setError(null);
    try {
      const portraitUrl = await uploadPortrait(file);
      const next = { ...home, portraitUrl };
      setHome(next);
      await saveHome(next);
      setMessage('תמונת הפורטרט נשמרה');
    } catch (uploadError) {
      setError(
        storageErrorMessage(uploadError) ??
          (uploadError instanceof Error ? uploadError.message : 'העלאת התמונה נכשלה')
      );
    } finally {
      setUploadingPortrait(false);
    }
  }

  function patchChapter(id: string, patch: Partial<LifeChapter>) {
    setChapters((current) => current.map((item) => (item.id === id ? { ...item, ...patch } : item)));
  }

  function patchSection(id: string, patch: Partial<LegacySection>) {
    setSections((current) => current.map((item) => (item.id === id ? { ...item, ...patch } : item)));
  }

  async function persistChapters(items: LifeChapter[]) {
    for (const chapter of items) {
      await saveLifeChapter(chapter);
    }
    setSavedChapters(items.map((item) => item.id));
    setChapterCustom(true);
  }

  async function persistSections(items: LegacySection[]) {
    for (const section of items) {
      await saveLegacySection(section);
    }
    setSavedSections(items.map((item) => item.id));
    setLegacyCustom(true);
  }

  async function saveAllChapters() {
    setBusy(true);
    setError(null);
    try {
      await persistChapters(chapters);
      setMessage('סיפור החיים נשמר');
    } catch {
      setError('שמירת סיפור החיים נכשלה');
    } finally {
      setBusy(false);
    }
  }

  async function saveAllSections() {
    setBusy(true);
    setError(null);
    try {
      await persistSections(sections);
      setMessage('דף המורשת נשמר');
    } catch {
      setError('שמירת המורשת נכשלה');
    } finally {
      setBusy(false);
    }
  }

  async function removeChapter(chapter: LifeChapter) {
    setChapters((current) => current.filter((item) => item.id !== chapter.id));
    if (!savedChapters.includes(chapter.id)) return;
    await deleteLifeChapter(chapter.id);
    setSavedChapters((current) => current.filter((id) => id !== chapter.id));
  }

  async function removeSection(section: LegacySection) {
    setSections((current) => current.filter((item) => item.id !== section.id));
    if (!savedSections.includes(section.id)) return;
    await deleteLegacySection(section.id);
    setSavedSections((current) => current.filter((id) => id !== section.id));
  }

  return (
    <div className="space-y-10">
      {message && <p className="text-green-800">{message}</p>}
      {error && <p className="text-red-700">{error}</p>}

      <form onSubmit={onSaveHome} className="bg-linen p-6 rounded-lg space-y-4">
        <h2 className="text-2xl font-semibold">דף הבית</h2>
        {home.portraitUrl && (
          <img src={home.portraitUrl} alt="פורטרט" className="w-40 h-40 object-cover rounded-lg" />
        )}
        <label className="block text-sm">
          העלאת פורטרט
          <input type="file" accept="image/*" onChange={onPortrait} disabled={uploadingPortrait} className="block mt-2" />
        </label>
        {uploadingPortrait && <UploadIndicator label="מעלה את התמונה..." />}
        <label className="block">
          <span className="block text-sm font-medium mb-2">ציטוט</span>
          <textarea rows={3} value={home.quote} onChange={(event) => setHome({ ...home, quote: event.target.value })} className={inputClass} />
        </label>
        <label className="block">
          <span className="block text-sm font-medium mb-2">הקדמה</span>
          <textarea rows={5} value={home.intro} onChange={(event) => setHome({ ...home, intro: event.target.value })} className={inputClass} />
        </label>
        <button type="submit" disabled={busy} className="bg-sand text-white px-5 py-2 rounded-lg disabled:opacity-50">
          שמירת דף הבית
        </button>
      </form>

      <section className="space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h2 className="text-2xl font-semibold">סיפור החיים</h2>
          <button type="button" onClick={saveAllChapters} disabled={busy} className="bg-sand text-white px-5 py-2 rounded-lg disabled:opacity-50">
            שמירת כל הפרקים
          </button>
        </div>
        {!chapterCustom && (
          <p className="text-sm text-gray-600">
            אלה טקסטי הפתיחה. הם יופיעו באתר כמו שהם עד השמירה הראשונה, ואז האתר יציג בדיוק את הפרקים שנשמרו.
          </p>
        )}
        {chapters.map((chapter) => (
          <div key={chapter.id} className="bg-linen p-4 rounded-lg space-y-3">
            <input value={chapter.title} onChange={(event) => patchChapter(chapter.id, { title: event.target.value })} className={inputClass} />
            <textarea rows={4} value={chapter.body} onChange={(event) => patchChapter(chapter.id, { body: event.target.value })} className={inputClass} />
            <label className="flex items-center gap-2 text-sm">
              <input type="checkbox" checked={chapter.published} onChange={(event) => patchChapter(chapter.id, { published: event.target.checked })} />
              מוצג באתר
            </label>
            <button type="button" onClick={() => removeChapter(chapter)} className="text-sm text-red-700">
              מחיקה
            </button>
          </div>
        ))}
        <button
          type="button"
          onClick={() =>
            setChapters((current) => [
              ...current,
              { id: crypto.randomUUID(), title: '', body: '', sortOrder: current.length, published: true },
            ])
          }
          className="border border-sand px-5 py-2 rounded-lg"
        >
          הוספת פרק
        </button>
      </section>

      <section className="space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h2 className="text-2xl font-semibold">מורשת</h2>
          <button type="button" onClick={saveAllSections} disabled={busy} className="bg-sand text-white px-5 py-2 rounded-lg disabled:opacity-50">
            שמירת המורשת
          </button>
        </div>
        {!legacyCustom && (
          <p className="text-sm text-gray-600">השמירה הראשונה מחליפה את טקסט הפתיחה בדף המורשת.</p>
        )}
        {sections.map((section) => (
          <div key={section.id} className="bg-linen p-4 rounded-lg space-y-3">
            <input value={section.title} onChange={(event) => patchSection(section.id, { title: event.target.value })} className={inputClass} />
            <input value={section.description} onChange={(event) => patchSection(section.id, { description: event.target.value })} placeholder="תיאור קצר" className={inputClass} />
            <textarea rows={4} value={section.body} onChange={(event) => patchSection(section.id, { body: event.target.value })} className={inputClass} />
            <label className="flex items-center gap-2 text-sm">
              <input type="checkbox" checked={section.published} onChange={(event) => patchSection(section.id, { published: event.target.checked })} />
              מוצג באתר
            </label>
            <button type="button" onClick={() => removeSection(section)} className="text-sm text-red-700">
              מחיקה
            </button>
          </div>
        ))}
        <button
          type="button"
          onClick={() =>
            setSections((current) => [
              ...current,
              {
                id: crypto.randomUUID(),
                title: '',
                description: '',
                body: '',
                sortOrder: current.length,
                published: true,
                kind: 'section',
              },
            ])
          }
          className="border border-sand px-5 py-2 rounded-lg"
        >
          הוספת קטגוריה
        </button>
      </section>
    </div>
  );
}

export default function ContentAdminPage() {
  return (
    <AdminShell title="ניהול תוכן" description="דף הבית, סיפור החיים והמורשת">
      <ContentEditor />
    </AdminShell>
  );
}
