import type { Metadata } from 'next';
import './globals.css';
import Sidebar from '@/components/Sidebar';

export const metadata: Metadata = {
  title: 'CareerGraph - Graph-Based Career Intelligence',
  description: 'Explore interconnected professional paths, roles, skills, and companies powered by CognoDB.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="h-full antialiased dark">
      <body className="h-full bg-brand-bg text-gray-100 selection:bg-violet-600/30 selection:text-violet-200">
        <div className="min-h-screen w-full flex flex-col md:flex-row">
          <Sidebar />
          <main className="flex-1 w-full md:pl-64 pt-16 pb-20 md:pt-0 md:pb-0 min-h-screen flex flex-col">
            <div className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto">
              {children}
            </div>
          </main>
        </div>
      </body>
    </html>
  );
}
