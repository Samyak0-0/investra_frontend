export interface StockPoint {
  x: number;  // timestamp
  y: number;  // price
}

export interface StockApiResponse {
  "Meta Data": any;
  [key: string]: any;
}
