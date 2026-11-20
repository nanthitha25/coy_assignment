import type { Metadata, Viewport } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'coy. — Discover',
  description: 'Find out if your crush likes you back — Discover Tab prototype',
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-[#F3EFE9] text-[#1A1A1A] flex items-center justify-center p-0 sm:py-4 selection:bg-[#FFE4EC] selection:text-[#FF4D8D]">
        <div className="w-full max-w-md min-h-dvh sm:min-h-[860px] sm:max-h-[920px] sm:h-[880px] bg-[#FAF8F5] sm:border-[2.5px] sm:border-[#1A1A1A] sm:shadow-brutal-xl sm:rounded-[36px] flex flex-col relative overflow-hidden">
          {children}
        </div>
      </body>
    </html>
  );
}
