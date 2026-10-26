'use client';

import Link from 'next/link';
import type { ReactNode } from 'react';
import { useAdminAuth } from '@/hooks/useAdminAuth';
import Navigation from '@/components/Navigation';
import Footer from '@/components/Footer';
import AdminSignIn from '@/components/admin/AdminSignIn';

interface AdminShellProps {
  title: string;
  description?: string;
  requireSuper?: boolean;
  children: ReactNode;
}

export default function AdminShell({ title, description, requireSuper = false, children }: AdminShellProps) {
  const { loading, authorized } = useAdminAuth(requireSuper ? 'super_admin' : undefined);

  return (
    <>
      <Navigation />
      <main className="min-h-screen bg-background">
        <section className="bg-linen py-10">
          <div className="container mx-auto px-4">
            <Link href="/admin" className="text-sm text-sand hover:underline">
              חזרה לכלי הניהול
            </Link>
            <h1 className="text-4xl font-bold text-center mt-4 mb-3">{title}</h1>
            {description && (
              <p className="text-center text-gray-700 max-w-2xl mx-auto">{description}</p>
            )}
          </div>
        </section>
        <section className="py-10">
          <div className="container mx-auto px-4">
            <div className="max-w-4xl mx-auto">
              {loading ? (
                <p className="text-center text-xl">בודק הרשאות...</p>
              ) : authorized ? (
                children
              ) : (
                <AdminSignIn
                  title={requireSuper ? 'נדרשת הרשאת מנהל-על' : 'נדרשת הזדהות'}
                  message={
                    requireSuper
                      ? 'הפעולה הזו שמורה למנהל-העל של האתר.'
                      : 'דף זה מיועד למנהלי האתר בלבד. יש להתחבר כדי לגשת לאזור הניהול.'
                  }
                />
              )}
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
