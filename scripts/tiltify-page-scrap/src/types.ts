export interface Donation {
  name: string;
  amount: number | null;
  amount_label: string;
  comment: string;
  incentives: string;
  is_sticky: boolean;
  scraped_at: string;
}
