import Link from "next/link"
import { Button } from "@/components/ui/button"
import { FileText } from "lucide-react"

export default function Header() {
  return (
    <header className="sticky top-0 z-50 w-full border-b border-border bg-background">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-14 items-center justify-between">

          {/* Left: Brand + Nav */}
          <div className="flex items-center gap-8">
            <Link
              href="/"
              className="flex items-center gap-2 text-sm font-semibold text-foreground"
            >
              <div className="flex h-7 w-7 items-center justify-center rounded-md bg-primary/90">
                <FileText className="h-4 w-4 text-white" />
              </div>
              <span className="tracking-tight">Formyxa</span>
            </Link>

            <nav className="hidden md:flex items-center gap-6 text-sm">
              <Link
                href="/pricing"
                className="text-muted-foreground hover:text-foreground transition-colors"
              >
                Pricing
              </Link>
              <Link
                href="/about"
                className="text-muted-foreground hover:text-foreground transition-colors"
              >
                About
              </Link>
              <Link
                href="/privacy"
                className="text-muted-foreground hover:text-foreground transition-colors"
              >
                Privacy
              </Link>
            </nav>
          </div>

          {/* Right: CTA */}
          <Button
            size="sm"
            className="h-8 px-4 text-sm font-medium"
            asChild
          >
            <Link href="/handwritten-to-doc/upload">
              Get Started
            </Link>
          </Button>

        </div>
      </div>
    </header>
  )
}
