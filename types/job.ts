export type JobState =
  | "uploaded"
  | "processing"
  | "ready"
  | "free-ready"
  | "paid"
  | "exporting"
  | "error";

export type TipTapDoc = {
  type: "doc";
  content: any[];
};

export type JobData = {
  jobId: string;
  state: JobState;

  // ✅ SOURCE OF TRUTH
  contentJson?: TipTapDoc;

  // ⚠️ OPTIONAL / LEGACY
  html?: string;

  // ✅ REQUIRED FOR PROCESSING
  filePath: string;
  strict: boolean;

  wordCount?: number;
  createdAt: number;
  processingTime?: number;
  source?: "scanned" | "digital-pdf";

  // 🧠 CLIENT-ONLY (NOT persisted)
  file?: File;
};
