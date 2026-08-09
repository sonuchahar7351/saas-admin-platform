import { Module } from '@nestjs/common';
import { APP_GUARD, APP_INTERCEPTOR } from '@nestjs/core';
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

@Module({
  imports: [
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
  ],
  providers: [
    { provide: APP_GUARD, useClass: JwtAuthGuard },
    { provide: APP_GUARD, useClass: RolesGuard },
    { provide: APP_GUARD, useClass: PermissionsGuard },
    { provide: APP_INTERCEPTOR, useClass: AuditLogInterceptor },
  ],
})
export class AppModule {}
