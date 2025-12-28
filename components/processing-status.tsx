import { Loader2, CheckCircle2, FileSearch, Sparkles, FileCheck } from "lucide-react"
import { Card } from "@/components/ui/card"
import type { ProcessingState } from "@/types/document"

interface ProcessingStatusProps {
  state: ProcessingState
}

export default function ProcessingStatus({ state }: ProcessingStatusProps) {
  const steps = [
    { key: "uploading", label: "Reading handwriting", icon: FileSearch },
    { key: "processing", label: "Understanding structure", icon: Sparkles },
    { key: "exporting", label: "Creating document", icon: FileCheck },
  ]

  const getCurrentStep = () => {
    if (state === "uploading") return 0
    if (state === "processing") return 1
    if (state === "exporting") return 2
    if (state === "complete") return 3
    return 0
  }

  const currentStep = getCurrentStep()

  return (
    <Card className="p-8">
      <div className="space-y-8">
        <div className="text-center space-y-2">
          <h3 className="text-2xl font-semibold">
            {state === "complete" ? "Document Ready!" : "Processing Your Document"}
          </h3>
          <p className="text-muted-foreground">
            {state === "complete"
              ? "Your document has been successfully created"
              : "Please wait while we convert your handwritten notes"}
          </p>
        </div>

        <div className="space-y-4">
          {steps.map((step, index) => {
            const Icon = step.icon
            const isComplete = index < currentStep
            const isActive = index === currentStep
            const isPending = index > currentStep

            return (
              <div
                key={step.key}
                className={`flex items-center gap-4 p-4 rounded-lg border transition-all ${
                  isActive
                    ? "border-primary bg-primary/5"
                    : isComplete
                      ? "border-border bg-muted/30"
                      : "border-border/50 bg-background"
                }`}
              >
                <div
                  className={`flex h-10 w-10 items-center justify-center rounded-full ${
                    isComplete
                      ? "bg-primary/10 text-primary"
                      : isActive
                        ? "bg-primary text-primary-foreground"
                        : "bg-muted text-muted-foreground"
                  }`}
                >
                  {isComplete ? (
                    <CheckCircle2 className="h-5 w-5" />
                  ) : isActive ? (
                    <Loader2 className="h-5 w-5 animate-spin" />
                  ) : (
                    <Icon className="h-5 w-5" />
                  )}
                </div>
                <div className="flex-1">
                  <p className={`font-medium ${isActive || isComplete ? "text-foreground" : "text-muted-foreground"}`}>
                    {step.label}
                  </p>
                </div>
              </div>
            )
          })}
        </div>

        {state === "complete" && (
          <div className="flex items-center justify-center gap-2 text-primary">
            <CheckCircle2 className="h-5 w-5" />
            <p className="font-medium">All done!</p>
          </div>
        )}
      </div>
    </Card>
  )
}
