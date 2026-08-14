import ExcelJS from 'exceljs';

export async function buildDonationsWorkbook(
  donations: any[],
): Promise<ExcelJS.Buffer> {
  const workbook = new ExcelJS.Workbook();
  const sheet = workbook.addWorksheet('Donations');

  sheet.columns = [
    { header: 'Campaign', key: 'campaign', width: 28 },
    { header: 'Donor Name', key: 'donorName', width: 22 },
    { header: 'Donor Email', key: 'donorEmail', width: 26 },
    { header: 'Amount (₹)', key: 'amount', width: 14 },
    { header: 'Tip (₹)', key: 'tip', width: 12 },
    { header: 'Total (₹)', key: 'total', width: 14 },
    { header: 'Payment ID', key: 'paymentId', width: 24 },
    { header: 'Payment Reference', key: 'orderId', width: 24 },
    { header: 'Status', key: 'status', width: 12 },
    { header: 'Type', key: 'type', width: 10 },
    { header: 'Created', key: 'createdAt', width: 20 },
  ];
  sheet.getRow(1).font = { bold: true };
  sheet.views = [{ state: 'frozen', ySplit: 1 }]; // freeze header row

  donations.forEach((d) => {
    sheet.addRow({
      campaign: d.campaign.title,
      donorName: d.isAnonymous ? 'Anonymous' : d.billing.donorName,
      donorEmail: d.isAnonymous ? '—' : d.billing.donorEmail,
      amount: d.amount / 100,
      tip: d.tipAmount / 100,
      total: (d.amount + d.tipAmount) / 100,
      paymentId: d.razorpayPaymentId || '—',
      orderId: d.razorpayOrderId,
      status: d.status,
      type: d.donationType,
      createdAt: d.createdAt.toLocaleString('en-IN'),
    });
  });

  sheet.getColumn('amount').numFmt = '₹#,##0.00';
  sheet.getColumn('tip').numFmt = '₹#,##0.00';
  sheet.getColumn('total').numFmt = '₹#,##0.00';

  return workbook.xlsx.writeBuffer();
}
