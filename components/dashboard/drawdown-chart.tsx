"use client"

import { DailyData } from "@/types"
import { useMemo } from "react"
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer
} from "recharts"
interface DrawdownChartProps {
  data: DailyData[]
}

export function DrawdownChart({ data }: DrawdownChartProps) {
  const drawdownData = useMemo(() => {
    // Calculate drawdown per day without re-assigning variables in map scope
    const result = [];
    let peak = 0;
    for (const d of data) {
      if (d.portfolioValue > peak) {
        peak = d.portfolioValue;
      }
      const drawdown = peak > 0 ? (d.portfolioValue - peak) / peak : 0;
      result.push({
        day: d.day,
        drawdown: drawdown * 100
      });
    }
    return result;
  }, [data]);

  return (
    <div className="h-[300px] w-full">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={drawdownData} margin={{ top: 5, right: 20, bottom: 5, left: 0 }}>
          <defs>
            <linearGradient id="colorDrawdown" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#ef4444" stopOpacity={0.3}/>
              <stop offset="95%" stopColor="#ef4444" stopOpacity={0}/>
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" opacity={0.2} />
          <XAxis 
            dataKey="day" 
            tickFormatter={(val) => `Day ${val}`}
          />
          <YAxis 
            tickFormatter={(val) => `${val.toFixed(0)}%`}
            domain={['auto', 0]}
          />
          <Tooltip 
            formatter={(value: any) => {
              if (typeof value === 'number') {
                return [`${value.toFixed(2)}%`, 'Drawdown'];
              }
              return [value, 'Drawdown'];
            }}
            labelFormatter={(label) => `Day ${label}`}
            contentStyle={{ backgroundColor: 'hsl(var(--background))', borderColor: 'hsl(var(--border))' }}
          />
          <Area 
            type="monotone" 
            dataKey="drawdown" 
            stroke="#ef4444" 
            fillOpacity={1} 
            fill="url(#colorDrawdown)" 
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  )
}
