import { Injectable, Logger } from '@nestjs/common';
import { Interval } from '@nestjs/schedule';
import { OrdersService } from './orders.service';

@Injectable()
export class OrdersSchedule {
  private readonly logger = new Logger(OrdersSchedule.name);

  constructor(private readonly ordersService: OrdersService) {}

  /** Every minute, seats held by buyers who never paid go back on sale. */
  @Interval(60000)
  async expireHolds() {
    const expired = await this.ordersService.expireHolds();
    if (expired > 0) this.logger.log(`${expired} unpaid holds expired`);
  }
}
