"use client"

import Header from "@/components/header"
import Footer from "@/components/footer"
import { Check } from "lucide-react"
import { useState } from "react"

export default function PricingPage() {
  const [mode] = useState<"one-time" | "subscription">("one-time")

  return (
    <div className="min-h-screen flex flex-col bg-muted/30">
      <Header />

      <main className="flex-1">
        <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-20">
          {/* Header */}
          <div className="text-center max-w-2xl mx-auto">
            <h1 className="text-3xl font-semibold tracking-tight">
              Simple, transparent pricing
            </h1>
            <p className="mt-3 text-muted-foreground">
              Pay only for what you use. No hidden charges.
            </p>
          </div>

          {/* Pricing cards */}
          <div className="mt-16 grid grid-cols-1 md:grid-cols-3 gap-8">

            {/* ONE-TIME PLAN */}
            <div className="rounded-xl border bg-white p-8 shadow-sm">
              <h3 className="text-sm font-medium text-muted-foreground">
                One-time document
              </h3>

              <div className="mt-4">
                <span className="text-4xl font-semibold">₹399</span>
                <span className="text-sm text-muted-foreground"> / document</span>
              </div>

              <p className="mt-3 text-sm text-muted-foreground">
                Best for occasional usage
              </p>

              <ul className="mt-6 space-y-3 text-sm">
                {[
                  "Handwritten → professional DOCX",
                  "Strict accuracy mode",
                  "Editable in Word & Google Docs",
                  "Secure processing",
                ].map((item) => (
                  <li key={item} className="flex items-start gap-2">
                    <Check className="h-4 w-4 text-green-600 mt-0.5" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>

              <button className="mt-8 w-full rounded-md bg-black px-4 py-2.5 text-sm font-medium text-white hover:bg-black/90">
                Pay & Download
              </button>
            </div>

            {/* BUSINESS PLAN */}
            <div className="rounded-xl border bg-white p-8 shadow-sm opacity-60">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-medium text-muted-foreground">
                  Business
                </h3>
                <span className="text-xs rounded-full bg-muted px-2 py-0.5">
                  Coming soon
                </span>
              </div>

              <div className="mt-4">
                <span className="text-4xl font-semibold">₹999</span>
                <span className="text-sm text-muted-foreground"> / month</span>
              </div>

              <p className="mt-3 text-sm text-muted-foreground">
                For teams and frequent usage
              </p>

              <ul className="mt-6 space-y-3 text-sm">
                {[
                  "Up to 20 documents / month",
                  "Faster processing",
                  "Team usage",
                  "Priority support",
                ].map((item) => (
                  <li key={item} className="flex items-start gap-2">
                    <Check className="h-4 w-4 text-muted-foreground mt-0.5" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>

              <button
                disabled
                className="mt-8 w-full rounded-md border px-4 py-2.5 text-sm text-muted-foreground cursor-not-allowed"
              >
                Coming soon
              </button>
            </div>

            {/* ENTERPRISE PLAN */}
            <div className="rounded-xl border bg-white p-8 shadow-sm opacity-60">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-medium text-muted-foreground">
                  Enterprise
                </h3>
                <span className="text-xs rounded-full bg-muted px-2 py-0.5">
                  Coming soon
                </span>
              </div>

              <div className="mt-4">
                <span className="text-4xl font-semibold">Custom</span>
              </div>

              <p className="mt-3 text-sm text-muted-foreground">
                For large organizations
              </p>

              <ul className="mt-6 space-y-3 text-sm">
                {[
                  "Unlimited documents",
                  "SLA & compliance",
                  "Dedicated support",
                  "Custom templates",
                ].map((item) => (
                  <li key={item} className="flex items-start gap-2">
                    <Check className="h-4 w-4 text-muted-foreground mt-0.5" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>

              <button
                disabled
                className="mt-8 w-full rounded-md border px-4 py-2.5 text-sm text-muted-foreground cursor-not-allowed"
              >
                Contact us
              </button>
            </div>
          </div>

          {/* Trust strip */}
          <div className="mt-20 text-center text-xs text-muted-foreground">
            Used for HR documents, employment forms, and internal records
          </div>
        </section>
      </main>

      <Footer />
    </div>
  )
}
