import { Injectable, NotFoundException } from '@nestjs/common';
import { ReceiptsRepository } from './receipts.repository';
import { S3Service } from '../media/s3.service';
import { generateReceiptPdf } from './pdf-generator.util';

@Injectable()
export class ReceiptsService {
  constructor(
    private repo: ReceiptsRepository,
    private s3: S3Service,
  ) {}

  async generateForDonation(donationId: string) {
    const existing = await this.repo.findByDonationId(donationId);
    if (existing) return existing; // idempotent — don't regenerate if a receipt already exists

    const donation = await this.repo.getDonationForReceipt(donationId);
    if (!donation) throw new NotFoundException('Donation not found');

    const pdfBuffer = await generateReceiptPdf({
      donationId: donation.id,
      campaignTitle: donation.campaign.title,
      donorName: donation.billing.donorName,
      donorEmail: donation.billing.donorEmail,
      amount: donation.amount,
      tipAmount: donation.tipAmount,
      totalAmount: donation.amount + donation.tipAmount,
      paymentId: donation.razorpayPaymentId,
      createdAt: donation.createdAt,
      products: donation.products.map((p) => ({
        title: p.product.title,
        quantity: p.quantity,
        amount: p.amount,
      })),
    });

    const { url } = await this.s3.uploadBuffer(
      pdfBuffer,
      `receipts/${donationId}.pdf`,
      'application/pdf',
    );
    return this.repo.create(donationId, url);
  }

  async getByDonationId(donationId: string, requestingCustomerId: string) {
    const donation = await this.repo.getDonationForReceipt(donationId);
    if (!donation) throw new NotFoundException('Donation not found');
    if (donation.customerId !== requestingCustomerId) {
      throw new NotFoundException('Donation not found'); // deliberately not 403 — don't reveal it exists to a different customer
    }
    const receipt = await this.repo.findByDonationId(donationId);
    if (!receipt) throw new NotFoundException('Receipt not yet available');
    return receipt;
  }
}
