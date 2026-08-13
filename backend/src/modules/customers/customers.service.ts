import { Injectable, NotFoundException } from '@nestjs/common';
import { CustomersRepository } from './customers.repository';

@Injectable()
export class CustomersService {
  constructor(private repo: CustomersRepository) {}

  async findAll(query: {
    page: number;
    limit: number;
    sortBy: string;
    sortOrder: 'asc' | 'desc';
    search?: string;
  }) {
    const { customers, total } = await this.repo.findAllWithTotals(query);
    return {
      data: customers,
      total,
      page: query.page,
      limit: query.limit,
      totalPages: Math.ceil(total / query.limit),
    };
  }

  async getDonationHistory(customerId: string, page = 1, limit = 10) {
    const customer = await this.repo.findById(customerId);
    if (!customer) throw new NotFoundException('Customer not found');

    const [donations, total] = await this.repo.findDonationHistory(
      customerId,
      page,
      limit,
    );
    return {
      customer,
      donations: donations.map((d) => ({
        id: d.id,
        campaignTitle: d.campaign.title,
        donorName: d.isAnonymous ? 'Anonymous' : d.billing.donorName,
        amount: d.amount,
        tipAmount: d.tipAmount,
        status: d.status,
        createdAt: d.createdAt,
      })),
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }
}
