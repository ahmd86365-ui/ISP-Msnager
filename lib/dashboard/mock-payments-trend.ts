// Explicitly static demo data for the payments trend chart — Step 4 asked
// for this chart to use fixed demo data rather than a real monthly
// aggregation query. Real monthly reporting belongs to the future
// Reports/Payments module. The dashboard UI also labels this chart as demo
// data so it's never mistaken for a live figure.
export interface PaymentsTrendPoint {
  month: string;
  amountSyp: number;
}

export const MOCK_PAYMENTS_TREND: PaymentsTrendPoint[] = [
  { month: "مارس", amountSyp: 8_200_000 },
  { month: "أبريل", amountSyp: 6_800_000 },
  { month: "مايو", amountSyp: 9_900_000 },
  { month: "يونيو", amountSyp: 9_300_000 },
  { month: "يوليو", amountSyp: 11_100_000 },
  { month: "أغسطس", amountSyp: 12_450_000 },
];
