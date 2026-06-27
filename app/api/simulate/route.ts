import { NextResponse } from 'next/server';
import { SimulationParams, DailyData, Trade, SimulationResult } from '@/types';

// Box-Muller transform for standard normal variable
function randn_bm() {
  let u = 0, v = 0;
  while (u === 0) u = Math.random();
  while (v === 0) v = Math.random();
  return Math.sqrt(-2.0 * Math.log(u)) * Math.cos(2.0 * Math.PI * v);
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const params: SimulationParams = {
      days: body.days || 90,
      initialPrice: body.initialPrice || 65000,
      initialCash: body.initialCash || 10000,
      drift: body.drift !== undefined ? body.drift : 0.15,
      volatility: body.volatility !== undefined ? body.volatility : 0.70,
      tradingFee: body.tradingFee !== undefined ? body.tradingFee : 0.001,
    };

    const dt = 1 / 365; // Daily time step
    
    // Arrays for data
    const prices: number[] = [params.initialPrice];
    const dailyData: DailyData[] = [];
    const trades: Trade[] = [];

    let currentCash = params.initialCash;
    let currentBtc = 0;
    
    // First, generate 90 days of prices using GBM
    // S_t = S_{t-1} * exp((mu - sigma^2 / 2) * dt + sigma * sqrt(dt) * Z)
    for (let i = 1; i < params.days; i++) {
      const Z = randn_bm();
      const prevPrice = prices[i - 1];
      const driftTerm = (params.drift - 0.5 * Math.pow(params.volatility, 2)) * dt;
      const volTerm = params.volatility * Math.sqrt(dt) * Z;
      const nextPrice = prevPrice * Math.exp(driftTerm + volTerm);
      prices.push(nextPrice);
    }

    // Now calculate MAs and execute trades
    for (let i = 0; i < params.days; i++) {
      const currentPrice = prices[i];
      let ma7 = null;
      let ma30 = null;
      let signal: 'BUY' | 'SELL' | 'HOLD' | null = null;

      // Calculate MAs
      if (i >= 6) {
        ma7 = prices.slice(i - 6, i + 1).reduce((a, b) => a + b, 0) / 7;
      }
      if (i >= 29) {
        ma30 = prices.slice(i - 29, i + 1).reduce((a, b) => a + b, 0) / 30;
      }

      // Check for Crossovers (Trading logic starts after day 30, i >= 30)
      if (i >= 30) {
        const prevMa7 = prices.slice(i - 7, i).reduce((a, b) => a + b, 0) / 7;
        const prevMa30 = prices.slice(i - 30, i).reduce((a, b) => a + b, 0) / 30;

        const isGoldenCross = prevMa7 <= prevMa30 && ma7! > ma30!;
        const isDeathCross = prevMa7 >= prevMa30 && ma7! < ma30!;

        if (isGoldenCross && currentCash > 0) {
          // BUY 100%
          signal = 'BUY';
          const fee = currentCash * params.tradingFee;
          const btcToBuy = (currentCash - fee) / currentPrice;
          
          currentBtc += btcToBuy;
          currentCash = 0;

          trades.push({
            day: i + 1,
            type: 'BUY',
            price: currentPrice,
            amount: btcToBuy,
            fee: fee,
            cashAfter: currentCash,
            btcAfter: currentBtc
          });
        } else if (isDeathCross && currentBtc > 0) {
          // SELL 100%
          signal = 'SELL';
          const grossCash = currentBtc * currentPrice;
          const fee = grossCash * params.tradingFee;
          const cashToReceive = grossCash - fee;

          currentCash += cashToReceive;
          
          trades.push({
            day: i + 1,
            type: 'SELL',
            price: currentPrice,
            amount: currentBtc,
            fee: fee,
            cashAfter: currentCash,
            btcAfter: 0
          });
          
          currentBtc = 0;
        } else {
            signal = 'HOLD';
        }
      }

      const portfolioValue = currentCash + (currentBtc * currentPrice);

      dailyData.push({
        day: i + 1,
        price: currentPrice,
        ma7,
        ma30,
        cash: currentCash,
        btc: currentBtc,
        portfolioValue,
        signal
      });
    }

    // Calculate metrics
    const initialValue = params.initialCash;
    const finalValue = dailyData[dailyData.length - 1].portfolioValue;
    const totalReturn = (finalValue - initialValue) / initialValue;
    
    // Buy and Hold Return: what if we bought BTC on day 30 (when active trading starts) or Day 1?
    // Let's use Day 1 buy-and-hold for overall comparison
    const initialBtcAmount = (initialValue * (1 - params.tradingFee)) / prices[0];
    const buyAndHoldFinal = initialBtcAmount * prices[prices.length - 1];
    const buyAndHoldReturn = (buyAndHoldFinal - initialValue) / initialValue;

    // Max Drawdown
    let maxDrawdown = 0;
    let peakValue = initialValue;
    for (const data of dailyData) {
      if (data.portfolioValue > peakValue) {
        peakValue = data.portfolioValue;
      }
      const drawdown = (peakValue - data.portfolioValue) / peakValue;
      if (drawdown > maxDrawdown) {
        maxDrawdown = drawdown;
      }
    }

    // Sharpe Ratio (Daily returns array -> annualized)
    const dailyReturns = [];
    for (let i = 1; i < dailyData.length; i++) {
      const prevVal = dailyData[i - 1].portfolioValue;
      const currVal = dailyData[i].portfolioValue;
      dailyReturns.push((currVal - prevVal) / prevVal);
    }
    
    const meanDailyReturn = dailyReturns.reduce((a, b) => a + b, 0) / dailyReturns.length;
    const stdDailyReturn = Math.sqrt(dailyReturns.reduce((sq, val) => sq + Math.pow(val - meanDailyReturn, 2), 0) / dailyReturns.length);
    
    // Annualized Sharpe Ratio (sqrt(365) * (mean / std)), Risk-Free = 0
    let sharpeRatio = 0;
    if (stdDailyReturn > 0) {
      sharpeRatio = (meanDailyReturn / stdDailyReturn) * Math.sqrt(365);
    }

    const result: SimulationResult = {
      dailyData,
      trades,
      metrics: {
        initialValue,
        finalValue,
        totalReturn,
        buyAndHoldReturn,
        maxDrawdown,
        sharpeRatio,
        tradeCount: trades.length
      }
    };

    return NextResponse.json(result);
  } catch (error) {
    console.error('Simulation error:', error);
    return NextResponse.json({ error: 'Failed to run simulation' }, { status: 500 });
  }
}
