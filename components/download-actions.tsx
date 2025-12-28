"use client"

import { Button } from "@/components/ui/button"
import { Download, RotateCcw, CheckCircle2 } from "lucide-react"

interface DownloadActionsProps {
  onDownload?: () => void
  onReset: () => void
  showSuccess?: boolean
}

export default function DownloadActions({ onDownload, onReset, showSuccess }: DownloadActionsProps) {
  return (
    <div className="flex flex-col sm:flex-row gap-4 items-center justify-center">
      {showSuccess && (
        <div className="flex items-center gap-2 text-primary">
          <CheckCircle2 className="h-5 w-5" />
          <p className="font-medium">Document downloaded successfully!</p>
        </div>
      )}
      {onDownload && (
        <Button size="lg" onClick={onDownload} className="min-w-[200px]">
          <Download className="mr-2 h-5 w-5" />
          Download as Word (.docx)
        </Button>
      )}
      <Button size="lg" variant="outline" onClick={onReset} className="min-w-[200px] bg-transparent">
        <RotateCcw className="mr-2 h-5 w-5" />
        Convert Another File
      </Button>
    </div>
  )
}
