import { Controller, Get, Param, Query } from '@nestjs/common';
import { CustomersService } from './customers.service';
import { QueryCustomersDto } from './dto/query-customers.dto';
import { RequirePermission } from '../../common/decorators/permission.decorator';

@Controller('customers')
export class CustomersController {
  constructor(private service: CustomersService) {}

  @RequirePermission('customers', 'read')
  @Get()
  findAll(@Query() query: QueryCustomersDto) {
    return this.service.findAll(query);
  }

  @RequirePermission('customers', 'read')
  @Get(':id/donations')
  getDonationHistory(
    @Param('id') id: string,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
  ) {
    return this.service.getDonationHistory(
      id,
      page ? Number(page) : undefined,
      limit ? Number(limit) : undefined,
    );
  }
}
