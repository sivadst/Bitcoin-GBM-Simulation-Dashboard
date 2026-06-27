# AlgoTrader Pro 📈

AlgoTrader Pro is a professional-grade, full-stack quantitative trading simulator built with **Next.js 15**, **Node.js 20 LTS**, **Tailwind CSS**, and **Recharts**.

It simulates Bitcoin price movements using **Geometric Brownian Motion (GBM)** and executes algorithmic trades based on a **7-Day vs 30-Day Moving Average Crossover** strategy (Golden Cross / Death Cross).

## Features

- **Realistic Price Simulation**: Generates 90 days of Bitcoin prices using Geometric Brownian Motion. Customizable drift and volatility parameters.
- **Algorithmic Trading Engine**: Automatically buys 100% BTC on a Golden Cross and sells 100% for USD on a Death Cross, factoring in a configurable transaction fee.
- **Financial Metrics**: Calculates Total Return, Buy & Hold Baseline Return, Sharpe Ratio (0% risk-free), Max Drawdown, and tracks Final Portfolio Value.
- **Interactive Visualization**: High-quality, responsive charts using Recharts for Prices, MAs, Portfolio Value, and Drawdowns.
- **Playback Mode**: Animate the simulation day-by-day with Play, Pause, Speed Control (1x, 2x, 5x), and Jump to End.
- **Export Data**: Download the trade ledger as a CSV file, or export charts as PNG images.
- **Modern UI/UX**: Built with shadcn/ui and Tailwind CSS. Fully responsive with Light and Dark mode.

## Architecture

This is a unified **Next.js 15 App Router** application:
- **Frontend**: Handles state, user inputs, playback animation (`lib/hooks.ts`), and visualization. Components are modularized inside `components/dashboard`.
- **Backend**: Uses Next.js API Route Handlers (`app/api/simulate/route.ts`) to execute the intensive mathematical GBM modeling, generate moving averages, and process trades server-side.

## Getting Started

### Prerequisites

- **Node.js**: v20.20.2 LTS (or higher)

### Installation

1. Clone the repository and navigate to the root directory.
2. Install dependencies:
   ```bash
   npm install
   ```

### Running the Application

Start the development server:
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) in your browser to view the application.

### Building for Production

```bash
npm run build
npm start
```

## API Documentation

**`POST /api/simulate`**
Generates the trading simulation.

**Request Body:**
```json
{
  "days": 90,
  "initialPrice": 65000,
  "initialCash": 10000,
  "drift": 0.15,
  "volatility": 0.70,
  "tradingFee": 0.001
}
```

**Response:**
Returns a JSON object containing `dailyData` (prices, MAs, portfolio value per day), `trades` (the ledger of executed trades), and `metrics` (financial performance summary).
