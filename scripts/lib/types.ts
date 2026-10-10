export interface SavedDonation {
  id: string;
  completed_at: number;
  amount_cent: number;
  amount_currency: string;
  donor_name: string;
  donor_comment: string | null;
}

export interface DonationsSnapshot {
  fetched_at: string;
  donations: SavedDonation[];
}
