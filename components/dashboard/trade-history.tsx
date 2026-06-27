import { Trade } from "@/types"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { ScrollArea } from "@/components/ui/scroll-area"
import { formatCurrency, formatNumber } from "@/lib/utils"

interface TradeHistoryProps {
  trades: Trade[]
}

export function TradeHistory({ trades }: TradeHistoryProps) {
  if (trades.length === 0) {
    return (
      <div className="flex h-40 items-center justify-center text-muted-foreground">
        No trades executed yet.
      </div>
    )
  }

  return (
    <ScrollArea className="h-[400px]">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Day</TableHead>
            <TableHead>Type</TableHead>
            <TableHead className="text-right">Price</TableHead>
            <TableHead className="text-right">Amount (BTC)</TableHead>
            <TableHead className="text-right">Fee</TableHead>
            <TableHead className="text-right">Cash After</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {trades.map((trade, i) => (
            <TableRow key={i}>
              <TableCell className="font-medium">{trade.day}</TableCell>
              <TableCell>
                <Badge variant={trade.type === 'BUY' ? 'default' : 'destructive'} className={trade.type === 'BUY' ? 'bg-emerald-500' : ''}>
                  {trade.type}
                </Badge>
              </TableCell>
              <TableCell className="text-right">{formatCurrency(trade.price)}</TableCell>
              <TableCell className="text-right">{formatNumber(trade.amount)}</TableCell>
              <TableCell className="text-right">{formatCurrency(trade.fee)}</TableCell>
              <TableCell className="text-right">{formatCurrency(trade.cashAfter)}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </ScrollArea>
  )
}
