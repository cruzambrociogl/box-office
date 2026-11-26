import { Injectable } from '@nestjs/common';
import { OnJob } from '../jobs/on-job.decorator';
import { RefundsService } from './refunds.service';

@Injectable()
export class RefundsJobs {
  constructor(private readonly refundsService: RefundsService) {}

  /** Queued when Stripe has given the money back. */
  @OnJob({ name: 'send-refund-confirmation' })
  async sendRefundConfirmation(data: { email: string; name: string; title: string; amountCents: number }) {
    await this.refundsService.confirm(data);
  }
}
