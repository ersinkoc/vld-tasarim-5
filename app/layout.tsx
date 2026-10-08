import type { Metadata, Viewport } from 'next';
import { Anybody, Martian_Mono } from 'next/font/google';
import './globals.css';

const anybody = Anybody({
  subsets: ['latin', 'latin-ext'],
  axes: ['wdth'],
  variable: '--font-anybody',
  display: 'swap',
});

const martian = Martian_Mono({
  subsets: ['latin', 'latin-ext'],
  axes: ['wdth'],
  variable: '--font-martian',
  display: 'swap',
});

export const metadata: Metadata = {
  metadataBase: new URL('https://vld.oxog.dev'),
  title: 'VLD — validation without the weight',
  description:
    'Type-safe schema validation for TypeScript with the Zod API, zero dependencies, error messages in 32 locales, and roughly three times the speed.',
  openGraph: {
    title: 'VLD — validation without the weight',
    description: 'Swap one import. Keep your Zod schemas. Validate faster.',
    url: 'https://vld.oxog.dev',
    siteName: 'VLD',
  },
};

export const viewport: Viewport = {
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#eef0f7' },
    { media: '(prefers-color-scheme: dark)', color: '#080b24' },
  ],
};

// Runs before first paint so the stored or system theme never flashes.
const themeScript = `(function(){try{var t=localStorage.getItem("theme");if(t!=="light"&&t!=="dark"){t=matchMedia("(prefers-color-scheme: dark)").matches?"dark":"light"}document.documentElement.setAttribute("data-theme",t)}catch(e){}})()`;

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" data-theme="light" suppressHydrationWarning className={`${anybody.variable} ${martian.variable}`}>
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeScript }} />
      </head>
      <body>{children}</body>
    </html>
  );
}
