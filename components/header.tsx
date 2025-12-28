import Link from "next/link"
import { Button } from "@/components/ui/button"
import { FileText } from "lucide-react"

export default function Header() {
  return (
    <header className="sticky top-0 z-50 w-full border-b border-border bg-card/95 backdrop-blur supports-[backdrop-filter]:bg-card/80">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 flex h-16 items-center justify-between">
        <div className="flex items-center gap-8">
          <Link href="/" className="flex items-center gap-2 font-semibold text-lg">
            <FileText className="h-6 w-6 text-foreground" />
            <span className="text-foreground">Handwritten → DOC</span>
          </Link>
          <nav className="hidden md:flex items-center gap-6">
            <Link
              href="/pricing"
              className="text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
            >
              Pricing
            </Link>
            <Link
              href="/about"
              className="text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
            >
              About
            </Link>
            <Link
              href="/privacy"
              className="text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
            >
              Privacy
            </Link>
          </nav>
        </div>
        <div className="flex items-center gap-4">
          {/* <Button variant="ghost" size="sm">
            Sign In
          </Button> */}
          <Button variant="outline" size="sm" className="hidden sm:inline-flex bg-transparent" asChild>
            <Link href="/handwritten-to-doc/upload">Get Started</Link>
          </Button>
        </div>
      </div>
    </header>
  )
}
