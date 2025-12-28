import Link from "next/link"
import Header from "@/components/header"
import Footer from "@/components/footer"
import { Button } from "@/components/ui/button"
import { redirect } from "next/navigation"
import {
  ArrowRight,
  FileText,
  ArrowRightLeft,
  FileSearch,
  Sparkles,
  FileCheck,
  Brain,
  Layout,
  Shield,
} from "lucide-react"
import { Card } from "@/components/ui/card"

export default function HomePage() {
  redirect("/handwritten-to-doc")

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1">
        {/* Hero Section */}
        <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 pt-10 pb-20 md:pt-16 md:pb-24">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div className="flex flex-col gap-6">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-primary text-sm font-medium w-fit">
                <FileText className="h-4 w-4" />
                Powered by AI Vision & OCR
              </div>
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight text-balance">
                Convert Handwritten Notes into Editable Word Documents
              </h1>
              <p className="text-lg md:text-xl text-muted-foreground text-pretty max-w-xl">
                Upload handwritten pages and get a clean, professional DOC file in seconds. Perfect for students,
                teachers, and professionals.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 mt-4">
                <Button size="lg" asChild className="text-base">
                  <Link href="/handwritten-to-doc/upload">
                    Convert Handwritten Notes
                    <ArrowRight className="ml-2 h-5 w-5" />
                  </Link>
                </Button>
                <Button size="lg" variant="outline" className="text-base bg-transparent" asChild>
                  <a href="#how-it-works">See How It Works</a>
                </Button>
              </div>
              <p className="text-sm text-muted-foreground">No signup required • Secure processing • DOCX output</p>
            </div>

            <div className="relative">
              <div className="grid grid-cols-2 gap-4 items-center">
                <div className="relative aspect-[3/4] rounded-lg border-2 border-border bg-muted overflow-hidden shadow-lg">
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="text-center p-6">
                      <FileText className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
                      <p className="text-sm text-muted-foreground font-medium">Handwritten Notes</p>
                    </div>
                  </div>
                </div>
                <div className="flex flex-col gap-4">
                  <div className="flex items-center justify-center py-8">
                    <ArrowRightLeft className="h-8 w-8 text-primary" />
                  </div>
                  <div className="relative aspect-[3/4] rounded-lg border-2 border-primary bg-card overflow-hidden shadow-lg">
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div className="text-center p-6">
                        <div className="bg-primary/10 rounded-lg p-4 mb-4">
                          <FileText className="h-16 w-16 text-primary mx-auto" />
                        </div>
                        <p className="text-sm font-medium">Clean Word Document</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* How It Works Section */}
        <section id="how-it-works" className="bg-muted/30 py-20">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="text-center space-y-4 mb-16">
              <h2 className="text-3xl md:text-4xl font-bold tracking-tight">How It Works</h2>
              <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                Three simple steps to transform your handwritten notes into professional documents
              </p>
            </div>

            <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
              {[
                {
                  step: "1",
                  icon: FileSearch,
                  title: "Reading handwriting",
                  description:
                    "Our advanced OCR technology reads your handwritten text with high accuracy, recognizing various writing styles.",
                },
                {
                  step: "2",
                  icon: Sparkles,
                  title: "Understanding structure",
                  description:
                    "AI Vision analyzes your document structure, identifying headings, paragraphs, lists, and formatting.",
                },
                {
                  step: "3",
                  icon: FileCheck,
                  title: "Creating document",
                  description:
                    "Generates a clean, professionally formatted Word document ready for editing, sharing, or submission.",
                },
              ].map((item) => (
                <div key={item.step} className="relative">
                  <Card className="p-6 space-y-4 h-full border-border">
                    <div className="flex items-center gap-4">
                      <div className="rounded-full bg-primary text-primary-foreground w-10 h-10 flex items-center justify-center font-bold">
                        {item.step}
                      </div>
                      <div className="rounded-lg bg-primary/10 w-12 h-12 flex items-center justify-center">
                        <item.icon className="h-6 w-6 text-primary" />
                      </div>
                    </div>
                    <h3 className="text-xl font-semibold">{item.title}</h3>
                    <p className="text-muted-foreground leading-relaxed">{item.description}</p>
                  </Card>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Before/After Example Section */}
        <section className="py-20">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="text-center space-y-4 mb-16">
              <h2 className="text-3xl md:text-4xl font-bold tracking-tight">See the Difference</h2>
              <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                From messy handwriting to clean, professional documents
              </p>
            </div>

            <div className="grid md:grid-cols-2 gap-8 max-w-5xl mx-auto">
              <Card className="p-6 space-y-4">
                <div className="text-sm font-medium text-muted-foreground uppercase tracking-wide">Before</div>
                <div className="aspect-[4/3] bg-muted rounded-lg border-2 border-border flex items-center justify-center">
                  <div className="text-center p-6">
                    <FileText className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
                    <p className="text-sm text-muted-foreground">Handwritten notes with mixed formatting</p>
                  </div>
                </div>
                <p className="text-sm text-muted-foreground">Handwritten notes can be difficult to read and share</p>
              </Card>

              <Card className="p-6 space-y-4 border-primary">
                <div className="text-sm font-medium text-primary uppercase tracking-wide">After</div>
                <div className="aspect-[4/3] bg-background rounded-lg border-2 border-primary/20 p-6 overflow-auto">
                  <div className="space-y-3 text-left">
                    <h4 className="font-bold text-base">Meeting Notes - Project Alpha</h4>
                    <p className="text-sm text-muted-foreground leading-relaxed">
                      Discussed timeline and deliverables for Q1 launch.
                    </p>
                    <ul className="text-sm space-y-1 list-disc list-inside text-muted-foreground">
                      <li>Finalize design mockups by end of week</li>
                      <li>Begin development sprint next Monday</li>
                      <li>Schedule client review for February 15th</li>
                    </ul>
                  </div>
                </div>
                <p className="text-sm text-primary font-medium">Clean, structured, and ready to share</p>
              </Card>
            </div>
          </div>
        </section>

        {/* Trust Section */}
        <section className="bg-muted/30 py-20">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="max-w-5xl mx-auto space-y-12">
              <div className="text-center space-y-4">
                <h2 className="text-3xl md:text-4xl font-bold tracking-tight">Why Handwritten → DOC Works Better</h2>
                <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                  Powered by advanced AI technology designed specifically for handwritten document conversion
                </p>
              </div>

              <div className="grid md:grid-cols-3 gap-6">
                {[
                  {
                    icon: Brain,
                    title: "Understands handwriting, not just text",
                    description:
                      "Our AI Vision model comprehends context, structure, and formatting—delivering accurate results beyond simple OCR.",
                  },
                  {
                    icon: Layout,
                    title: "Preserves structure",
                    description:
                      "Automatically detects headings, bullet points, paragraphs, and formatting to maintain your original document structure.",
                  },
                  {
                    icon: FileCheck,
                    title: "Ready-to-submit documents",
                    description:
                      "Get professionally formatted Word documents that can be directly submitted or shared without additional editing.",
                  },
                ].map((feature) => (
                  <Card
                    key={feature.title}
                    className="p-6 space-y-4 border-border hover:border-primary/50 transition-colors"
                  >
                    <div className="rounded-lg bg-primary/10 w-12 h-12 flex items-center justify-center">
                      <feature.icon className="h-6 w-6 text-primary" />
                    </div>
                    <h3 className="text-xl font-semibold text-balance">{feature.title}</h3>
                    <p className="text-muted-foreground text-pretty leading-relaxed">{feature.description}</p>
                  </Card>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* Privacy Section */}
        <section className="py-20">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <Card className="max-w-3xl mx-auto p-8 border-primary/20 bg-primary/5">
              <div className="flex items-start gap-4">
                <div className="rounded-full bg-primary/10 p-3 flex-shrink-0">
                  <Shield className="h-6 w-6 text-primary" />
                </div>
                <div className="space-y-2">
                  <h3 className="text-xl font-semibold">Your Privacy is Protected</h3>
                  <p className="text-muted-foreground leading-relaxed">
                    We take your privacy seriously. All uploaded files are processed securely using encrypted
                    connections and are automatically deleted from our servers after conversion. We never store, share,
                    or analyze your personal documents.
                  </p>
                </div>
              </div>
            </Card>
          </div>
        </section>

        {/* CTA Section */}
        <section className="bg-primary text-primary-foreground py-20">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 text-center space-y-6">
            <h2 className="text-3xl md:text-4xl font-bold tracking-tight">Ready to Convert Your Notes?</h2>
            <p className="text-lg text-primary-foreground/90 max-w-2xl mx-auto">
              Join thousands of students and professionals who trust us with their handwritten documents
            </p>
            <Button size="lg" variant="secondary" asChild className="text-base">
              <Link href="/handwritten-to-doc/upload">
                Get Started Now
                <ArrowRight className="ml-2 h-5 w-5" />
              </Link>
            </Button>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  )
}
