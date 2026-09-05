import type { Metadata } from 'next';
import { DM_Sans, Lora } from 'next/font/google';
import './globals.css';

const body = DM_Sans({ variable: '--font-body', subsets: ['latin'] });
const heading = Lora({ variable: '--font-heading', subsets: ['latin'] });

export const metadata: Metadata = {
  metadataBase: new URL('https://project-agent-upskill.github.io'),
  title: 'ABC Tutoring | Find the right tutor',
  description:
    'Browse caring local tutors and request a tutoring session for your child.',
  openGraph: {
    title: 'ABC Tutoring | Find the right tutor',
    description:
      'A tutor who helps learning click. Browse caring educators and request a time.',
    images: [
      {
        url: '/og.png',
        width: 1536,
        height: 880,
        alt: 'ABC Tutoring — A tutor who helps learning click.',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'ABC Tutoring | Find the right tutor',
    description:
      'A tutor who helps learning click. Browse caring educators and request a time.',
    images: ['/og.png'],
  },
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body className={`${body.variable} ${heading.variable}`}>{children}</body>
    </html>
  );
}
