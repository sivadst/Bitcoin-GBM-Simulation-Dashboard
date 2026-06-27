"use client"

import { useState, useEffect } from "react"
import { ModeToggle } from "@/components/ui/mode-toggle"
import { SettingsPanel } from "@/components/dashboard/settings-panel"
import { MetricsCards } from "@/components/dashboard/metrics-cards"
import { PriceChart } from "@/components/dashboard/price-chart"
import { PortfolioChart } from "@/components/dashboard/portfolio-chart"
import { DrawdownChart } from "@/components/dashboard/drawdown-chart"
import { TradeHistory } from "@/components/dashboard/trade-history"
import { SimulationResult, SimulationParams } from "@/types"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Download, Play, Pause, RotateCcw, FastForward, Image as ImageIcon } from "lucide-react"
import { usePlayback } from "@/lib/hooks"
import { exportTradesToCSV } from "@/utils/export"
import { useDownloadChart } from "@/lib/download-chart"

export default function Home() {
  const [result, setResult] = useState<SimulationResult | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const { downloadChart } = useDownloadChart()

  const handleGenerate = async (params: SimulationParams) => {
    setIsLoading(true)
    setError(null)
    try {
      const res = await fetch("/api/simulate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(params),
      })
      if (!res.ok) throw new Error("Failed to generate simulation")
      const data: SimulationResult = await res.json()
      setResult(data)
      jumpToEnd()
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred")
    } finally {
      setIsLoading(false)
    }
  }

  const {
    visibleData,
    isPlaying,
    speed,
    togglePlay,
    reset,
    changeSpeed,
    jumpToEnd,
    totalDays,
    currentDayIndex
  } = usePlayback(result?.dailyData || null)

  // Generate an initial simulation on mount
  useEffect(() => {
    const fetchInitial = async () => {
      try {
        const res = await fetch("/api/simulate", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            days: 90,
            initialPrice: 65000,
            initialCash: 10000,
            drift: 0.15,
            volatility: 0.70,
            tradingFee: 0.001,
          }),
        })
        if (!res.ok) throw new Error("Failed to generate simulation")
        const data: SimulationResult = await res.json()
        setResult(data)
      } catch (err) {
        setError(err instanceof Error ? err.message : "An error occurred")
      }
    };
    fetchInitial();
  }, [])

  useEffect(() => {
    if (result) {
      jumpToEnd()
    }
  }, [result, jumpToEnd])

  // Derive metrics for the *current playback state*
  // If we are at the end, use the full result metrics, otherwise calculate partial
  const currentMetrics = result?.metrics

  const visibleTrades = result?.trades.filter(t => t.day <= (currentDayIndex + 1)) || []

  return (
    <div className="min-h-screen bg-background text-foreground pb-10">
      <header className="border-b">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-primary rounded-md flex items-center justify-center text-primary-foreground font-bold">
              ₿
            </div>
            <h1 className="text-xl font-bold tracking-tight">AlgoTrader Pro</h1>
          </div>
          <ModeToggle />
        </div>
      </header>

      <main className="container mx-auto px-4 mt-8 space-y-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Left Column: Settings & Controls */}
          <div className="lg:col-span-3 space-y-6">
            <SettingsPanel onGenerate={handleGenerate} isLoading={isLoading} />
            
            {error && (
              <div className="bg-destructive/15 text-destructive p-3 rounded-md text-sm">
                {error}
              </div>
            )}

            {result && (
              <Card>
                <CardHeader>
                  <CardTitle>Playback Controls</CardTitle>
                  <CardDescription>Animate the simulation day by day.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between text-sm">
                    <span className="font-medium text-muted-foreground">Progress</span>
                    <span className="font-bold">Day {currentDayIndex + 1} / {totalDays}</span>
                  </div>
                  
                  <div className="w-full bg-secondary h-2 rounded-full overflow-hidden">
                    <div 
                      className="bg-primary h-full transition-all duration-200" 
                      style={{ width: `${((currentDayIndex + 1) / totalDays) * 100}%` }}
                    />
                  </div>

                  <div className="flex space-x-2">
                    <Button variant={isPlaying ? "destructive" : "default"} className="flex-1" onClick={togglePlay}>
                      {isPlaying ? <Pause className="w-4 h-4 mr-2" /> : <Play className="w-4 h-4 mr-2" />}
                      {isPlaying ? "Pause" : "Play"}
                    </Button>
                    <Button variant="outline" size="icon" onClick={reset}>
                      <RotateCcw className="w-4 h-4" />
                    </Button>
                  </div>

                  <div className="flex space-x-2">
                    <Button variant={speed === 1 ? "secondary" : "ghost"} size="sm" className="flex-1" onClick={() => changeSpeed(1)}>1x</Button>
                    <Button variant={speed === 2 ? "secondary" : "ghost"} size="sm" className="flex-1" onClick={() => changeSpeed(2)}>2x</Button>
                    <Button variant={speed === 5 ? "secondary" : "ghost"} size="sm" className="flex-1" onClick={() => changeSpeed(5)}>5x</Button>
                    <Button variant="outline" size="sm" className="flex-1" onClick={jumpToEnd}>
                      <FastForward className="w-4 h-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Right Column: Dashboard */}
          <div className="lg:col-span-9 space-y-6">
            {result && currentMetrics ? (
              <>
                <MetricsCards metrics={currentMetrics} />

                <Tabs defaultValue="charts" className="w-full">
                  <TabsList className="mb-4">
                    <TabsTrigger value="charts">Charts</TabsTrigger>
                    <TabsTrigger value="history">Trade History</TabsTrigger>
                  </TabsList>
                  
                  <TabsContent value="charts" className="space-y-6">
                    <Card>
                      <CardHeader className="flex flex-row items-center justify-between">
                        <div>
                          <CardTitle>Price & Moving Averages</CardTitle>
                          <CardDescription>Geometric Brownian Motion with 7-Day & 30-Day MA Crossovers.</CardDescription>
                        </div>
                        <Button variant="outline" size="sm" onClick={() => downloadChart('price-chart-container', 'btc-price-chart')}>
                          <ImageIcon className="w-4 h-4 mr-2" /> PNG
                        </Button>
                      </CardHeader>
                      <CardContent id="price-chart-container" className="bg-background pt-4 rounded-xl">
                        <PriceChart data={visibleData} />
                      </CardContent>
                    </Card>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <Card>
                        <CardHeader className="flex flex-row items-center justify-between">
                          <CardTitle className="text-base">Portfolio Value</CardTitle>
                          <Button variant="ghost" size="icon" onClick={() => downloadChart('portfolio-chart-container', 'portfolio-value')}>
                            <ImageIcon className="w-4 h-4 text-muted-foreground" />
                          </Button>
                        </CardHeader>
                        <CardContent id="portfolio-chart-container" className="bg-background">
                          <PortfolioChart data={visibleData} />
                        </CardContent>
                      </Card>

                      <Card>
                        <CardHeader className="flex flex-row items-center justify-between">
                          <CardTitle className="text-base">Drawdown</CardTitle>
                          <Button variant="ghost" size="icon" onClick={() => downloadChart('drawdown-chart-container', 'drawdown')}>
                            <ImageIcon className="w-4 h-4 text-muted-foreground" />
                          </Button>
                        </CardHeader>
                        <CardContent id="drawdown-chart-container" className="bg-background">
                          <DrawdownChart data={visibleData} />
                        </CardContent>
                      </Card>
                    </div>
                  </TabsContent>

                  <TabsContent value="history">
                    <Card>
                      <CardHeader className="flex flex-row items-center justify-between">
                        <div>
                          <CardTitle>Trade Ledger</CardTitle>
                          <CardDescription>
                            Showing {visibleTrades.length} trades executed up to Day {currentDayIndex + 1}.
                          </CardDescription>
                        </div>
                        <Button variant="outline" onClick={() => exportTradesToCSV(visibleTrades)}>
                          <Download className="w-4 h-4 mr-2" /> Export CSV
                        </Button>
                      </CardHeader>
                      <CardContent>
                        <TradeHistory trades={visibleTrades} />
                      </CardContent>
                    </Card>
                  </TabsContent>
                </Tabs>
              </>
            ) : (
              <div className="h-[600px] flex items-center justify-center border rounded-xl border-dashed">
                <div className="text-center text-muted-foreground">
                  {isLoading ? (
                    <div className="flex flex-col items-center">
                      <RotateCcw className="w-8 h-8 animate-spin mb-4" />
                      <p>Running complex quantitative models...</p>
                    </div>
                  ) : (
                    <p>Click &quot;Generate Simulation&quot; to start.</p>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  )
}
