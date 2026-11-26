import { Body, Controller, Post } from '@nestjs/common';
import { CheckInsService } from './check-ins.service';

@Controller('check-ins')
export class CheckInsController {
  constructor(private readonly checkInsService: CheckInsService) {}

  /** Door staff scan a ticket's code. */
  @Post()
  scan(@Body() body: { eventId: string; code: string }) {
    return this.checkInsService.scan(body);
  }
}
