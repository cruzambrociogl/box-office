import { Module } from '@nestjs/common';
import { OrganisersController } from './organisers.controller';
import { OrganisersRepository } from './organisers.repository';
import { OrganisersService } from './organisers.service';

@Module({
  controllers: [OrganisersController],
  providers: [OrganisersRepository, OrganisersService],
  exports: [OrganisersRepository, OrganisersService],
})
export class OrganisersModule {}
