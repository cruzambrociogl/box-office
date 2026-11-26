import { SetMetadata } from '@nestjs/common';
import { JobName } from './job-names';

export const JOB_NAME = 'box-office:job';

/** Marks the method that runs a background job. JobsService finds it at start-up and gives it the job's data. */
export const OnJob = (options: { name: JobName }) => SetMetadata(JOB_NAME, options.name);
