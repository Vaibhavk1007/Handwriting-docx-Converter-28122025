"use client"

import type React from "react"

import { useCallback, useState,useRef } from "react"
import { Upload, FileImage, Shield, Info } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"

interface UploadAreaProps {
  onFileUpload: (file: File, strictMode: boolean) => void
}

export default function UploadArea({ onFileUpload }: UploadAreaProps) {
  const [isDragging, setIsDragging] = useState(false)
  const fileInputRef = useRef<HTMLInputElement | null>(null)
  const [strictMode, setStrictMode] = useState(true)
  const uploadTriggeredRef = useRef(false)


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

      if (uploadTriggeredRef.current) return
      uploadTriggeredRef.current = true

      const file = e.dataTransfer.files[0]
      if (
        file &&
        (file.type.startsWith("image/") || file.type === "application/pdf")
      ) {
        onFileUpload(file, strictMode)
      }
    },
    [onFileUpload, strictMode]
  )

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    if (uploadTriggeredRef.current) return
    uploadTriggeredRef.current = true

    onFileUpload(file, strictMode)
  }

  return (
    <div className="space-y-6">
      <div className="text-center space-y-2">
        <h2 className="text-3xl font-bold tracking-tight">Upload a handwritten or scanned document</h2>
        <p className="text-muted-foreground text-lg">Convert it into a clean, editable Word document in seconds.</p>
      </div>

      <Card
        className={`relative border-2 border-dashed transition-all ${
          isDragging ? "border-primary bg-primary/5 scale-[1.02]" : "border-border hover:border-muted-foreground/50"
        }`}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
      >
        <label htmlFor="file-upload" className="cursor-pointer">
          <div className="flex flex-col items-center justify-center py-20 px-8">
            <div className="rounded-full bg-secondary p-4 mb-4">
              <Upload className="h-10 w-10 text-secondary-foreground" />
            </div>
            <p className="text-lg font-semibold mb-2">
              Drop your file here, or <span className="text-foreground underline">browse</span>
            </p>
            <p className="text-sm text-muted-foreground mb-6">Supports JPG, PNG, PDF • Max 10MB</p>
            
            <div className="flex items-start gap-3 rounded-lg border border-border bg-muted/50 p-4">
              <input
                type="checkbox"
                checked={strictMode}
                onChange={(e) => setStrictMode(e.target.checked)}
                className="mt-1"
              />
              <div className="text-sm">
                <p className="font-medium text-foreground">
                  Strict accuracy mode
                </p>
                <p className="text-muted-foreground">
                   Best for applications, government forms, HR paperwork, and official documents.
                </p>
              </div>
            </div>
            <div className="pt-2">
            </div>
            
            <Button
              size="lg"
              type="button"
              className="shadow-md "
              onClick={() => fileInputRef.current?.click()}
            >
              <FileImage className="mr-2 h-5 w-5" />
              Select File
            </Button>
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
