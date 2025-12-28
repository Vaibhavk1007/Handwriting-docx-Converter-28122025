export type ProcessingState = "idle" | "uploading" | "processing" | "preview" | "exporting" | "complete" | "error"

export interface DocumentSection {
  heading: string
  content: string
}

export interface DocumentStructure {
  title: string
  sections: DocumentSection[]
}
