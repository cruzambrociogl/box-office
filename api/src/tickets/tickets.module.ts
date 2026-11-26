import { Module } from '@nestjs/common';
import { MailModule } from '../mail/mail.module';
import { OrganisersModule } from '../organisers/organisers.module';
import { TicketsJobs } from './tickets.jobs';
import { TicketsRepository } from './tickets.repository';
import { TicketsService } from './tickets.service';

@Module({
  imports: [MailModule, OrganisersModule],
  providers: [TicketsRepository, TicketsService, TicketsJobs],
  exports: [TicketsRepository],
})
export class TicketsModule {}
