import { Body, Controller, Get, Param, Post } from '@nestjs/common';
import { OrdersService } from './orders.service';

@Controller('orders')
export class OrdersController {
  constructor(private readonly ordersService: OrdersService) {}

  /** A buyer holds seats and is sent to Stripe to pay for them. */
  @Post()
  hold(@Body() body: { ticketTypeId: string; quantity: number; buyerName: string; buyerEmail: string }) {
    return this.ordersService.hold(body);
  }

  /** The buyer's order and its tickets. */
  @Get(':id')
  show(@Param('id') id: string) {
    return this.ordersService.show(id);
  }
}
