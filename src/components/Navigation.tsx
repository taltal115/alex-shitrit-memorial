'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { createContext, useContext, useState, type ReactNode } from 'react';
import { Menu, X } from 'lucide-react';
import { CopyText } from '@/components/edit/EditableText';

export const navigationLinks = [
  { id: 'home', label: 'בית' },
  { id: 'life-story', label: 'סיפור החיים' },
  { id: 'gallery', label: 'גלריה' },
  { id: 'memories', label: 'זכרונות' },
  { id: 'prayers', label: 'תפילות' },
  { id: 'legacy', label: 'מורשת' },
];

const ActiveSectionContext = createContext<{
  active: string;
  setActive: (id: string) => void;
} | null>(null);

export function ActiveSectionProvider({ children }: { children: ReactNode }) {
  const [active, setActive] = useState('home');
  return <ActiveSectionContext.Provider value={{ active, setActive }}>{children}</ActiveSectionContext.Provider>;
}

export function useActiveSection() {
  return useContext(ActiveSectionContext);
}

export function sectionTop(id: string): number {
  const node = document.getElementById(id);
  if (!node) return Number.POSITIVE_INFINITY;
  return node.getBoundingClientRect().top + window.scrollY;
}

export function scrollToSection(id: string) {
  const top = sectionTop(id);
  if (!Number.isFinite(top)) return;
  const root = document.documentElement;
  const previous = root.style.scrollBehavior;
  root.style.scrollBehavior = 'auto';
  window.scrollTo(0, Math.max(0, top - 80));
  window.requestAnimationFrame(() => {
    root.style.scrollBehavior = previous;
  });
}

export default function Navigation() {
  const pathname = usePathname();
  const section = useActiveSection();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const activeId = section?.active ?? '';

  function openSection(event: React.MouseEvent<HTMLAnchorElement>, id: string) {
    if (window.location.pathname !== '/') return;
    event.preventDefault();
    scrollToSection(id);
    window.history.replaceState(null, '', `#${id}`);
    section?.setActive(id);
    setIsMenuOpen(false);
  }

  return (
    <nav className="bg-linen shadow-sm sticky top-0 z-50">
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center h-16">
          {/* Logo/Title */}
          <Link href="/#home" onClick={(event) => openSection(event, 'home')} className="text-xl font-semibold text-text hover:text-sand transition-colors">
            <CopyText id="nav.brand" fallback={'אלכס שטרית ז"ל'} />
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex space-x-reverse space-x-6">
            {navigationLinks.map((link) => (
              <Link
                key={link.id}
                href={`/#${link.id}`}
                onClick={(event) => openSection(event, link.id)}
                className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                  activeId === link.id || (pathname === '/' && !activeId && link.id === 'home')
                    ? 'bg-sand text-white'
                    : 'text-text hover:bg-background hover:text-sand'
                }`}
              >
                <CopyText id={`nav.${link.id}`} fallback={link.label} />
              </Link>
            ))}
          </div>

          {/* Mobile menu button */}
          <button
            className="md:hidden p-2"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            aria-label="תפריט"
          >
            {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>

        {/* Mobile Navigation */}
        {isMenuOpen && (
          <div className="md:hidden pb-4">
            <div className="flex flex-col space-y-2">
              {navigationLinks.map((link) => (
                <Link
                  key={link.id}
                  href={`/#${link.id}`}
                  onClick={(event) => openSection(event, link.id)}
                  className={`px-3 py-2 rounded-md text-base font-medium transition-colors ${
                    activeId === link.id
                      ? 'bg-sand text-white'
                      : 'text-text hover:bg-background'
                  }`}
                >
                  <CopyText id={`nav.${link.id}`} fallback={link.label} />
                </Link>
              ))}
            </div>
          </div>
        )}
      </div>
    </nav>
  );
}
