import { Controller, Get } from '@nestjs/common';

@Controller('health')
export class HealthController {
  /** Says the API is up, for the container's health check. */
  @Get()
  check() {
    return { status: 'ok' };
  }
}
