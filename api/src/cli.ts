import 'reflect-metadata';
import { CommandFactory } from 'nest-commander';
import { CliModule } from './cli.module';
import { migrate } from './database/migrate';

async function main() {
  await migrate(process.env.DATABASE_URL ?? '');
  await CommandFactory.run(CliModule, ['warn', 'error']);
}

main();
