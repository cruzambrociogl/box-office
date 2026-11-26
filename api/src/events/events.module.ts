import { Module } from '@nestjs/common';
import { EventsController } from './events.controller';
import { EventsRepository } from './events.repository';
import { EventsService } from './events.service';
import { TicketTypesRepository } from './ticket-types.repository';

@Module({
  controllers: [EventsController],
  providers: [EventsRepository, TicketTypesRepository, EventsService],
  exports: [EventsRepository, TicketTypesRepository],
})
export class EventsModule {}
