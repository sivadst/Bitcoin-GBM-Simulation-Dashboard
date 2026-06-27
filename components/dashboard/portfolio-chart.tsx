"use client"

import { DailyData } from "@/types"
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer
} from "recharts"
import { formatCurrency } from "@/lib/utils"

interface PortfolioChartProps {
  data: DailyData[]
}

export function PortfolioChart({ data }: PortfolioChartProps) {
  return (
    <div className="h-[300px] w-full">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={data} margin={{ top: 5, right: 20, bottom: 5, left: 0 }}>
          <defs>
            <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3}/>
              <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" opacity={0.2} />
          <XAxis 
            dataKey="day" 
            tickFormatter={(val) => `Day ${val}`}
          />
          <YAxis 
            tickFormatter={(val) => `$${(val / 1000).toFixed(0)}k`}
            domain={['auto', 'auto']}
          />
          <Tooltip 
            formatter={(value: any) => {
              if (typeof value === 'number') {
                return [formatCurrency(value), 'Portfolio Value'];
              }
              return [value, 'Portfolio Value'];
            }}
            labelFormatter={(label) => `Day ${label}`}
            contentStyle={{ backgroundColor: 'hsl(var(--background))', borderColor: 'hsl(var(--border))' }}
          />
          <Area 
            type="monotone" 
            dataKey="portfolioValue" 
            stroke="#3b82f6" 
            fillOpacity={1} 
            fill="url(#colorValue)" 
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  )
}
