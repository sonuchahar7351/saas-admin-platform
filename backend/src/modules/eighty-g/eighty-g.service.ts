import {
  Injectable,
  NotFoundException,
  ConflictException,
  BadRequestException,
} from '@nestjs/common';
import { EightyGRepository } from './eighty-g.repository';
import { EmailService } from '../customer-auth/email.service';
import { S3Service } from '../media/s3.service';
import { ApplyEightyGDto } from './dto/eighty-g.dto';

@Injectable()
export class EightyGService {
  constructor(
    private repo: EightyGRepository,
    private emailService: EmailService,
    private s3: S3Service,
  ) {}

  async apply(dto: ApplyEightyGDto) {
    const donation = await this.repo.getDonationForApplication(dto.donationId);
    if (!donation) throw new NotFoundException('Donation not found');
    if (donation.status !== 'PAID') {
      throw new BadRequestException(
        'You can only apply for an 80G certificate after a successful donation.',
      );
    }

    // friendly pre-check — the @unique constraint on donationId is the real guarantee against a race
    const existing = await this.repo.findByDonationId(dto.donationId);
    if (existing) {
      throw new ConflictException(
        'You have already applied for an 80G certificate for this donation.',
      );
    }

    try {
      return await this.repo.create({
        donationId: dto.donationId,
        customerId: donation.customerId,
        panNumber: dto.panNumber,
        fullName: dto.fullName,
        email: dto.email,
        address: dto.address,
      });
    } catch (err: any) {
      if (err.code === 'P2002') {
        // race condition: two near-simultaneous requests both passed the pre-check above
        throw new ConflictException(
          'You have already applied for an 80G certificate for this donation.',
        );
      }
      throw err;
    }
  }

  async getStatus(donationId: string) {
    const application = await this.repo.findByDonationId(donationId);
    if (!application) return { applied: false };
    return {
      applied: true,
      status: application.status,
      certificateUrl: application.certificateUrl,
      rejectionReason: application.rejectionReason,
    };
  }

  findAllAdmin(query: { page: number; limit: number; status?: string }) {
    return this.repo.findAllAdmin(query).then(([data, total]) => ({
      data,
      total,
      page: query.page,
      limit: query.limit,
      totalPages: Math.ceil(total / query.limit),
    }));
  }

  async approve(
    id: string,
    file: { buffer: Buffer; mimetype: string; originalname: string },
    reviewedById: string,
  ) {
    const application = await this.repo.findById(id);
    if (!application) throw new NotFoundException('Application not found');
    if (application.status !== 'PENDING') {
      throw new BadRequestException(
        `This application has already been ${application.status.toLowerCase()}.`,
      );
    }

    const { url } = await this.s3.uploadBuffer(
      file.buffer,
      `certificates/80g-${id}-${Date.now()}.pdf`,
      file.mimetype,
    );

    const updated = await this.repo.approve(id, url, reviewedById);
    await this.emailService.sendCertificateEmail(
      application.email,
      application.fullName,
      url,
    );
    return updated;
  }

  async reject(id: string, reason: string, reviewedById: string) {
    const application = await this.repo.findById(id);
    if (!application) throw new NotFoundException('Application not found');
    if (application.status !== 'PENDING') {
      throw new BadRequestException(
        `This application has already been ${application.status.toLowerCase()}.`,
      );
    }

    const updated = await this.repo.reject(id, reason, reviewedById);
    await this.emailService.sendApplicationRejectedEmail(
      application.email,
      application.fullName,
      reason,
    );
    return updated;
  }
}
