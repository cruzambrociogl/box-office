import { Controller, Headers, HttpCode, Post, RawBodyRequest, Req } from '@nestjs/common';
import { Request } from 'express';
import { OrdersService } from '../orders/orders.service';
import { PaymentsService } from './payments.service';

@Controller('payments')
export class PaymentsController {
  constructor(
    private readonly paymentsService: PaymentsService,
    private readonly ordersService: OrdersService,
  ) {}

  /** Stripe calls this when a buyer has paid on the checkout page. */
  @Post('webhook')
  @HttpCode(200)
  async webhook(@Req() req: RawBodyRequest<Request>, @Headers('stripe-signature') signature: string) {
    const event = this.paymentsService.readWebhook(req.rawBody, signature);
    if (event.type === 'paid') await this.ordersService.confirmPayment(event.orderId, event.paymentIntentId);
    return { received: true };
  }
}
