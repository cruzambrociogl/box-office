import { Controller, Param, Post } from '@nestjs/common';
import { RefundsService } from './refunds.service';

@Controller('orders')
export class RefundsController {
  constructor(private readonly refundsService: RefundsService) {}

  /** A buyer asks for their money back. */
  @Post(':id/refund')
  refund(@Param('id') id: string) {
    return this.refundsService.refund(id);
  }
}
