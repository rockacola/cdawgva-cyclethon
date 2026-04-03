import type { Metadata } from 'next';

import { ChakraProvider } from '@/providers/ChakraProvider';

export const metadata: Metadata = {
  title: 'CDawgVA Cyclethon 5',
  description: 'CDawgVA Cyclethon 5 charity event',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <ChakraProvider>{children}</ChakraProvider>
      </body>
    </html>
  );
}
