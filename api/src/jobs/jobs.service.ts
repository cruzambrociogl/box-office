import { Injectable, Logger, OnApplicationBootstrap, OnModuleDestroy } from '@nestjs/common';
import { DiscoveryService, MetadataScanner, Reflector } from '@nestjs/core';
import PgBoss from 'pg-boss';
import { JobName } from './job-names';
import { JOB_NAME } from './on-job.decorator';

/**
 * The background queue, kept in Postgres by pg-boss: no other service to run. Every method marked
 * @OnJob becomes a worker for its job when the API starts.
 */
@Injectable()
export class JobsService implements OnApplicationBootstrap, OnModuleDestroy {
  private readonly logger = new Logger(JobsService.name);
  private boss?: PgBoss;

  constructor(
    private readonly discovery: DiscoveryService,
    private readonly scanner: MetadataScanner,
    private readonly reflector: Reflector,
  ) {}

  async onApplicationBootstrap() {
    this.boss = new PgBoss(process.env.DATABASE_URL ?? '');
    this.boss.on('error', (err) => this.logger.error(err));
    await this.boss.start();
    for (const wrapper of this.discovery.getProviders()) {
      const instance = wrapper.instance as Record<string, unknown> | undefined;
      if (!instance || typeof instance !== 'object') continue;
      for (const method of this.scanner.getAllMethodNames(Object.getPrototypeOf(instance))) {
        const handler = instance[method] as (data: unknown) => Promise<void>;
        const name = this.reflector.get<JobName | undefined>(JOB_NAME, handler);
        if (!name) continue;
        await this.boss.createQueue(name);
        await this.boss.work(name, async (jobs) => {
          for (const job of jobs) await handler.call(instance, job.data);
        });
        this.logger.log(`${name} runs in ${wrapper.name}.${method}`);
      }
    }
  }

  /** Puts a job on the queue; it runs after the request that queued it has answered. */
  async queue<T extends object>(job: { name: JobName; data: T }) {
    if (!this.boss) throw new Error('The job queue has not started');
    await this.boss.send(job.name, job.data);
  }

  async onModuleDestroy() {
    await this.boss?.stop();
  }
}
