import { Module } from '@nestjs/common';
import { APP_GUARD, APP_INTERCEPTOR } from '@nestjs/core';
import { ThrottlerModule, ThrottlerGuard } from '@nestjs/throttler';
import { PrismaModule } from './prisma/prisma.module';
import { AuthModule } from './modules/auth/auth.module';
import { JwtAuthGuard } from './common/gaurds/jwt.gaurd';
import { RolesGuard } from './common/gaurds/roles.guard';
import { PermissionsGuard } from './common/gaurds/permission.gaurd';
import { UsersModule } from './modules/users/users.module';
import { PermissionsModule } from './modules/permissions/permissions.module';
import { AuditLogInterceptor } from './common/interceptors/audit-log.interceptor';
import { AuditLogsModule } from './modules/audit-logs/audit-logs.module';
import { AiModule } from './modules/ai/ai.module';
import { RolesModule } from './modules/roles/roles.module';
import { CustomerAuthModule } from './modules/customer-auth/customer-auth.module';
import { CategoriesModule } from './modules/categories/categories.module';
import { NgoModule } from './modules/ngos/ngo.module';
import { MediaModule } from './modules/media/media.module';
import { CampaignsModule } from './modules/campaigns/campaigns.module';
import { DonationsModule } from './modules/donations/donations.module';
import { AnalyticsModule } from './modules/analytics/analytics.module';
import { ProductsModule } from './modules/products/products.module';
import { UpdatesModule } from './modules/updates/updates.module';
import { JourneyModule } from './modules/journey/journey.module';
import { TestimonialsModule } from './modules/testimonials/testimonials.module';
import { ReceiptsModule } from './modules/receipts/receipts.module';
import { CustomersModule } from './modules/customers/customers.module';
import { EightyGModule } from './modules/eighty-g/eighty-g.module';
import { RecurringDonationsModule } from './modules/recurring-donations/recurring-donations.module';
import { QueuesModule } from './queues/queues.module';
import { EmailQueueModule } from './queues/email/email-queue.module';
import { ReceiptsQueueModule } from './queues/receipts/receipts-queue.module';
import { EmailModule } from './modules/email/email.module';
import { RedisModule } from './modules/radis/radic.module';
import { PermissionsCacheModule } from './common/permissions-cache/permissions-cache.module';
import { CacheModule } from './common/cache/cashe.module';
import { ReportsQueueModule } from './queues/reports/reports-queue.module';
import { CampaignStatusQueueModule } from './queues/campaign-status/campaign-status-queue.module';

@Module({
  imports: [
    ThrottlerModule.forRoot([{ ttl: 60000, limit: 100 }]),
    RedisModule,
    PermissionsCacheModule,
    PrismaModule,
    AuthModule,
    UsersModule,
    PermissionsModule,
    AuditLogsModule,
    AiModule,
    RolesModule,
    CustomerAuthModule,
    CategoriesModule,
    NgoModule,
    MediaModule,
    CampaignsModule,
    DonationsModule,
    AnalyticsModule,
    ProductsModule,
    UpdatesModule,
    JourneyModule,
    TestimonialsModule,
    ReceiptsModule,
    CustomersModule,
    EightyGModule,
    RecurringDonationsModule,
    QueuesModule,
    EmailQueueModule,
    ReceiptsQueueModule,
    EmailModule,
    CacheModule,
    ReportsQueueModule,
    CampaignStatusQueueModule,
  ],
  providers: [
    { provide: APP_GUARD, useClass: ThrottlerGuard },
    { provide: APP_GUARD, useClass: JwtAuthGuard },
    { provide: APP_GUARD, useClass: RolesGuard },
    { provide: APP_GUARD, useClass: PermissionsGuard },
    { provide: APP_INTERCEPTOR, useClass: AuditLogInterceptor },
  ],
})
export class AppModule {}
