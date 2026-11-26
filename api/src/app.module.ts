import { Module } from '@nestjs/common';
import { ScheduleModule } from '@nestjs/schedule';
import { CheckInsModule } from './check-ins/check-ins.module';
import { DatabaseModule } from './database/database.module';
import { EventsModule } from './events/events.module';
import { HealthController } from './health/health.controller';
import { JobsModule } from './jobs/jobs.module';
import { OrdersModule } from './orders/orders.module';
import { OrganisersModule } from './organisers/organisers.module';
import { RefundsModule } from './refunds/refunds.module';
import { RemindersModule } from './reminders/reminders.module';

@Module({
  imports: [ScheduleModule.forRoot(), DatabaseModule, JobsModule, OrganisersModule, EventsModule, OrdersModule, CheckInsModule, RefundsModule, RemindersModule],
  controllers: [HealthController],
})
export class AppModule {}
