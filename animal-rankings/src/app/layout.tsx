import './globals.css'
import type { Metadata } from 'next'
import { AuthProvider } from '@/components/AuthProvider';

export const metadata: Metadata = {
  title: 'Animal Rankings',
  description: 'Rate and compare different animals',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html>
      <body>
        <AuthProvider>
          {children}
        </AuthProvider>
      </body>
    </html>
  );
}
