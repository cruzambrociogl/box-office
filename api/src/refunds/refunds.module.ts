import { Module } from '@nestjs/common';
import { EventsModule } from '../events/events.module';
import { MailModule } from '../mail/mail.module';
import { OrdersModule } from '../orders/orders.module';
import { PaymentsModule } from '../payments/payments.module';
import { TicketsModule } from '../tickets/tickets.module';
import { RefundsController } from './refunds.controller';
import { RefundsJobs } from './refunds.jobs';
import { RefundsRepository } from './refunds.repository';
import { RefundsService } from './refunds.service';

@Module({
  imports: [EventsModule, MailModule, OrdersModule, PaymentsModule, TicketsModule],
  controllers: [RefundsController],
  providers: [RefundsRepository, RefundsService, RefundsJobs],
})
export class RefundsModule {}
