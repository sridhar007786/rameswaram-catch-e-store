// Delivery address labels PDF generator
// Generates printable shipping labels for multiple orders

export const generateDeliveryLabelsPDF = (orders: {
  id: string;
  created_at: string;
  customer_name: string;
  customer_phone: string;
  delivery_address: string;
  items: { name: string; weight?: string; quantity: number }[];
  total: number;
  payment_method?: string;
}[]) => {
  const storeAddress = 'Meenava Sonthangal\nBeach Road, Kanyakumari\nTamil Nadu 629702\n📞 +91 98765 43210';

  const labels = orders.map((order) => {
    const itemsList = order.items
      .map((i) => `${i.name}${i.weight ? ` (${i.weight})` : ''} × ${i.quantity}`)
      .join(', ');

    const date = new Date(order.created_at).toLocaleDateString('en-IN', {
      day: 'numeric', month: 'short', year: 'numeric',
    });

    return `
      <div class="label">
        <div class="label-header">
          <span class="order-id">#${order.id.slice(0, 8)}</span>
          <span class="date">${date}</span>
          <span class="payment">${(order.payment_method || 'COD').toUpperCase()}${order.payment_method === 'cod' ? ' — ₹' + order.total : ''}</span>
        </div>
        <div class="addresses">
          <div class="from-box">
            <div class="label-tag">FROM</div>
            <div class="address-content">
              <strong>Meenava Sonthangal</strong><br/>
              Beach Road, Kanyakumari<br/>
              Tamil Nadu 629702<br/>
              📞 +91 98765 43210
            </div>
          </div>
          <div class="arrow-col">▶</div>
          <div class="to-box">
            <div class="label-tag">TO</div>
            <div class="address-content">
              <strong>${order.customer_name}</strong><br/>
              ${order.delivery_address.replace(/,\s*/g, '<br/>')}<br/>
              📞 ${order.customer_phone}
            </div>
          </div>
        </div>
        <div class="items-row">
          <span class="items-tag">📦 Items:</span>
          <span class="items-list">${itemsList}</span>
        </div>
        <div class="total-row">
          <strong>Total: ₹${Number(order.total).toLocaleString()}</strong>
        </div>
      </div>
    `;
  }).join('');

  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <title>Delivery Labels — Meenava Sonthangal</title>
      <style>
        * { box-sizing: border-box; margin: 0; padding: 0; }
        body { font-family: 'Segoe UI', Arial, sans-serif; color: #1a1a2e; padding: 10px; }
        .label {
          border: 2px solid #0c4a6e;
          border-radius: 12px;
          padding: 16px 20px;
          margin-bottom: 16px;
          page-break-inside: avoid;
          background: #fff;
        }
        .label-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 12px;
          padding-bottom: 8px;
          border-bottom: 1px dashed #cbd5e1;
          font-size: 12px;
          color: #64748b;
        }
        .order-id { font-family: monospace; font-weight: 700; color: #0c4a6e; font-size: 14px; }
        .payment { background: #fef3c7; color: #92400e; padding: 2px 8px; border-radius: 10px; font-weight: 600; font-size: 11px; }
        .addresses {
          display: flex;
          align-items: stretch;
          gap: 8px;
          margin-bottom: 12px;
        }
        .from-box, .to-box {
          flex: 1;
          border: 1px solid #e2e8f0;
          border-radius: 8px;
          padding: 10px 12px;
          font-size: 12px;
          line-height: 1.5;
          position: relative;
        }
        .to-box {
          border-color: #0c4a6e;
          background: #f0f9ff;
        }
        .label-tag {
          position: absolute;
          top: -8px;
          left: 10px;
          background: #fff;
          padding: 0 6px;
          font-size: 10px;
          font-weight: 700;
          letter-spacing: 1px;
          color: #64748b;
        }
        .to-box .label-tag { background: #f0f9ff; color: #0c4a6e; }
        .arrow-col {
          display: flex;
          align-items: center;
          font-size: 18px;
          color: #0c4a6e;
          padding: 0 4px;
        }
        .items-row {
          font-size: 11px;
          color: #475569;
          padding: 6px 0;
          border-top: 1px dashed #e2e8f0;
          line-height: 1.5;
        }
        .items-tag { font-weight: 600; }
        .total-row {
          text-align: right;
          font-size: 14px;
          color: #0c4a6e;
          margin-top: 6px;
        }
        @media print {
          body { padding: 0; }
          .label { margin-bottom: 12px; }
        }
        @page { margin: 10mm; }
      </style>
    </head>
    <body>
      <div style="text-align:center;margin-bottom:16px;font-size:13px;color:#64748b;">
        🐟 Meenava Sonthangal — Delivery Labels (${orders.length} orders)
      </div>
      ${labels}
    </body>
    </html>
  `;

  const printWindow = window.open('', '_blank');
  if (printWindow) {
    printWindow.document.write(html);
    printWindow.document.close();
    setTimeout(() => printWindow.print(), 500);
  }
};
