import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'אלכס שטרית - לזכרו',
  description: 'אתר הנצחה לזכרו של אלכס שטרית ז"ל',
  icons: {
    icon: '/favicon.ico',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="he" dir="rtl">
      <body>{children}</body>
    </html>
  );
}
