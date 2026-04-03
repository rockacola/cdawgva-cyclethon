export interface Donation {
  index: number; // 1-based
  name: string;
  amount: number | null;
  amount_label: string;
  comment: string;
  incentives: string;
  is_sticky: boolean;
  scraped_at: string;
}
