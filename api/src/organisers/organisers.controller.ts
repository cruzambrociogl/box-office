import { Controller, Get } from '@nestjs/common';
import { OrganisersService } from './organisers.service';

@Controller('organisers')
export class OrganisersController {
  constructor(private readonly organisersService: OrganisersService) {}

  /** The organisers an event can be created for. */
  @Get()
  list() {
    return this.organisersService.list();
  }
}
