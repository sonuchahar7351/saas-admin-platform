import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class EightyGRepository {
  constructor(private prisma: PrismaService) {}

  findByDonationId(donationId: string) {
    return this.prisma.eightyGApplication.findUnique({ where: { donationId } });
  }

  findById(id: string) {
    return this.prisma.eightyGApplication.findUnique({
      where: { id },
      include: {
        donation: { include: { campaign: { select: { title: true } } } },
      },
    });
  }

  create(data: {
    donationId: string;
    customerId: string;
    panNumber: string;
    fullName: string;
    email: string;
    address: string;
  }) {
    return this.prisma.eightyGApplication.create({ data });
  }

  findAllAdmin(query: { page: number; limit: number; status?: string }) {
    const where = query.status ? { status: query.status as any } : {};
    return Promise.all([
      this.prisma.eightyGApplication.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip: (query.page - 1) * query.limit,
        take: query.limit,
        include: {
          customer: { select: { name: true, email: true } },
          donation: { include: { campaign: { select: { title: true } } } },
        },
      }),
      this.prisma.eightyGApplication.count({ where }),
    ]);
  }

  approve(id: string, certificateUrl: string, reviewedById: string) {
    return this.prisma.eightyGApplication.update({
      where: { id },
      data: { status: 'APPROVED', certificateUrl, reviewedById },
    });
  }

  reject(id: string, reason: string, reviewedById: string) {
    return this.prisma.eightyGApplication.update({
      where: { id },
      data: { status: 'REJECTED', rejectionReason: reason, reviewedById },
    });
  }

  getDonationForApplication(donationId: string) {
    return this.prisma.donation.findUnique({ where: { id: donationId } });
  }
}
