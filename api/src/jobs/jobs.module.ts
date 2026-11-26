import { Global, Module } from '@nestjs/common';
import { DiscoveryModule } from '@nestjs/core';
import { JobsService } from './jobs.service';

@Global()
@Module({
  imports: [DiscoveryModule],
  providers: [JobsService],
  exports: [JobsService],
})
export class JobsModule {}
