import { Module } from '@nestjs/common';
import { EventsModule } from '../events/events.module';
import { PaymentsController } from '../payments/payments.controller';
import { PaymentsModule } from '../payments/payments.module';
import { TicketsModule } from '../tickets/tickets.module';
import { OrdersController } from './orders.controller';
import { OrdersRepository } from './orders.repository';
import { OrdersSchedule } from './orders.schedule';
import { OrdersService } from './orders.service';

@Module({
  imports: [EventsModule, PaymentsModule, TicketsModule],
  controllers: [OrdersController, PaymentsController],
  providers: [OrdersRepository, OrdersService, OrdersSchedule],
  exports: [OrdersRepository],
})
export class OrdersModule {}
