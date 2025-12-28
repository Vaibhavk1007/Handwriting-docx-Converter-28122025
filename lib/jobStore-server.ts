import { redis } from "@/lib/redis";
import type { JobData } from "@/types/job";

const JOB_PREFIX = "job:";

/**
 * Fetch job from Redis (server-side)
 */
export async function getJob(jobId: string): Promise<JobData | null> {
  const raw = await redis.get(`${JOB_PREFIX}${jobId}`);
  return raw ? (raw as JobData) : null;
}

/**
 * Update job in Redis (server-side source of truth)
 */
export async function updateJob(
  jobId: string,
  patch: Partial<JobData>
) {
  const key = `${JOB_PREFIX}${jobId}`;
  const existing = await redis.get(key);

  if (!existing) return;

  await redis.set(key, {
    ...existing,
    ...patch,
  });
}

/**
 * Create job (when upload starts)
 */
export async function createJob(job: JobData) {
  await redis.set(`${JOB_PREFIX}${job.jobId}`, job);
}