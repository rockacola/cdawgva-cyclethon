export interface DonationAmount {
  value: string;
  currency: string;
}

export interface SavedDonation {
  id: string;
  created_at: string;
  completed_at: string;
  amount: DonationAmount;
  donor_name: string;
  donor_comment: string | null;
}

export interface DonationsSnapshot {
  fetched_at: string;
  donations: SavedDonation[];
}
