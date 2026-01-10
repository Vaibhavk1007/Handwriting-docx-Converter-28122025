export type ProcessingState =
  | "idle"
  | "queued"        // ✅ add
  | "uploading"
  | "processing"
  | "preview"
  | "exporting"
  | "ready"         // ✅ add
  | "complete"
  | "error";
  
export interface DocumentSection {
  heading: string
  content: string
}

export interface DocumentStructure {
  title: string
  sections: DocumentSection[]
}
