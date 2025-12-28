"use client"

import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import type { DocumentStructure } from "@/types/document"

interface PreviewEditorProps {
  documentData: DocumentStructure
  outputStyle: "simple" | "academic" | "professional"
  onStyleChange: (style: "simple" | "academic" | "professional") => void
  onDataChange: (data: DocumentStructure) => void
}

export default function PreviewEditor({ documentData, outputStyle, onStyleChange, onDataChange }: PreviewEditorProps) {
  const styles = [
    { value: "simple", label: "Simple", description: "Clean and minimal" },
    { value: "academic", label: "Academic", description: "Formal structure" },
    { value: "professional", label: "Professional", description: "Business ready" },
  ] as const

  return (
    <Card className="p-6 space-y-6">
      <div className="space-y-2">
        <h3 className="text-2xl font-semibold">Preview & Edit</h3>
        <p className="text-muted-foreground">Review the extracted content and choose your output style</p>
      </div>

      <div className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="title">Document Title</Label>
          <Textarea
            id="title"
            value={documentData.title}
            onChange={(e) => onDataChange({ ...documentData, title: e.target.value })}
            className="text-lg font-semibold resize-none"
            rows={1}
          />
        </div>

        {documentData.sections.map((section, index) => (
          <div key={index} className="space-y-2">
            <Label htmlFor={`section-${index}-heading`}>{section.heading || `Section ${index + 1}`}</Label>
            <Textarea
              id={`section-${index}-heading`}
              value={section.heading}
              onChange={(e) => {
                const newSections = [...documentData.sections]
                newSections[index] = { ...section, heading: e.target.value }
                onDataChange({ ...documentData, sections: newSections })
              }}
              className="font-semibold resize-none mb-2"
              rows={1}
              placeholder="Section heading"
            />
            <Textarea
              id={`section-${index}-content`}
              value={section.content}
              onChange={(e) => {
                const newSections = [...documentData.sections]
                newSections[index] = { ...section, content: e.target.value }
                onDataChange({ ...documentData, sections: newSections })
              }}
              className="min-h-[120px]"
              placeholder="Section content"
            />
          </div>
        ))}
      </div>

      <div className="space-y-3">
        <Label>Output Style</Label>
        <div className="grid grid-cols-3 gap-3">
          {styles.map((style) => (
            <Button
              key={style.value}
              variant={outputStyle === style.value ? "secondary" : "outline"}
              className={`h-auto flex flex-col items-start p-4 ${outputStyle === style.value ? "" : "bg-transparent"}`}
              onClick={() => onStyleChange(style.value)}
            >
              <span className="font-semibold">{style.label}</span>
              <span className="text-xs font-normal opacity-70">{style.description}</span>
            </Button>
          ))}
        </div>
      </div>
    </Card>
  )
}
