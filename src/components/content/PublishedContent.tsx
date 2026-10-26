'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { BookOpen, ChevronLeft, ChevronRight, Heart, ImageIcon, Lightbulb, MessageCircle, User } from 'lucide-react';
import UploadIndicator from '@/components/admin/UploadIndicator';
import { EditableText, useIsAdmin } from '@/components/edit/EditableText';
import {
  HOME_CAROUSEL_ALBUM,
  defaultAlbums,
  defaultHome,
  defaultLifeChapters,
  defaultLegacySections,
  deleteMedia,
  listApprovedMedia,
  listStories,
  loadHome,
  loadPublishedAlbums,
  loadPublishedLegacy,
  loadPublishedLifeChapters,
  saveAlbums,
  saveHome,
  saveLegacySections,
  saveLifeChapters,
  updateStoryText,
  uploadMediaFile,
  type Album,
  type LegacySection,
  type LifeChapter,
  type MediaAsset,
  type Story,
} from '@/lib/firebase/cms';

const legacyIcons = {
  values: Heart,
  sayings: MessageCircle,
  advice: Lightbulb,
  traditions: BookOpen,
};

export function HomeCarousel() {
  const isAdmin = useIsAdmin();
  const [slides, setSlides] = useState<MediaAsset[]>([]);
  const [index, setIndex] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  async function refresh() {
    const media = await listApprovedMedia();
    const homeSlides = media
      .filter((item) => item.albumId === HOME_CAROUSEL_ALBUM && item.fileType === 'image')
      .sort((a, b) => a.createdAt.localeCompare(b.createdAt));
    if (homeSlides.length === 0) {
      const home = await loadHome();
      if (home.portraitUrl) {
        setSlides([
          {
            id: 'portrait',
            albumId: HOME_CAROUSEL_ALBUM,
            url: home.portraitUrl,
            storagePath: '',
            caption: '',
            fileType: 'image',
            approvalStatus: 'approved',
            createdAt: '',
          },
        ]);
        return;
      }
    }
    setSlides(homeSlides);
    setIndex((current) => Math.min(current, Math.max(homeSlides.length - 1, 0)));
  }

  useEffect(() => {
    refresh().catch((loadError) => console.error(loadError));
  }, []);

  useEffect(() => {
    if (slides.length < 2) return;
    const timer = window.setInterval(() => {
      setIndex((current) => (current + 1) % slides.length);
    }, 5000);
    return () => window.clearInterval(timer);
  }, [slides.length]);

  async function addImages(event: React.ChangeEvent<HTMLInputElement>) {
    const files = Array.from(event.target.files ?? []);
    event.target.value = '';
    if (files.length === 0) return;
    setBusy(true);
    setError(null);
    try {
      for (const file of files) {
        await uploadMediaFile(HOME_CAROUSEL_ALBUM, file);
      }
      await refresh();
    } catch (uploadError) {
      setError(uploadError instanceof Error ? uploadError.message : 'העלאת התמונה נכשלה');
    } finally {
      setBusy(false);
    }
  }

  async function removeCurrent() {
    const slide = slides[index];
    if (!slide || slide.id === 'portrait') return;
    setBusy(true);
    try {
      await deleteMedia(slide);
      await refresh();
    } catch {
      setError('מחיקת התמונה נכשלה');
    } finally {
      setBusy(false);
    }
  }

  const slide = slides[index];

  return (
    <div className="w-full max-w-xl">
      <div className="relative aspect-[4/3] overflow-hidden rounded-lg bg-sand/20 shadow-lg">
        {busy && <UploadIndicator overlay label="מעלה את התמונה..." />}
        {slide ? (
          <img src={slide.url} alt={slide.caption || 'תמונה ראשית'} className="h-full w-full object-cover" />
        ) : (
          <div className="flex h-full items-center justify-center px-8 text-center text-sand">
            תמונות יופיעו כאן
            <br />
            אחרי העלאה על ידי המשפחה
          </div>
        )}
        {slides.length > 1 && (
          <>
            <button type="button" aria-label="תמונה קודמת" onClick={() => setIndex((current) => (current - 1 + slides.length) % slides.length)} className="absolute right-3 top-1/2 -translate-y-1/2 rounded-full bg-white/80 p-2">
              <ChevronRight size={20} />
            </button>
            <button type="button" aria-label="תמונה הבאה" onClick={() => setIndex((current) => (current + 1) % slides.length)} className="absolute left-3 top-1/2 -translate-y-1/2 rounded-full bg-white/80 p-2">
              <ChevronLeft size={20} />
            </button>
            <div className="absolute bottom-3 left-0 right-0 flex justify-center gap-2">
              {slides.map((item, dot) => (
                <button key={item.id} type="button" aria-label={`תמונה ${dot + 1}`} onClick={() => setIndex(dot)} className={`h-2.5 w-2.5 rounded-full ${dot === index ? 'bg-white' : 'bg-white/50'}`} />
              ))}
            </div>
          </>
        )}
      </div>
      {isAdmin && (
        <div className="mt-3 flex flex-wrap items-center gap-3 text-sm">
          <label className="cursor-pointer rounded-lg bg-sand px-4 py-2 text-white">
            {busy ? 'מעלה...' : 'הוספת תמונות'}
            <input type="file" accept="image/*" multiple className="hidden" onChange={addImages} disabled={busy} />
          </label>
          {slide && slide.id !== 'portrait' && (
            <button type="button" onClick={removeCurrent} className="text-red-700">
              הסרת התמונה הנוכחית
            </button>
          )}
          {error && <p className="w-full text-red-700">{error}</p>}
        </div>
      )}
    </div>
  );
}

export function HomeQuote() {
  const [home, setHome] = useState(defaultHome);
  useEffect(() => {
    loadHome().then(setHome).catch(() => undefined);
  }, []);
  return (
    <EditableText
      as="blockquote"
      block
      multiline
      className="text-xl italic text-gray-700 mb-6 border-r-4 border-sand pr-4 whitespace-pre-wrap"
      value={home.quote}
      onSave={async (quote) => {
        const next = { ...home, quote };
        await saveHome(next);
        setHome(next);
      }}
    />
  );
}

export function HomeIntro() {
  const [home, setHome] = useState(defaultHome);
  useEffect(() => {
    loadHome().then(setHome).catch(() => undefined);
  }, []);
  return (
    <EditableText
      as="p"
      block
      multiline
      className="text-lg leading-relaxed text-center whitespace-pre-wrap"
      value={home.intro}
      onSave={async (intro) => {
        const next = { ...home, intro };
        await saveHome(next);
        setHome(next);
      }}
    />
  );
}

export function RecentMemories() {
  const [stories, setStories] = useState<Story[]>([]);
  useEffect(() => {
    listStories('approved').then(setStories).catch(() => undefined);
  }, []);
  const latest = stories.slice(0, 3);

  if (latest.length === 0) {
    return (
      <div className="bg-background p-6 rounded-lg shadow-md text-center">
        <p className="text-gray-600 italic">
          זכרונות שיאושרו על ידי המשפחה יופיעו כאן.
          <br />
          בינתיים, אתם מוזמנים לשתף זיכרון משלכם.
        </p>
        <Link href="/#memories" className="inline-block mt-4 text-sand hover:underline font-medium">
          שיתוף זיכרון ←
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {latest.map((story) => (
        <article key={story.id} className="bg-background p-6 rounded-lg shadow-md">
          <h3 className="text-xl font-semibold mb-1">{story.title}</h3>
          <p className="text-sm text-gray-600 mb-3">
            {story.authorName} · {story.authorRelation}
          </p>
          <EditableText
            as="p"
            block
            multiline
            className="text-gray-700 whitespace-pre-wrap"
            value={story.content}
            onSave={async (content) => {
              await updateStoryText(story.id, { title: story.title, content });
              setStories((current) => current.map((item) => (item.id === story.id ? { ...item, content } : item)));
            }}
          />
        </article>
      ))}
    </div>
  );
}

export function LifeStoryTimeline() {
  const [chapters, setChapters] = useState(defaultLifeChapters);
  useEffect(() => {
    loadPublishedLifeChapters().then(setChapters).catch(() => undefined);
  }, []);

  async function updateChapter(id: string, patch: Partial<LifeChapter>) {
    const next = chapters.map((chapter) => (chapter.id === id ? { ...chapter, ...patch } : chapter));
    await saveLifeChapters(next);
    setChapters(next);
  }

  return (
    <div className="space-y-8">
      {chapters.map((chapter, index) => (
        <div key={chapter.id} className="bg-linen p-6 rounded-lg shadow-md">
          <div className="flex items-start gap-4">
            <div className="flex flex-col items-center">
              <div className="w-4 h-4 bg-sand rounded-full" />
              {index < chapters.length - 1 && <div className="w-0.5 bg-sand/30 mt-2" style={{ minHeight: '60px' }} />}
            </div>
            <div className="flex-1 pb-4">
              <h2 className="text-2xl font-bold mb-3">
                <EditableText value={chapter.title} onSave={(title) => updateChapter(chapter.id, { title })} />
              </h2>
              <EditableText as="p" block multiline className="text-gray-700 whitespace-pre-wrap" value={chapter.body} onSave={(body) => updateChapter(chapter.id, { body })} />
            </div>
          </div>
        </div>
      ))}
      {chapters.length === 0 && <p className="text-center text-gray-600">סיפור החיים יפורסם בקרוב.</p>}
    </div>
  );
}

export function LegacyContent() {
  const [sections, setSections] = useState(defaultLegacySections);
  useEffect(() => {
    loadPublishedLegacy().then(setSections).catch(() => undefined);
  }, []);

  async function updateSection(id: string, patch: Partial<LegacySection>) {
    const next = sections.map((section) => (section.id === id ? { ...section, ...patch } : section));
    await saveLegacySections(next);
    setSections(next);
  }

  return (
    <div className="space-y-8">
      {sections.map((section) => {
        const Icon = legacyIcons[section.id as keyof typeof legacyIcons] ?? BookOpen;
        const card = (
          <>
            <div className="flex items-start gap-4 mb-4">
              <div className="p-3 bg-sand/20 rounded-lg">
                <Icon className="text-sand" size={32} />
              </div>
              <div className="flex-1">
                <h2 className="text-2xl font-bold mb-2">
                  <EditableText value={section.title} onSave={(title) => updateSection(section.id, { title })} />
                </h2>
                <EditableText className="text-gray-600" value={section.description} onSave={(description) => updateSection(section.id, { description })} />
              </div>
            </div>
            <div className={section.kind === 'message' ? '' : 'mr-16 p-6 bg-background rounded-lg'}>
              <EditableText as="p" block multiline className="text-gray-700 whitespace-pre-wrap" value={section.body} onSave={(body) => updateSection(section.id, { body })} />
            </div>
          </>
        );
        if (section.kind === 'message') {
          return (
            <div key={section.id} className="bg-gradient-to-br from-sand/10 to-linen p-8 rounded-lg shadow-lg border-2 border-sand/20 text-center">
              {card}
            </div>
          );
        }
        return (
          <div key={section.id} className="bg-linen p-8 rounded-lg shadow-md">
            {card}
          </div>
        );
      })}
    </div>
  );
}

export function GalleryGrid() {
  const [albums, setAlbums] = useState(defaultAlbums);
  const [media, setMedia] = useState<MediaAsset[]>([]);
  useEffect(() => {
    Promise.all([loadPublishedAlbums(), listApprovedMedia()])
      .then(([nextAlbums, nextMedia]) => {
        setAlbums(nextAlbums);
        setMedia(nextMedia);
      })
      .catch(() => undefined);
  }, []);

  async function updateAlbum(id: string, patch: Partial<Album>) {
    const next = albums.map((album) => (album.id === id ? { ...album, ...patch } : album));
    await saveAlbums(next);
    setAlbums(next);
  }

  if (albums.length === 0) {
    return <p className="text-center text-gray-600">הגלריה תפורסם בקרוב.</p>;
  }

  return (
    <div className="grid md:grid-cols-2 gap-8">
      {albums.map((album) => {
        const items = media.filter((item) => item.albumId === album.id);
        return (
          <article key={album.id} className="bg-linen rounded-lg shadow-md overflow-hidden">
            {items.length === 0 ? (
              <div className="aspect-video bg-sand/20 flex items-center justify-center">
                <ImageIcon className="text-sand" size={64} />
              </div>
            ) : items[0].fileType === 'video' ? (
              <video src={items[0].url} controls className="w-full aspect-video bg-black" />
            ) : (
              <img src={items[0].url} alt={items[0].caption || album.title} className="w-full aspect-video object-cover" />
            )}
            <div className="p-6">
              <h2 className="text-2xl font-bold mb-2">
                <EditableText value={album.title} onSave={(title) => updateAlbum(album.id, { title })} />
              </h2>
              <EditableText as="p" block className="text-gray-700 mb-4" value={album.description} onSave={(description) => updateAlbum(album.id, { description })} />
              {items.length === 0 ? (
                <p className="text-sm text-gray-600 italic">תמונות יתווספו על ידי המשפחה</p>
              ) : (
                <div className="grid grid-cols-3 gap-2">
                  {items.map((item) =>
                    item.fileType === 'video' ? (
                      <video key={item.id} src={item.url} controls className="w-full aspect-square object-cover bg-black" />
                    ) : (
                      <img key={item.id} src={item.url} alt={item.caption || album.title} className="w-full aspect-square object-cover" />
                    )
                  )}
                </div>
              )}
            </div>
          </article>
        );
      })}
    </div>
  );
}

export function PublishedStories() {
  const [stories, setStories] = useState<Story[]>([]);
  useEffect(() => {
    listStories('approved').then(setStories).catch(() => undefined);
  }, []);

  if (stories.length === 0) {
    return (
      <div className="bg-background p-8 rounded-lg shadow-md text-center">
        <User className="mx-auto mb-4 text-sand" size={48} />
        <h3 className="text-xl font-semibold mb-2">עדיין אין זכרונות מאושרים</h3>
        <p className="text-gray-700">
          זכרונות שיאושרו על ידי המשפחה יופיעו כאן.
          <br />
          היו הראשונים לשתף זיכרון!
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {stories.map((story) => (
        <article key={story.id} className="bg-background p-6 rounded-lg shadow-md">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 rounded-full bg-sand/20 flex items-center justify-center flex-shrink-0">
              <User className="text-sand" size={24} />
            </div>
            <div>
              <h3 className="text-xl font-semibold">
                <EditableText
                  value={story.title}
                  onSave={async (title) => {
                    await updateStoryText(story.id, { title, content: story.content });
                    setStories((current) => current.map((item) => (item.id === story.id ? { ...item, title } : item)));
                  }}
                />
              </h3>
              <p className="text-sm text-gray-600 mb-3">
                {story.authorName} · {story.authorRelation}
              </p>
              <EditableText
                as="p"
                block
                multiline
                className="text-gray-700 leading-relaxed whitespace-pre-wrap"
                value={story.content}
                onSave={async (content) => {
                  await updateStoryText(story.id, { title: story.title, content });
                  setStories((current) => current.map((item) => (item.id === story.id ? { ...item, content } : item)));
                }}
              />
            </div>
          </div>
        </article>
      ))}
    </div>
  );
}
