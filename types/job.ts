export type JobState =
  | "uploaded"     // file saved, ready to process
  | "processing"   // OCR + layout + LLM running
  | "ready"        // HTML ready
  | "paid"         // user paid
  | "exporting"    // docx/pdf being generated
  | "error";

export type JobData = {
  jobId: string;
  state: JobState;
  html?: string;
  // ✅ REQUIRED FOR PROCESSING
  filePath: string;
  strict: boolean;
  wordCount?: number;
  createdAt: number;
  processingTime?: number;
};