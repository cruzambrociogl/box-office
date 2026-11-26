import { Body, Controller, Get, Param, Post } from '@nestjs/common';
import { EventsService } from './events.service';

@Controller('events')
export class EventsController {
  constructor(private readonly eventsService: EventsService) {}

  /** An organiser creates an event, as a draft. */
  @Post()
  create(@Body() body: { organiserId: string; title: string; description?: string; venue: string; startsAt: string }) {
    return this.eventsService.createDraft(body);
  }

  /** An organiser adds a kind of ticket to a draft: its name, price and seats. */
  @Post(':id/ticket-types')
  addTicketType(@Param('id') id: string, @Body() body: { name: string; priceCents: number; capacity: number }) {
    return this.eventsService.addTicketType(id, body);
  }

  /** An organiser puts the event on sale. */
  @Post(':id/publish')
  publish(@Param('id') id: string) {
    return this.eventsService.publish(id);
  }

  /** What buyers can see: the events on sale that are still to come. */
  @Get()
  upcoming() {
    return this.eventsService.upcoming();
  }

  /** One event with its ticket types. */
  @Get(':id')
  show(@Param('id') id: string) {
    return this.eventsService.show(id);
  }
}
