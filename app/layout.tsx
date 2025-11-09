import '../styles/globals.css';
import { Inter } from 'next/font/google';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/src/lib/auth';
import Providers from '@/src/components/Providers';

const inter = Inter({ subsets: ['latin'] });

export const metadata = {
  title: 'Event Flow',
  description: 'Easy tracking for your next event.',
  viewport: {
    width: 'device-width',
    initialScale: 1,
  },
};

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getServerSession(authOptions);

  return (
    <html lang="en">
      <body className={inter.className}>
        <Providers session={session}>
          {children}
        </Providers>
      </body>
    </html>
  );
}
