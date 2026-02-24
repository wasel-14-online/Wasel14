type JobHandler = (data: any) => Promise<void>;

interface Job {
  id: string;
  type: string;
  data: any;
  attempts: number;
  maxAttempts: number;
  createdAt: number;
}

class QueueService {
  private queues: Map<string, Job[]> = new Map();
  private handlers: Map<string, JobHandler> = new Map();
  private processing: Set<string> = new Set();

  registerHandler(jobType: string, handler: JobHandler) {
    this.handlers.set(jobType, handler);
  }

  async addJob(jobType: string, data: any, maxAttempts = 3): Promise<string> {
    const job: Job = {
      id: `${jobType}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      type: jobType,
      data,
      attempts: 0,
      maxAttempts,
      createdAt: Date.now()
    };

    const queue = this.queues.get(jobType) || [];
    queue.push(job);
    this.queues.set(jobType, queue);

    this.processQueue(jobType);
    return job.id;
  }

  private async processQueue(jobType: string) {
    if (this.processing.has(jobType)) return;

    this.processing.add(jobType);
    const queue = this.queues.get(jobType) || [];
    const handler = this.handlers.get(jobType);

    while (queue.length > 0) {
      const job = queue.shift();
      if (!job || !handler) continue;

      try {
        await handler(job.data);
      } catch (error) {
        job.attempts++;
        if (job.attempts < job.maxAttempts) {
          queue.push(job);
        } else {
          console.error(`Job ${job.id} failed after ${job.maxAttempts} attempts`, error);
        }
      }
    }

    this.processing.delete(jobType);
  }

  getQueueSize(jobType: string): number {
    return (this.queues.get(jobType) || []).length;
  }
}

export const queueService = new QueueService();
