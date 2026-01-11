import { Job, JobOptions } from 'bull';
import { setTimeout } from 'timers/promises';

import { PortfolioSnapshotQueueJob } from './interfaces/portfolio-snapshot-queue-job.interface';

type PortfolioSnapshotJob = Job<PortfolioSnapshotQueueJob>;

export const PortfolioSnapshotServiceMock = {
  addJobToQueue({
    opts
  }: {
    data: PortfolioSnapshotQueueJob;
    name: string;
    opts?: JobOptions;
  }): Promise<PortfolioSnapshotJob> {
    const mockJob: Partial<PortfolioSnapshotJob> = {
      finished: async () => {
        await setTimeout(100);

        return Promise.resolve();
      }
    };

    this.jobsStore.set(opts?.jobId, mockJob);

    return Promise.resolve(mockJob as PortfolioSnapshotJob);
  },

  getJob(jobId: string): Promise<PortfolioSnapshotJob> {
    const job = this.jobsStore.get(jobId);

    return Promise.resolve(job as PortfolioSnapshotJob);
  },

  jobsStore: new Map<string, Partial<PortfolioSnapshotJob>>()
};
