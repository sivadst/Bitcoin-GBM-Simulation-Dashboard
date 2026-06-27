export interface SimulationParams {
  days: number;
  initialPrice: number;
  initialCash: number;
  drift: number; // annual
  volatility: number; // annual
  tradingFee: number; // percentage, e.g., 0.001 for 0.1%
}

export interface DailyData {
  day: number;
  price: number;
  ma7: number | null;
  ma30: number | null;
  cash: number;
  btc: number;
  portfolioValue: number;
  signal: 'BUY' | 'SELL' | 'HOLD' | null;
}

export interface Trade {
  day: number;
  type: 'BUY' | 'SELL';
  price: number;
  amount: number;
  fee: number;
  cashAfter: number;
  btcAfter: number;
}

export interface SimulationResult {
  dailyData: DailyData[];
  trades: Trade[];
  metrics: {
    initialValue: number;
    finalValue: number;
    totalReturn: number;
    buyAndHoldReturn: number;
    maxDrawdown: number;
    sharpeRatio: number;
    tradeCount: number;
  };
}
