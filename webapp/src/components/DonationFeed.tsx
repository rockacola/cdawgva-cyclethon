import { Table, Text } from '@chakra-ui/react';

import { RelativeTime } from '@/components/RelativeTime';

interface Donation {
  id: string;
  completed_at: string;
  amount: { value: string; currency: string };
  donor_name: string;
  donor_comment: string | null;
}

interface Props {
  donations: Donation[];
}

export function DonationFeed({ donations }: Props) {
  if (donations.length === 0) {
    return (
      <Text color="gray.500" mt={4}>
        No donation data available yet.
      </Text>
    );
  }

  return (
    <Table.Root size="sm" variant="outline">
      <Table.Header>
        <Table.Row>
          <Table.ColumnHeader w="140px" whiteSpace="nowrap">
            Time
          </Table.ColumnHeader>
          <Table.ColumnHeader>Donor</Table.ColumnHeader>
          <Table.ColumnHeader>Comment</Table.ColumnHeader>
          <Table.ColumnHeader textAlign="right">Amount</Table.ColumnHeader>
        </Table.Row>
      </Table.Header>
      <Table.Body>
        {donations.map((d) => (
          <Table.Row key={d.id}>
            <Table.Cell data-utc={d.completed_at}>
              <RelativeTime iso={d.completed_at} />
            </Table.Cell>
            <Table.Cell>{d.donor_name}</Table.Cell>
            <Table.Cell color="gray.500">{d.donor_comment ?? '—'}</Table.Cell>
            <Table.Cell textAlign="right">${parseFloat(d.amount.value).toFixed(2)}</Table.Cell>
          </Table.Row>
        ))}
      </Table.Body>
    </Table.Root>
  );
}
