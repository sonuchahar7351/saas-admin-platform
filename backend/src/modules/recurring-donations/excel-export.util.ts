import ExcelJS from 'exceljs';

export async function buildRecurringWorkbook(
  items: any[],
): Promise<ExcelJS.Buffer> {
  const workbook = new ExcelJS.Workbook();
  const sheet = workbook.addWorksheet('Recurring Donations');

  sheet.columns = [
    { header: 'Campaign', key: 'campaign', width: 28 },
    { header: 'Donor Name', key: 'donorName', width: 22 },
    { header: 'Donor Email', key: 'donorEmail', width: 26 },
    { header: 'Amount / cycle (₹)', key: 'amount', width: 16 },
    { header: 'Frequency', key: 'frequency', width: 12 },
    { header: 'Status', key: 'status', width: 14 },
    { header: 'Subscription ID', key: 'subId', width: 26 },
    { header: 'Created', key: 'createdAt', width: 20 },
  ];
  sheet.getRow(1).font = { bold: true };
  sheet.views = [{ state: 'frozen', ySplit: 1 }];

  items.forEach((r) => {
    sheet.addRow({
      campaign: r.campaign.title,
      donorName: r.billing.donorName,
      donorEmail: r.billing.donorEmail,
      amount: r.amount / 100,
      frequency: r.frequency,
      status: r.status,
      subId: r.razorpaySubscriptionId,
      createdAt: r.createdAt.toLocaleString('en-IN'),
    });
  });
  sheet.getColumn('amount').numFmt = '₹#,##0.00';
  return workbook.xlsx.writeBuffer();
}
