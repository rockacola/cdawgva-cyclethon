import { Box, Container, Heading, Text } from '@chakra-ui/react';
import type { Metadata } from 'next';

import { DonationFeed } from '@/components/DonationFeed';
import { RelativeTime } from '@/components/RelativeTime';
import donationData from '@/data/donations.json';

export const metadata: Metadata = {
  title: 'CDawgVA Cyclethon 5',
};

export default function HomePage() {
  const { generated_at, donations } = donationData;

  return (
    <Box py={20}>
      <Container maxW="4xl">
        <Heading as="h1" mb={2} size="2xl">
          CDawgVA Cyclethon 5
        </Heading>

        {!!generated_at && (
          <Text color="gray.500" fontSize="sm" mb={8}>
            Last checked: <RelativeTime iso={generated_at} showUTC />
          </Text>
        )}

        <DonationFeed donations={donations} />
      </Container>
    </Box>
  );
}
