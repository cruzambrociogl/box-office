import { Module } from '@nestjs/common';
import { TicketsModule } from '../tickets/tickets.module';
import { CheckInsController } from './check-ins.controller';
import { CheckInsRepository } from './check-ins.repository';
import { CheckInsService } from './check-ins.service';

@Module({
  imports: [TicketsModule],
  controllers: [CheckInsController],
  providers: [CheckInsRepository, CheckInsService],
})
export class CheckInsModule {}
