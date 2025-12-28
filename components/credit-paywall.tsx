"use client"

import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Download, RotateCcw, Coins, Check, Sparkles } from "lucide-react"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"

interface CreditPaywallProps {
  userCredits: number
  onDownload: () => void
  onReset: () => void
  showCreditModal: boolean
  onCloseCreditModal: () => void
  onCreditsPurchased: (credits: number) => void
}

const CREDIT_PACKS = [
  { credits: 3, price: 9, popular: false },
  { credits: 10, price: 25, popular: true },
  { credits: 25, price: 50, popular: false },
]

export default function CreditPaywall({
  userCredits,
  onDownload,
  onReset,
  showCreditModal,
  onCloseCreditModal,
  onCreditsPurchased,
}: CreditPaywallProps) {
  const handlePurchase = async (credits: number) => {
    // Mock purchase - in production, this would integrate with Stripe
    console.log("[v0] Purchasing", credits, "credits")

    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 1000))

    onCreditsPurchased(credits)
  }

  // If user has credits, show download button
  if (userCredits >= 1) {
    return (
      <div className="space-y-4">
        <Card className="p-6 bg-muted border-border">
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="rounded-full bg-secondary p-2">
                <Coins className="h-5 w-5 text-secondary-foreground" />
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">Available Credits</p>
                <p className="text-2xl font-bold text-foreground">{userCredits}</p>
              </div>
            </div>
            <div className="text-right text-sm text-muted-foreground">
              <p>1 credit will be used</p>
              <p>to download this document</p>
            </div>
          </div>
        </Card>

        <div className="flex flex-col sm:flex-row gap-4 items-center justify-center">
          <Button size="lg" onClick={onDownload} className="min-w-[200px] shadow-md">
            <Download className="mr-2 h-5 w-5" />
            Download Word (.docx)
          </Button>
          <Button size="lg" variant="outline" onClick={onReset} className="min-w-[200px] bg-transparent">
            <RotateCcw className="mr-2 h-5 w-5" />
            Convert Another File
          </Button>
        </div>
      </div>
    )
  }

  // If user has no credits, show paywall
  return (
    <>
      <Card className="p-8 border-border bg-muted/30">
        <div className="text-center space-y-6">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-secondary">
            <Sparkles className="h-8 w-8 text-secondary-foreground" />
          </div>

          <div className="space-y-2">
            <h3 className="text-2xl font-bold">Your Document is Ready!</h3>
            <p className="text-muted-foreground text-lg">Use 1 credit to download this document as a Word file</p>
          </div>

          <div className="bg-background rounded-lg p-6 max-w-md mx-auto">
            <div className="space-y-3 text-left text-sm">
              <div className="flex items-start gap-2">
                <Check className="h-5 w-5 text-foreground flex-shrink-0 mt-0.5" />
                <p className="text-muted-foreground">Clean, professional formatting</p>
              </div>
              <div className="flex items-start gap-2">
                <Check className="h-5 w-5 text-foreground flex-shrink-0 mt-0.5" />
                <p className="text-muted-foreground">Preserved structure and headings</p>
              </div>
              <div className="flex items-start gap-2">
                <Check className="h-5 w-5 text-foreground flex-shrink-0 mt-0.5" />
                <p className="text-muted-foreground">Editable Word (.docx) format</p>
              </div>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-4 items-center justify-center pt-2">
            <Button size="lg" onClick={() => onCloseCreditModal()} className="min-w-[200px] shadow-md">
              <Coins className="mr-2 h-5 w-5" />
              Buy Credits
            </Button>
            <Button size="lg" variant="outline" onClick={onReset} className="min-w-[200px] bg-transparent">
              <RotateCcw className="mr-2 h-5 w-5" />
              Convert Another File
            </Button>
          </div>

          <p className="text-sm text-muted-foreground">No subscription required • Pay only when you need it</p>
        </div>
      </Card>

      {/* Credit Purchase Modal */}
      <Dialog open={showCreditModal} onOpenChange={onCloseCreditModal}>
        <DialogContent className="sm:max-w-2xl">
          <DialogHeader>
            <DialogTitle className="text-2xl">Buy Credits</DialogTitle>
            <DialogDescription>
              Choose a credit pack that works for you. Credits never expire and there's no subscription.
            </DialogDescription>
          </DialogHeader>

          <div className="grid sm:grid-cols-3 gap-4 py-6">
            {CREDIT_PACKS.map((pack) => (
              <Card
                key={pack.credits}
                className={`relative p-6 space-y-4 cursor-pointer transition-all hover:border-foreground/20 ${
                  pack.popular ? "border-2 border-foreground shadow-lg" : "border-border"
                }`}
              >
                {pack.popular && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                    <span className="bg-secondary text-secondary-foreground text-xs font-bold px-3 py-1 rounded-full">
                      POPULAR
                    </span>
                  </div>
                )}

                <div className="text-center space-y-2">
                  <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-secondary">
                    <Coins className="h-6 w-6 text-secondary-foreground" />
                  </div>
                  <h4 className="text-3xl font-bold">{pack.credits}</h4>
                  <p className="text-sm text-muted-foreground">Credits</p>
                </div>

                <div className="text-center">
                  <p className="text-2xl font-bold">${pack.price}</p>
                  <p className="text-xs text-muted-foreground mt-1">
                    ${(pack.price / pack.credits).toFixed(2)} per conversion
                  </p>
                </div>

                <Button
                  className="w-full"
                  variant={pack.popular ? "default" : "outline"}
                  onClick={() => handlePurchase(pack.credits)}
                >
                  Purchase
                </Button>
              </Card>
            ))}
          </div>

          <div className="text-center text-sm text-muted-foreground space-y-1">
            <p>Secure payment powered by Stripe</p>
            <p>Credits never expire • No subscription required</p>
          </div>
        </DialogContent>
      </Dialog>
    </>
  )
}
