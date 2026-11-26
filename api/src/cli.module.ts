import { Module } from '@nestjs/common';
import { DatabaseModule } from './database/database.module';
import { EventsModule } from './events/events.module';
import { OrganisersModule } from './organisers/organisers.module';
import { SeedCommand } from './seed/seed.command';

@Module({
  imports: [DatabaseModule, OrganisersModule, EventsModule],
  providers: [SeedCommand],
})
export class CliModule {}
