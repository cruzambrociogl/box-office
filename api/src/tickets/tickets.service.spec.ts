import { JobsService } from '../jobs/jobs.service';
import { MailService } from '../mail/mail.service';
import { OrganisersService } from '../organisers/organisers.service';
import { TicketsRepository } from './tickets.repository';
import { ticketCode, TicketsService } from './tickets.service';

const paid = { orderId: 'o1', eventId: 'e1', quantity: 3, buyerEmail: 'ana@example.com', buyerName: 'Ana' };

function setup() {
  const tickets = {
    issue: jest.fn((rows: object[]) => Promise.resolve(rows)),
    forOrder: jest.fn().mockResolvedValue([{ code: 'ABCD2345' }, { code: 'EFGH6789' }]),
  } as unknown as TicketsRepository;
  const organisers = { notifySale: jest.fn() } as unknown as OrganisersService;
  const mail = { send: jest.fn() } as unknown as MailService;
  const jobs = { queue: jest.fn() } as unknown as JobsService;
  return { service: new TicketsService(tickets, organisers, mail, jobs), tickets, organisers, mail, jobs };
}

describe('Issuing tickets', () => {
  it('issues one ticket per seat and queues the email', async () => {
    const { service, jobs } = setup();
    const issued = await service.issueForOrder(paid);
    expect(issued).toHaveLength(3);
    expect(jobs.queue).toHaveBeenCalledWith(expect.objectContaining({ name: 'send-tickets' }));
  });

  it('tells the organiser about the sale', async () => {
    const { service, organisers } = setup();
    await service.issueForOrder(paid);
    expect(organisers.notifySale).toHaveBeenCalledWith({ eventId: 'e1', orderId: 'o1', quantity: 3 });
  });

  it('emails the buyer every ticket code', async () => {
    const { service, mail } = setup();
    await service.emailTickets(paid);
    expect(mail.send).toHaveBeenCalledWith('ana@example.com', 'Your tickets', expect.stringContaining('EFGH6789'));
  });

  it('makes codes the door cannot misread', () => {
    expect(ticketCode()).toMatch(/^[A-HJ-NP-Z2-9]{8}$/);
  });
});
