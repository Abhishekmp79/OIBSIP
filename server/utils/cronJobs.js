/**
 * Scheduled jobs (node-cron).
 *
 * Every 15 minutes: scan inventory for low-stock rows (quantity ≤ threshold)
 * and, if any exist, email the admin a summary. Idempotent and safe to leave
 * running — only sends when there is something to report.
 */
const cron = require('node-cron');
const Inventory = require('../models/Inventory');
const { sendMail } = require('./mailer');

function startCronJobs() {
  // Every 15 minutes: "*/15 * * * *"
  cron.schedule('*/15 * * * *', async () => {
    try {
      const low = await Inventory.find({ $expr: { $lte: ['$quantity', '$threshold'] } }).lean();
      if (low.length === 0) {
        console.log('[CRON] low-stock check: all good, nothing to report');
        return;
      }

      const rows = low
        .map(
          (i) =>
            `<tr>
               <td style="padding:6px 10px;border:1px solid #eee">${i.name} <span style="color:#888">(${i.category})</span></td>
               <td style="padding:6px 10px;border:1px solid #eee;text-align:center">${i.quantity}</td>
               <td style="padding:6px 10px;border:1px solid #eee;text-align:center">${i.threshold}</td>
               <td style="padding:6px 10px;border:1px solid #eee">${i.unit}</td>
             </tr>`
        )
        .join('');

      const recipient =
        process.env.ALERT_RECIPIENT || process.env.ADMIN_EMAIL || process.env.SMTP_USER;

      await sendMail({
        to: recipient,
        subject: `⚠️ Slice House — ${low.length} item(s) low on stock`,
        html: `
          <div style="font-family:Inter,Arial,sans-serif;max-width:640px;margin:auto">
            <h2 style="color:#dd5b2e">Low stock alert</h2>
            <p>The following inventory items have reached or fallen below their reorder threshold:</p>
            <table style="border-collapse:collapse;width:100%;font-size:14px">
              <thead>
                <tr style="background:#f6f6f6">
                  <th style="padding:6px 10px;border:1px solid #eee;text-align:left">Item</th>
                  <th style="padding:6px 10px;border:1px solid #eee">Quantity</th>
                  <th style="padding:6px 10px;border:1px solid #eee">Threshold</th>
                  <th style="padding:6px 10px;border:1px solid #eee;text-align:left">Unit</th>
                </tr>
              </thead>
              <tbody>${rows}</tbody>
            </table>
            <p style="color:#888;font-size:13px;margin-top:14px">Generated automatically by Slice House inventory monitor.</p>
          </div>`,
      });

      console.log(`[CRON] low-stock email sent for ${low.length} item(s)`);
    } catch (err) {
      console.error('[CRON] low-stock job failed:', err.message);
    }
  });

  console.log('[CRON] scheduled low-stock monitor (every 15 minutes)');
}

module.exports = startCronJobs;
