import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class ReceiptsRepository {
  constructor(private prisma: PrismaService) {}

  create(donationId: string, pdfUrl: string) {
    return this.prisma.receipt.create({ data: { donationId, pdfUrl } });
  }

  findByDonationId(donationId: string) {
    return this.prisma.receipt.findUnique({ where: { donationId } });
  }

  getDonationForReceipt(donationId: string) {
    return this.prisma.donation.findUnique({
      where: { id: donationId },
      include: {
        campaign: { select: { title: true } },
        billing: true,
        products: { include: { product: { select: { title: true } } } },
      },
    });
  }
}
