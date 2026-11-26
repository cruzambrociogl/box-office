import { ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { TicketsRepository } from '../tickets/tickets.repository';
import { CheckInsRepository } from './check-ins.repository';

@Injectable()
export class CheckInsService {
  constructor(
    private readonly checkIns: CheckInsRepository,
    private readonly tickets: TicketsRepository,
  ) {}

  /** The door scans a code: a valid ticket for this event gets in, once. */
  async scan(input: { eventId: string; code: string }) {
    const ticket = await this.tickets.findByCode(input.code.trim().toUpperCase());
    if (!ticket) throw new NotFoundException('No ticket has this code');
    if (ticket.event_id !== input.eventId) throw new ConflictException('This ticket is for another event');
    if (ticket.status === 'used') throw new ConflictException('This ticket was already scanned');
    const checkIn = await this.checkIns.record(ticket.id);
    await this.tickets.markUsed(ticket.id);
    return { admitted: true, ticketId: ticket.id, scannedAt: checkIn.scanned_at };
  }
}
