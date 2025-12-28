import { JobData } from "@/types/job";

const STORAGE_KEY = "handwritten_job";

/* ================= SAVE (FULL OBJECT ONLY) ================= */
export function saveJob(job: JobData) {
  if (typeof window === "undefined") return;

  if (!job.jobId) {
    console.error("❌ saveJob called without jobId", job);
    return;
  }

  localStorage.setItem(STORAGE_KEY, JSON.stringify(job));
}

/* ================= LOAD ================= */
export function loadJob(): JobData | null {
  if (typeof window === "undefined") return null;

  const raw = localStorage.getItem(STORAGE_KEY);
  if (!raw) return null;

  try {
    return JSON.parse(raw) as JobData;
  } catch {
    return null;
  }
}

/* ================= READ-ONLY ================= */
export function getJob(): JobData | null {
  return loadJob();
}

/* ================= PATCH UPDATE (SAFE) ================= */
export function updateJob(patch: Partial<JobData>) {
  const existing = loadJob();
  if (!existing) return;

  // ❗ jobId is immutable
  const next: JobData = {
    ...existing,
    ...patch,
    jobId: existing.jobId,
  };

  saveJob(next);
}

/* ================= CLEAR ================= */
export function clearJob() {
  if (typeof window === "undefined") return;
  localStorage.removeItem(STORAGE_KEY);
}
