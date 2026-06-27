"use client"

import { DailyData } from "@/types"
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  ReferenceDot
} from "recharts"
import { formatCurrency } from "@/lib/utils"

interface PriceChartProps {
  data: DailyData[]
}

export function PriceChart({ data }: PriceChartProps) {
  // Extract buy/sell signals to plot them as dots
  const buySignals = data.filter(d => d.signal === 'BUY');
  const sellSignals = data.filter(d => d.signal === 'SELL');

  return (
    <div className="h-[400px] w-full">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={data} margin={{ top: 5, right: 20, bottom: 5, left: 0 }}>
          <CartesianGrid strokeDasharray="3 3" opacity={0.2} />
          <XAxis 
            dataKey="day" 
            tickFormatter={(val) => `Day ${val}`}
          />
          <YAxis 
            yAxisId="left"
            tickFormatter={(val) => `$${(val / 1000).toFixed(0)}k`}
            domain={['auto', 'auto']}
          />
          <Tooltip 
            formatter={(value: any, name: any) => {
              if (typeof value === 'number' && (name === 'BTC Price' || name === '7D MA' || name === '30D MA')) {
                return [formatCurrency(value), name];
              }
              return [value, name];
            }}
            labelFormatter={(label) => `Day ${label}`}
            contentStyle={{ backgroundColor: 'hsl(var(--background))', borderColor: 'hsl(var(--border))' }}
          />
          <Legend />
          <Line 
            yAxisId="left"
            type="monotone" 
            dataKey="price" 
            name="BTC Price" 
            stroke="hsl(var(--foreground))" 
            dot={false}
            strokeWidth={2}
          />
          <Line 
            yAxisId="left"
            type="monotone" 
            dataKey="ma7" 
            name="7D MA" 
            stroke="#10b981" 
            dot={false}
            strokeWidth={1.5}
            connectNulls
          />
          <Line 
            yAxisId="left"
            type="monotone" 
            dataKey="ma30" 
            name="30D MA" 
            stroke="#f59e0b" 
            dot={false}
            strokeWidth={1.5}
            connectNulls
          />

          {/* Plotting Signals */}
          {buySignals.map((s, i) => (
            <ReferenceDot
              key={`buy-${i}`}
              yAxisId="left"
              x={s.day}
              y={s.price}
              r={4}
              fill="#10b981"
              stroke="white"
            />
          ))}
          {sellSignals.map((s, i) => (
            <ReferenceDot
              key={`sell-${i}`}
              yAxisId="left"
              x={s.day}
              y={s.price}
              r={4}
              fill="#ef4444"
              stroke="white"
            />
          ))}
        </LineChart>
      </ResponsiveContainer>
    </div>
  )
}
