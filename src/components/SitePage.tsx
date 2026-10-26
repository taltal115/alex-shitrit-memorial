'use client';

import { useEffect } from 'react';
import Link from 'next/link';
import { BookOpen, Heart, ImageIcon } from 'lucide-react';
import Navigation, {
  ActiveSectionProvider,
  navigationLinks,
  scrollToSection,
  sectionTop,
  useActiveSection,
} from '@/components/Navigation';
import Footer from '@/components/Footer';
import YahrzeitCountdown from '@/components/YahrzeitCountdown';
import MemoriesSection from '@/components/MemoriesSection';
import PrayersContent from '@/components/PrayersContent';
import { CopyText } from '@/components/edit/EditableText';
import {
  GalleryGrid,
  HomeCarousel,
  HomeIntro,
  HomeQuote,
  LifeStoryTimeline,
  LegacyContent,
  RecentMemories,
} from '@/components/content/PublishedContent';

function ScrollSpy() {
  const section = useActiveSection();
  const setActive = section?.setActive;

  useEffect(() => {
    const update = () => {
      const marker = window.scrollY + 140;
      let current = navigationLinks[0].id;
      for (const link of navigationLinks) {
        if (sectionTop(link.id) <= marker) current = link.id;
      }
      setActive?.(current);
    };

    const hash = window.location.hash.replace('#', '');
    if (hash) scrollToSection(hash);

    update();
    window.addEventListener('scroll', update, { passive: true });
    const nodes = navigationLinks
      .map((link) => document.getElementById(link.id))
      .filter((node): node is HTMLElement => Boolean(node));
    const observer = new IntersectionObserver(update, {
      rootMargin: '-120px 0px -60% 0px',
      threshold: [0, 0.25, 0.5, 1],
    });
    nodes.forEach((node) => observer.observe(node));
    return () => {
      window.removeEventListener('scroll', update);
      observer.disconnect();
    };
  }, [setActive]);

  return null;
}

function HomeSection() {
  return (
    <section id="home" className="scroll-mt-20">
      <div className="bg-linen py-16">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div className="flex justify-center">
              <HomeCarousel />
            </div>
            <div className="text-center md:text-right">
              <h1 className="text-3xl md:text-4xl font-bold mb-2 leading-tight">
                <CopyText id="home.name" fallback="אלכס שטרית בן פורטונה ומכלוף" />
              </h1>
              <h2 className="text-2xl md:text-3xl text-sand mb-6">
                <CopyText id="home.honorific" fallback="ז״ל" />
              </h2>
              <div className="mb-6 p-4 bg-background/50 rounded-lg">
                <p className="text-xl font-semibold mb-3">
                  <CopyText id="home.years" fallback="1950 – 2020" />
                </p>
                <p className="text-lg text-gray-700 mb-1">
                  <CopyText id="home.deathLabel" fallback="תאריך פטירה עברי:" />
                </p>
                <p className="text-2xl font-bold text-sand mb-2">
                  <CopyText id="home.hebrewDate" fallback="ט׳ בחשון תשפ״א" />
                </p>
                <p className="text-sm text-gray-600">
                  <CopyText id="home.gregorianDate" fallback="27 באוקטובר 2020" />
                </p>
              </div>
              <HomeQuote />
              <div className="flex flex-col sm:flex-row gap-4 justify-center md:justify-start">
                <Link href="/#prayers" className="bg-sand text-white px-6 py-3 rounded-lg hover:opacity-90 transition-opacity font-medium">
                  <CopyText id="home.prayersButton" fallback="קריאת תפילות" />
                </Link>
                <Link href="/#memories" className="bg-background border-2 border-sand text-text px-6 py-3 rounded-lg hover:bg-linen transition-colors font-medium">
                  <CopyText id="home.memoriesButton" fallback="שיתוף זיכרון" />
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="py-12 bg-background">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto">
            <HomeIntro />
          </div>
        </div>
      </div>

      <YahrzeitCountdown hebrewDay={9} hebrewMonth="Cheshvan" hebrewYear={5781} deathYear={2020} timezone="Asia/Jerusalem" />

      <div className="py-16 bg-background">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-12">
            <CopyText id="home.discover" fallback="גלה עוד" />
          </h2>
          <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            <a href="#life-story" className="bg-linen p-8 rounded-lg shadow-md hover:shadow-lg transition-shadow text-center">
              <BookOpen className="mx-auto mb-4 text-sand" size={48} />
              <h3 className="text-xl font-semibold mb-2">
                <CopyText id="home.lifeCardTitle" fallback="סיפור החיים" />
              </h3>
              <p className="text-gray-700">
                <CopyText id="home.lifeCardBody" fallback="הכירו את סיפור חייו, משפחתו, הישגיו ומורשתו" />
              </p>
            </a>
            <a href="#gallery" className="bg-linen p-8 rounded-lg shadow-md hover:shadow-lg transition-shadow text-center">
              <ImageIcon className="mx-auto mb-4 text-sand" size={48} />
              <h3 className="text-xl font-semibold mb-2">
                <CopyText id="home.galleryCardTitle" fallback="גלריה" />
              </h3>
              <p className="text-gray-700">
                <CopyText id="home.galleryCardBody" fallback="צפו באלבומים ובתמונות מחיי המשפחה" />
              </p>
            </a>
            <a href="#memories" className="bg-linen p-8 rounded-lg shadow-md hover:shadow-lg transition-shadow text-center">
              <Heart className="mx-auto mb-4 text-sand" size={48} />
              <h3 className="text-xl font-semibold mb-2">
                <CopyText id="home.memoriesCardTitle" fallback="זכרונות" />
              </h3>
              <p className="text-gray-700">
                <CopyText id="home.memoriesCardBody" fallback="קראו ושתפו זכרונות וסיפורים מחייו" />
              </p>
            </a>
          </div>
        </div>
      </div>

      <div className="py-12 bg-linen">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-8">
            <CopyText id="home.recentTitle" fallback="זכרונות אחרונים" />
          </h2>
          <div className="max-w-4xl mx-auto">
            <RecentMemories />
          </div>
        </div>
      </div>
    </section>
  );
}

function SiteSections() {
  return (
    <>
      <ScrollSpy />
      <Navigation />
      <main>
        <HomeSection />
        <section id="life-story" className="scroll-mt-20 bg-background py-12">
          <div className="container mx-auto px-4">
            <h1 className="text-4xl font-bold text-center mb-4">
              <CopyText id="life.title" fallback="סיפור חייו של אלכס שטרית ז״ל" />
            </h1>
            <p className="text-center text-gray-700 max-w-2xl mx-auto mb-10">
              <CopyText id="life.subtitle" fallback="סיפור חיים עשיר, משפחה אוהבת, קריירה מצליחה ומורשת בלתי נשכחת" />
            </p>
            <div className="max-w-4xl mx-auto">
              <LifeStoryTimeline />
            </div>
          </div>
        </section>
        <section id="gallery" className="scroll-mt-20 bg-linen py-12">
          <div className="container mx-auto px-4">
            <h1 className="text-4xl font-bold text-center mb-4">
              <CopyText id="gallery.title" fallback="גלריית תמונות" />
            </h1>
            <p className="text-center text-gray-700 max-w-2xl mx-auto mb-10">
              <CopyText id="gallery.subtitle" fallback="אוסף תמונות מחיי המשפחה, אירועים וזכרונות יקרים" />
            </p>
            <div className="max-w-5xl mx-auto">
              <GalleryGrid />
            </div>
          </div>
        </section>
        <section id="memories" className="scroll-mt-20 bg-background py-12">
          <div className="container mx-auto px-4">
            <h1 className="text-4xl font-bold text-center mb-4">
              <CopyText id="memories.title" fallback="זכרונות וסיפורים" />
            </h1>
            <p className="text-center text-gray-700 max-w-2xl mx-auto mb-10">
              <CopyText id="memories.subtitle" fallback="משפחה, חברים ומכרים משתפים זכרונות, סיפורים ורגעים מיוחדים" />
            </p>
            <div className="max-w-3xl mx-auto">
              <MemoriesSection />
            </div>
          </div>
        </section>
        <section id="prayers" className="scroll-mt-20">
          <PrayersContent embedded />
        </section>
        <section id="legacy" className="scroll-mt-20 bg-background py-12">
          <div className="container mx-auto px-4">
            <h1 className="text-4xl font-bold text-center mb-4">
              <CopyText id="legacy.title" fallback="מורשת ומסרים" />
            </h1>
            <p className="text-center text-gray-700 max-w-2xl mx-auto mb-10">
              <CopyText id="legacy.subtitle" fallback="ערכים, עצות, מסורות ומסרים שחשוב לשמר ולהעביר הלאה" />
            </p>
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

export default function SitePage() {
  return (
    <ActiveSectionProvider>
      <SiteSections />
    </ActiveSectionProvider>
  );
}
