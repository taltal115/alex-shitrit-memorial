'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { BookOpen, Heart, ImageIcon, Lightbulb, MessageCircle, User } from 'lucide-react';
import {
  defaultAlbums,
  defaultHome,
  defaultLifeChapters,
  defaultLegacySections,
  listApprovedMedia,
  listStories,
  loadHome,
  loadPublishedAlbums,
  loadPublishedLegacy,
  loadPublishedLifeChapters,
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

function useAsync<T>(loader: () => Promise<T>, initial: T): T {
  const [value, setValue] = useState(initial);
  useEffect(() => {
    let active = true;
    loader()
      .then((next) => {
        if (active) setValue(next);
      })
      .catch((error) => console.error(error));
    return () => {
      active = false;
    };
    // The loader reads published content once when the section appears.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  return value;
}

export function HomePortrait() {
  const home = useAsync(loadHome, defaultHome);
  if (!home.portraitUrl) {
    return (
      <div className="relative w-64 h-64 md:w-80 md:h-80 bg-sand/20 rounded-lg shadow-lg flex items-center justify-center">
        <p className="text-center text-sand px-8">
          תמונת פורטרט
          <br />
          יסופקו על ידי המשפחה
        </p>
      </div>
    );
  }

  return (
    <img
      src={home.portraitUrl}
      alt="אלכס שטרית"
      className="w-64 h-64 md:w-80 md:h-80 object-cover rounded-lg shadow-lg"
    />
  );
}

export function HomeQuote() {
  const loaded = useAsync(loadHome, defaultHome);
  return (
    <blockquote className="text-xl italic text-gray-700 mb-6 border-r-4 border-sand pr-4 whitespace-pre-wrap">
      {loaded.quote}
    </blockquote>
  );
}

export function HomeIntro() {
  const home = useAsync(loadHome, defaultHome);
  return <p className="text-lg leading-relaxed text-center whitespace-pre-wrap">{home.intro}</p>;
}

export function RecentMemories() {
  const stories = useAsync(() => listStories('approved'), [] as Story[]);
  const latest = stories.slice(0, 3);

  if (latest.length === 0) {
    return (
      <div className="bg-background p-6 rounded-lg shadow-md text-center">
        <p className="text-gray-600 italic">
          זכרונות שיאושרו על ידי המשפחה יופיעו כאן.
          <br />
          בינתיים, אתם מוזמנים לשתף זיכרון משלכם.
        </p>
        <Link href="/memories" className="inline-block mt-4 text-sand hover:underline font-medium">
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
          <p className="text-gray-700 whitespace-pre-wrap">{story.content}</p>
        </article>
      ))}
    </div>
  );
}

export function LifeStoryTimeline() {
  const chapters = useAsync(loadPublishedLifeChapters, defaultLifeChapters);
  return (
    <div className="space-y-8">
      {chapters.map((chapter, index) => (
        <ChapterCard key={chapter.id} chapter={chapter} last={index === chapters.length - 1} />
      ))}
      {chapters.length === 0 && <p className="text-center text-gray-600">סיפור החיים יפורסם בקרוב.</p>}
    </div>
  );
}

function ChapterCard({ chapter, last }: { chapter: LifeChapter; last: boolean }) {
  return (
    <div className="bg-linen p-6 rounded-lg shadow-md">
      <div className="flex items-start gap-4">
        <div className="flex flex-col items-center">
          <div className="w-4 h-4 bg-sand rounded-full" />
          {!last && <div className="w-0.5 bg-sand/30 mt-2" style={{ minHeight: '60px' }} />}
        </div>
        <div className="flex-1 pb-4">
          <h2 className="text-2xl font-bold mb-3">{chapter.title}</h2>
          <p className="text-gray-700 whitespace-pre-wrap">{chapter.body}</p>
        </div>
      </div>
    </div>
  );
}

export function LegacyContent() {
  const sections = useAsync(loadPublishedLegacy, defaultLegacySections);
  const regular = sections.filter((section) => section.kind !== 'message');
  const messages = sections.filter((section) => section.kind === 'message');

  return (
    <div className="space-y-8">
      {regular.map((section) => (
        <LegacyCard key={section.id} section={section} />
      ))}
      {messages.map((section) => (
        <div key={section.id} className="bg-gradient-to-br from-sand/10 to-linen p-8 rounded-lg shadow-lg border-2 border-sand/20">
          <h2 className="text-2xl font-bold mb-4 text-center">{section.title}</h2>
          <p className="text-gray-700 text-center whitespace-pre-wrap">{section.body}</p>
        </div>
      ))}
    </div>
  );
}

function LegacyCard({ section }: { section: LegacySection }) {
  const Icon = legacyIcons[section.id as keyof typeof legacyIcons] ?? BookOpen;
  return (
    <div className="bg-linen p-8 rounded-lg shadow-md">
      <div className="flex items-start gap-4 mb-4">
        <div className="p-3 bg-sand/20 rounded-lg">
          <Icon className="text-sand" size={32} />
        </div>
        <div className="flex-1">
          <h2 className="text-2xl font-bold mb-2">{section.title}</h2>
          {section.description && <p className="text-gray-600">{section.description}</p>}
        </div>
      </div>
      <div className="mr-16 p-6 bg-background rounded-lg">
        <p className="text-gray-700 whitespace-pre-wrap">{section.body}</p>
      </div>
    </div>
  );
}

export function GalleryGrid() {
  const albums = useAsync(loadPublishedAlbums, defaultAlbums);
  const media = useAsync(listApprovedMedia, [] as MediaAsset[]);

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
              <h2 className="text-2xl font-bold mb-2">{album.title}</h2>
              <p className="text-gray-700 mb-4">{album.description}</p>
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
  const stories = useAsync(() => listStories('approved'), [] as Story[]);

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
              <h3 className="text-xl font-semibold">{story.title}</h3>
              <p className="text-sm text-gray-600 mb-3">
                {story.authorName} · {story.authorRelation}
              </p>
              <p className="text-gray-700 leading-relaxed whitespace-pre-wrap">{story.content}</p>
            </div>
          </div>
        </article>
      ))}
    </div>
  );
}
