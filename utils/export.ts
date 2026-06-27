import { Trade } from "@/types";

export function exportTradesToCSV(trades: Trade[], filename = "trade-history.csv") {
  const headers = ["Day", "Type", "Price", "Amount", "Fee", "Cash After", "BTC After"];
  
  const csvContent = [
    headers.join(","),
    ...trades.map(t => [
      t.day,
      t.type,
      t.price.toFixed(2),
      t.amount.toFixed(6),
      t.fee.toFixed(2),
      t.cashAfter.toFixed(2),
      t.btcAfter.toFixed(6)
    ].join(","))
  ].join("\n");

  const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
  const link = document.createElement("a");
  if (link.download !== undefined) {
    const url = URL.createObjectURL(blob);
    link.setAttribute("href", url);
    link.setAttribute("download", filename);
    link.style.visibility = "hidden";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }
}
