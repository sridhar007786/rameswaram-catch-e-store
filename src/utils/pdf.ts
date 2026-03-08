// PDF generation utility for order receipts
// Uses browser print API — no external dependencies

export const generateOrderPDF = (order: {
  id: string;
  created_at: string;
  customer_name: string;
  customer_phone: string;
  customer_email?: string | null;
  delivery_address: string;
  items: { name: string; weight?: string; quantity: number; price: number }[];
  subtotal: number;
  delivery_charge: number;
  total: number;
  payment_method?: string;
  status: string;
}) => {
  const date = new Date(order.created_at).toLocaleDateString('en-IN', {
    day: 'numeric', month: 'long', year: 'numeric',
  });

  const itemRows = order.items.map(i => `
    <tr>
      <td style="padding:8px 12px;border-bottom:1px solid #eee;">${i.name}${i.weight ? ` (${i.weight})` : ''}</td>
      <td style="padding:8px 12px;border-bottom:1px solid #eee;text-align:center;">${i.quantity}</td>
      <td style="padding:8px 12px;border-bottom:1px solid #eee;text-align:right;">₹${i.price}</td>
      <td style="padding:8px 12px;border-bottom:1px solid #eee;text-align:right;">₹${i.price * i.quantity}</td>
    </tr>
  `).join('');

  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <title>Order #${order.id.slice(0, 8)} — Meenava Sonthangal</title>
      <style>
        body { font-family: 'Segoe UI', Arial, sans-serif; padding: 40px; color: #1a1a2e; max-width: 800px; margin: 0 auto; }
        .header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 30px; border-bottom: 3px solid #0c4a6e; padding-bottom: 20px; }
        .logo { font-size: 24px; font-weight: bold; color: #0c4a6e; }
        .logo small { display: block; font-size: 12px; color: #666; font-weight: normal; }
        .badge { background: ${order.status === 'delivered' ? '#dcfce7' : order.status === 'cancelled' ? '#fecaca' : '#dbeafe'}; color: ${order.status === 'delivered' ? '#166534' : order.status === 'cancelled' ? '#991b1b' : '#1e40af'}; padding: 4px 12px; border-radius: 20px; font-size: 12px; font-weight: 600; text-transform: uppercase; }
        .info-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; margin-bottom: 30px; }
        .info-box { background: #f8fafc; padding: 16px; border-radius: 8px; }
        .info-box label { font-size: 11px; color: #64748b; text-transform: uppercase; letter-spacing: 0.5px; }
        .info-box p { margin: 4px 0 0; font-weight: 500; }
        table { width: 100%; border-collapse: collapse; margin-bottom: 20px; }
        thead { background: #0c4a6e; color: white; }
        thead th { padding: 10px 12px; text-align: left; font-size: 13px; }
        thead th:nth-child(2), thead th:nth-child(3), thead th:nth-child(4) { text-align: center; }
        thead th:last-child { text-align: right; }
        .totals { text-align: right; margin-top: 10px; }
        .totals div { margin: 6px 0; font-size: 14px; }
        .totals .grand { font-size: 20px; font-weight: bold; color: #0c4a6e; border-top: 2px solid #0c4a6e; padding-top: 10px; margin-top: 10px; }
        .footer { margin-top: 40px; text-align: center; font-size: 12px; color: #94a3b8; border-top: 1px solid #e2e8f0; padding-top: 20px; }
        @media print { body { padding: 20px; } }
      </style>
    </head>
    <body>
      <div class="header">
        <div class="logo">
          🐟 Meenava Sonthangal
          <small>Fresh Seafood from Kanyakumari</small>
        </div>
        <div>
          <span class="badge">${order.status}</span>
        </div>
      </div>

      <div class="info-grid">
        <div class="info-box">
          <label>Order ID</label>
          <p>#${order.id.slice(0, 8)}</p>
        </div>
        <div class="info-box">
          <label>Date</label>
          <p>${date}</p>
        </div>
        <div class="info-box">
          <label>Customer</label>
          <p>${order.customer_name}</p>
          <p style="font-size:13px;color:#64748b;">${order.customer_phone}${order.customer_email ? ` | ${order.customer_email}` : ''}</p>
        </div>
        <div class="info-box">
          <label>Delivery Address</label>
          <p style="font-size:13px;">${order.delivery_address}</p>
        </div>
      </div>

      <table>
        <thead>
          <tr>
            <th>Item</th>
            <th style="text-align:center;">Qty</th>
            <th style="text-align:right;">Price</th>
            <th style="text-align:right;">Total</th>
          </tr>
        </thead>
        <tbody>
          ${itemRows}
        </tbody>
      </table>

      <div class="totals">
        <div>Subtotal: ₹${order.subtotal.toLocaleString()}</div>
        <div>Delivery: ${order.delivery_charge === 0 ? 'FREE' : `₹${order.delivery_charge}`}</div>
        <div>Payment: ${(order.payment_method || 'COD').toUpperCase()}</div>
        <div class="grand">Total: ₹${order.total.toLocaleString()}</div>
      </div>

      <div class="footer">
        <p>Meenava Sonthangal — Fresh Seafood from Kanyakumari</p>
        <p>📞 +91 98765 43210 | 📧 orders@meenavasonthangal.com</p>
      </div>
    </body>
    </html>
  `;

  const printWindow = window.open('', '_blank');
  if (printWindow) {
    printWindow.document.write(html);
    printWindow.document.close();
    setTimeout(() => {
      printWindow.print();
    }, 500);
  }
};
