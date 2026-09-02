import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'MEDILOOP | Share. Connect. Save Lives.',
  description: 'B2B Medical Equipment Sharing & Rental Network for Healthcare Facilities in Tier-2, Tier-3 and Rural Communities.',
  icons: {
    icon: '/logo.svg',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="h-full bg-slate-50">
      <body className="h-full min-h-screen flex flex-col font-sans text-slate-900 bg-slate-50 selection:bg-teal-100 selection:text-teal-900">
        {children}
      </body>
    </html>
  );
}
