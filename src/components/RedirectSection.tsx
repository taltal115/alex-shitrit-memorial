'use client';

import { useEffect } from 'react';

export default function RedirectSection({ id }: { id: string }) {
  useEffect(() => {
    window.location.replace(`/#${id}`);
  }, [id]);

  return (
    <main className="min-h-screen bg-background py-16 text-center">
      <p className="text-lg">עוברים אל העמוד...</p>
    </main>
  );
}
