'use client';

import { ChakraProvider as BaseChakraProvider, defaultSystem } from '@chakra-ui/react';

export function ChakraProvider({ children }: { children: React.ReactNode }) {
  return <BaseChakraProvider value={defaultSystem}>{children}</BaseChakraProvider>;
}
