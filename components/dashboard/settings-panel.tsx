"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { SimulationParams } from "@/types"
import { Play, RotateCcw } from "lucide-react"

interface SettingsPanelProps {
  onGenerate: (params: SimulationParams) => void;
  isLoading: boolean;
}

export function SettingsPanel({ onGenerate, isLoading }: SettingsPanelProps) {
  const [params, setParams] = useState<SimulationParams>({
    days: 90,
    initialPrice: 65000,
    initialCash: 10000,
    drift: 0.15,
    volatility: 0.70,
    tradingFee: 0.001,
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onGenerate(params)
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Simulation Settings</CardTitle>
        <CardDescription>
          GBM: <code>S<sub>t</sub> = S<sub>t-1</sub> × exp((μ - σ²/2)dt + σ√dt Z)</code><br/>
          Sharpe Ratio: <code>(μ / σ) × √365</code>
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="days">Total Days</Label>
              <Input 
                id="days" 
                type="number" 
                value={params.days} 
                onChange={(e) => setParams({...params, days: Number(e.target.value)})} 
                min={60}
                max={365}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="initialPrice">Initial BTC Price ($)</Label>
              <Input 
                id="initialPrice" 
                type="number" 
                value={params.initialPrice} 
                onChange={(e) => setParams({...params, initialPrice: Number(e.target.value)})} 
                min={1}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="drift">Annual Drift (Return)</Label>
              <Input 
                id="drift" 
                type="number" 
                step="0.01"
                value={params.drift} 
                onChange={(e) => setParams({...params, drift: Number(e.target.value)})} 
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="volatility">Annual Volatility</Label>
              <Input 
                id="volatility" 
                type="number" 
                step="0.01"
                value={params.volatility} 
                onChange={(e) => setParams({...params, volatility: Number(e.target.value)})} 
                min={0}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="initialCash">Initial Portfolio ($)</Label>
              <Input 
                id="initialCash" 
                type="number" 
                value={params.initialCash} 
                onChange={(e) => setParams({...params, initialCash: Number(e.target.value)})} 
                min={100}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="tradingFee">Trading Fee (%)</Label>
              <Input 
                id="tradingFee" 
                type="number" 
                step="0.001"
                value={params.tradingFee * 100} 
                onChange={(e) => setParams({...params, tradingFee: Number(e.target.value) / 100})} 
                min={0}
              />
            </div>
          </div>
          
          <Button type="submit" className="w-full" disabled={isLoading}>
            {isLoading ? (
              <RotateCcw className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <Play className="mr-2 h-4 w-4" />
            )}
            Generate Simulation
          </Button>
        </form>
      </CardContent>
    </Card>
  )
}
