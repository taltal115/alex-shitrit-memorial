import Navigation from '@/components/Navigation';
import Footer from '@/components/Footer';
import PrayersContent from '@/components/PrayersContent';

export const metadata = {
  title: 'תפילות ואזכרה - אלכס שטרית',
  description: 'תפילות לעילוי נשמת אלכס שטרית ז"ל',
};

export default function PrayersPage() {
  return (
    <>
      <Navigation />
      <PrayersContent />
      <Footer />
    </>
  );
}
