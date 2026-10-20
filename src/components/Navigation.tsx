'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState } from 'react';
import { Menu, X } from 'lucide-react';

const navigationLinks = [
  { href: '/', label: 'בית' },
  { href: '/life-story', label: 'סיפור החיים' },
  { href: '/gallery', label: 'גלריה' },
  { href: '/memories', label: 'זכרונות' },
  { href: '/prayers', label: 'תפילות' },
  { href: '/legacy', label: 'מורשת' },
];

export default function Navigation() {
  const pathname = usePathname();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  return (
    <nav className="bg-linen shadow-sm sticky top-0 z-50">
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center h-16">
          {/* Logo/Title */}
          <Link href="/" className="text-xl font-semibold text-text hover:text-sand transition-colors">
            אלכס שטרית ז"ל
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex space-x-reverse space-x-6">
            {navigationLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                  pathname === link.href
                    ? 'bg-sand text-white'
                    : 'text-text hover:bg-background hover:text-sand'
                }`}
              >
                {link.label}
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
                  key={link.href}
                  href={link.href}
                  onClick={() => setIsMenuOpen(false)}
                  className={`px-3 py-2 rounded-md text-base font-medium transition-colors ${
                    pathname === link.href
                      ? 'bg-sand text-white'
                      : 'text-text hover:bg-background'
                  }`}
                >
                  {link.label}
                </Link>
              ))}
            </div>
          </div>
        )}
      </div>
    </nav>
  );
}
