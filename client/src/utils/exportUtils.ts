export function exportToCSV(filename: string, headers: string[], rows: (string | number)[][]) {
  const processCell = (cell: string | number) => {
    let str = String(cell ?? "");
    if (str.includes(",") || str.includes('"') || str.includes("\n")) {
      str = `"${str.replace(/"/g, '""')}"`;
    }
    return str;
  };

  const csvContent = "\uFEFF" + [
    headers.map(processCell).join(";"),
    ...rows.map(row => row.map(processCell).join(";"))
  ].join("\r\n");

  const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.setAttribute("href", url);
  link.setAttribute("download", `${filename}_${new Date().toISOString().split("T")[0]}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

export function printReceipt(receiptHtml: string) {
  const printWindow = window.open("", "_blank", "width=800,height=700");
  if (printWindow) {
    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>Tahsilat Makbuzu</title>
          <style>
            body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; margin: 30px; color: #172b2b; }
            .receipt-box { border: 2px solid #172b2b; padding: 24px; border-radius: 8px; max-width: 650px; margin: auto; }
            .header { display: flex; justify-content: space-between; border-bottom: 2px solid #e4eae3; padding-bottom: 12px; }
            .logo { font-size: 20px; font-weight: 800; }
            .title { font-size: 16px; font-weight: bold; text-align: right; }
            .row { display: flex; justify-content: space-between; padding: 8px 0; border-bottom: 1px dashed #e4eae3; font-size: 13px; }
            .total-row { display: flex; justify-content: space-between; padding: 14px 0; font-size: 16px; font-weight: bold; border-top: 2px solid #172b2b; margin-top: 10px; }
            .footer { margin-top: 24px; display: flex; justify-content: space-between; font-size: 11px; color: #666; }
            .sign { border-top: 1px solid #999; width: 140px; text-align: center; padding-top: 5px; margin-top: 40px; }
            @media print {
              body { margin: 0; }
              .no-print { display: none; }
            }
          </style>
        </head>
        <body>
          ${receiptHtml}
          <div class="no-print" style="text-align:center; margin-top:20px;">
            <button onclick="window.print()" style="padding:10px 20px; background:#172b2b; color:white; border:0; border-radius:6px; cursor:pointer; font-weight:bold;">Yazdır / PDF Olarak Kaydet</button>
          </div>
        </body>
      </html>
    `);
    printWindow.document.close();
  }
}
