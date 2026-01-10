"use client"

import type React from "react"
import { useCallback, useState, useRef } from "react"
import { Upload, FileText } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"

interface UploadAreaProps {
  onFileUpload: (file: File, strictMode: boolean) => void
  selectedFile?: File | null
  uploading?: boolean
  onConvert?: () => void
}

export default function UploadArea({
  onFileUpload,
  selectedFile,
  uploading = false,
  onConvert,
}: UploadAreaProps) {
  const [isDragging, setIsDragging] = useState(false)
  const [strictMode, setStrictMode] = useState(true)
  const fileInputRef = useRef<HTMLInputElement | null>(null)

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(true)
  }, [])

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)
  }, [])

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault()
      setIsDragging(false)

      const file = e.dataTransfer.files[0]
      if (file && (file.type.startsWith("image/") || file.type === "application/pdf")) {
        onFileUpload(file, strictMode)
      }
    },
    [onFileUpload, strictMode]
  )

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    onFileUpload(file, strictMode)
  }

  return (
    <div className="space-y-6">
      {/* Heading */}
      <div className="text-center space-y-2">
        <h2 className="text-3xl font-bold tracking-tight">
          Upload a handwritten or scanned document
        </h2>
        <p className="text-muted-foreground text-lg">
          Convert it into a clean, editable Word document in seconds.
        </p>
      </div>

      {/* Upload Card */}
      <Card
        className={`relative border-2 border-dashed transition-all ${
          isDragging
            ? "border-primary bg-primary/5"
            : "border-border hover:border-muted-foreground/50"
        }`}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
      >
        <label htmlFor="file-upload" className="cursor-pointer">
          <div className="flex flex-col items-center px-8 py-16 text-center">
            {/* Icon */}
            <div className="mb-5 rounded-full bg-primary/10 p-4">
              <Upload className="h-8 w-8 text-primary" />
            </div>

            {/* Instructions */}
            <p className="text-lg font-semibold">
              Drop your file here, or <span className="underline">browse</span>
            </p>
            <p className="mt-1 text-sm text-muted-foreground">
              Supports JPG, PNG, PDF • Max 10MB
            </p>

            {/* Strict Mode */}
            <div className="mt-8 w-full max-w-md rounded-lg border bg-muted/40 p-4 text-left">
              <label className="flex items-start gap-3">
                <input
                  type="checkbox"
                  checked={strictMode}
                  onChange={(e) => setStrictMode(e.target.checked)}
                  className="mt-1"
                />
                <div>
                  <p className="font-medium">Strict accuracy mode</p>
                  <p className="text-sm text-muted-foreground">
                    Best for government forms, applications, and official documents.
                  </p>
                </div>
              </label>
            </div>

            {/* Selected file + CTA */}
            {selectedFile ? (
              <div className="mt-8 w-full max-w-md space-y-4">
                <div className="flex items-center justify-center gap-2 rounded-md bg-muted/40 px-4 py-2 text-sm">
                  <FileText className="h-4 w-4 text-muted-foreground" />
                  <span className="font-medium">{selectedFile.name}</span>
                </div>

                <Button
                  size="lg"
                  className="w-full"
                  disabled={uploading}
                  onClick={(e) => {
                    e.preventDefault()
                    onConvert?.()
                  }}
                >
                  {uploading ? "Converting…" : "Convert to Word"}
                </Button>
              </div>
            ) : (
              <Button
                size="lg"
                className="mt-8"
                type="button"
                onClick={() => fileInputRef.current?.click()}
              >
                Select File
              </Button>
            )}
          </div>

          <input
            ref={fileInputRef}
            id="file-upload"
            type="file"
            className="sr-only"
            accept="image/*,.pdf"
            onChange={handleFileSelect}
          />
        </label>
      </Card>
    </div>
  )
}
