import Link from "next/link"
import Header from "@/components/header"
import Footer from "@/components/footer"
import { Button } from "@/components/ui/button"
import Image from "next/image"
import {
  ArrowRight,
  FileText,
  Upload,
  Brain,
  Download,
  GraduationCap,
  Users,
  Briefcase,
  Sparkles,
  FileCheck,
  Zap,
} from "lucide-react"
import { Card } from "@/components/ui/card"

export default function HandwrittenToDocPage() {
  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Header />
      <main className="flex-1">
        {/* Hero Section */}
        <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 pt-20 pb-16 md:pt-10 md:pb-24">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <div className="flex flex-col gap-8">
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-secondary text-secondary-foreground text-sm font-medium w-fit">
                <Sparkles className="h-3.5 w-3.5" />
                Powered by AI Vision & OCR
              </div>

              <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight text-balance leading-tight">
                Turn handwritten and scanned documents into clean, editable Word files
              </h1>

              <p className="text-lg md:text-xl text-muted-foreground text-pretty leading-relaxed">
                Convert handwritten pages, scanned forms, and PDFs into professionally formatted DOCX files — with strict accuracy for official use.
              </p>

              <div className="flex flex-col sm:flex-row gap-4">
                <Button
                  size="lg"
                  asChild
                  className="text-base font-medium px-8 py-6 h-auto shadow-lg hover:shadow-xl transition-shadow"
                >
                  <Link href="/handwritten-to-doc/upload">
                    Upload a Document
                    <ArrowRight className="ml-2 h-5 w-5" />
                  </Link>
                </Button>
                <Button
                  size="lg"
                  variant="outline"
                  className="text-base font-medium px-8 py-6 h-auto bg-card border-2"
                  asChild
                >
                  <a href="#how-it-works">See How It Works</a>
                </Button>
              </div>

              <p className="text-sm text-muted-foreground">No signup required • Files deleted automatically • Handles messy handwriting</p>
            </div>

            <div className="relative">
              <div className="grid grid-cols-2 gap-6">
                {/* Before card */}
                <Card className="p-6 space-y-3 shadow-lg">
                  <div className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                    Handwritten or scanned document
                  </div>

                  <div className="relative aspect-[3/4] rounded-lg overflow-hidden border border-border bg-muted">
                    <Image
                      src="/images/handwritten-before1.png"
                      alt="Handwritten notes example"
                      fill
                      className="object-cover"
                      priority
                    />
                  </div>
                </Card>

                {/* After card */}
                <Card className="p-6 space-y-3 shadow-xl border-2 border-primary/10 mt-8">
                  <div className="text-xs font-semibold text-foreground uppercase tracking-wider">Clean, editable Word document</div>
                  <div className="aspect-[3/4] rounded-lg bg-card border border-border p-4 flex flex-col gap-2">
                    <div className="h-2 bg-foreground rounded w-3/4"></div>
                    <div className="h-2 bg-muted-foreground/30 rounded w-full"></div>
                    <div className="h-2 bg-muted-foreground/30 rounded w-5/6"></div>
                    <div className="h-2 bg-muted-foreground/30 rounded w-full"></div>
                    <div className="h-2 bg-muted-foreground/30 rounded w-4/5"></div>
                  </div>
                </Card>
              </div>
            </div>
          </div>
        </section>

        <section className="border-y border-border bg-card py-8">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="grid md:grid-cols-3 gap-8 text-center">
              <div className="flex flex-col items-center gap-2">
                <FileCheck className="h-8 w-8 text-primary mb-1" />
                <p className="text-sm font-medium text-foreground">Works with handwritten and scanned documents</p>
              </div>
              <div className="flex flex-col items-center gap-2">
                <Brain className="h-8 w-8 text-primary mb-1" />
                <p className="text-sm font-medium text-foreground">Preserves structure and formatting</p>
              </div>
              <div className="flex flex-col items-center gap-2">
                <Users className="h-8 w-8 text-primary mb-1" />
                <p className="text-sm font-medium text-foreground">Designed for forms, applications, and records</p>
              </div>
            </div>
          </div>
        </section>

        <section className="py-20 md:py-32">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="text-center space-y-4 mb-16">
              <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold tracking-tight">
                Before → After
              </h2>
              <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                From handwritten or scanned documents to structured, editable Word files
              </p>
            </div>

            <div className="grid md:grid-cols-2 gap-8 max-w-5xl mx-auto">
              {/* Left: Before card */}
              <Card className="overflow-hidden shadow-lg">
                <div className="aspect-[4/3] bg-muted/30 border-b-2 border-border flex items-center justify-center p-8">
                  <div className="relative aspect-[4/3] w-full">
                    <Image
                      src="/images/handwritten-before1.png"
                      alt="Handwritten notes"
                      fill
                      className="object-cover rounded-md"
                    />
                  </div>
                </div>
                <div className="p-6">
                  <p className="text-sm text-muted-foreground text-center">Difficult to read and share digitally</p>
                </div>
              </Card>

              {/* Right: After card */}
              <Card className="overflow-hidden shadow-xl border-2 border-primary/20">
                <div className="aspect-[4/3] bg-card border-b-2 border-border p-8">
                  <div className="space-y-5 text-left bg-white rounded-lg border border-border p-6 h-full">
                      {/* Document title */}
                      <div className="font-bold text-base text-foreground">
                        Job Application
                      </div>

                      {/* Personal details */}
                      <div className="text-sm space-y-2">
                        <div className="grid grid-cols-2 gap-x-6 gap-y-1 text-muted-foreground">
                          <p>
                            <span className="font-medium text-foreground">Full Name:</span>{" "}
                            Emily Johnson
                          </p>
                          <p>
                            <span className="font-medium text-foreground">Phone:</span>{" "}
                            (555) 123-4567
                          </p>
                          <p className="col-span-2">
                            <span className="font-medium text-foreground">
                              Position Applied For:
                            </span>{" "}
                            Office Assistant
                          </p>
                        </div>
                      </div>

                      {/* Divider */}
                      <div className="h-px bg-border" />

                      {/* Employment history */}
                      <div className="text-sm space-y-2">
                        <p className="font-medium text-foreground uppercase tracking-wide">
                          Employment History
                        </p>

                        <div className="border border-border rounded-md overflow-hidden">
                          <table className="w-full text-xs">
                            <thead className="bg-muted/40">
                              <tr>
                                <th className="px-2 py-1 text-left font-medium">Date Range</th>
                                <th className="px-2 py-1 text-left font-medium">Employer</th>
                                <th className="px-2 py-1 text-left font-medium">Position</th>
                              </tr>
                            </thead>
                            <tbody className="text-muted-foreground">
                              <tr>
                                <td className="px-2 py-1">05/2020 – 08/2022</td>
                                <td className="px-2 py-1">ABC Company</td>
                                <td className="px-2 py-1">Receptionist</td>
                              </tr>
                            </tbody>
                          </table>
                        </div>
                      </div>

                      {/* Footer hint */}
                      <p className="text-xs text-muted-foreground pt-2">
                        Converted from handwritten form • Fully editable in Word or Google Docs
                      </p>
                    </div>

                </div>
                <div className="p-6 bg-primary/5">
                  <p className="text-sm font-medium text-foreground text-center">Structure and layout preserved for official use</p>
                </div>
              </Card>
            </div>
          </div>
        </section>

        <section id="how-it-works" className="bg-card py-20 md:py-32 border-y border-border">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="text-center space-y-4 mb-16">
              <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold tracking-tight">How It Works</h2>
              <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                A reliable workflow designed for accurate document conversion
              </p>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-6xl mx-auto">
              {[
                {
                  step: "1",
                  icon: Upload,
                  title: "Upload handwritten or scanned document",
                  description: "JPG, PNG, or PDF files",
                },
                {
                  step: "2",
                  icon: Brain,
                  title: "Text is extracted with OCR",
                  description: "Printed and handwritten text recognized",
                },
                {
                  step: "3",
                  icon: Sparkles,
                  title: "Content is structured and formatted",
                  description: "Preserves layout, tables, and form fields",
                },
                {
                  step: "4",
                  icon: Download,
                  title: "Download fully editable Word document",
                  description: "Compatible with Microsoft Word and Google Docs",
                },
              ].map((item) => (
                <Card
                  key={item.step}
                  className="p-6 space-y-4 border-border shadow-sm hover:shadow-md transition-shadow"
                >
                  <div className="flex items-center gap-3">
                    <div className="rounded-lg bg-primary/10 text-primary w-10 h-10 flex items-center justify-center flex-shrink-0">
                      <item.icon className="h-5 w-5" />
                    </div>
                    <div className="text-sm font-bold text-muted-foreground">Step {item.step}</div>
                  </div>
                  <h3 className="text-lg font-bold text-foreground leading-snug">{item.title}</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">{item.description}</p>
                </Card>
              ))}
            </div>
          </div>
        </section>

        <section className="py-20 md:py-32">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="text-center space-y-4 mb-16">
              <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold tracking-tight">Who Uses This?</h2>
              <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                 Used for forms, applications, and official records across industries
              </p>
            </div>

            <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
              {[
                {
                  icon: Briefcase,
                  title: "HR & Administration",
                  description:
                    "Convert handwritten applications, onboarding forms, internal records, and compliance paperwork into clean, editable Word documents.",
                },
                {
                  icon: GraduationCap,
                  title: "Institutions & Records Teams",
                  description:
                    "Digitize handwritten or scanned forms, questionnaires, and official documents while preserving structure, tables, and accuracy.",
                },
                {
                  icon: Users,
                  title: "Professionals & Individuals",
                  description:
                    "Prepare clean documents from handwritten notes, meeting records, and personal paperwork for easy editing and submission.",
                },
              ].map((useCase) => (
                <Card
                  key={useCase.title}
                  className="p-8 space-y-4 border-border shadow-sm hover:shadow-lg transition-all"
                >
                  <div className="rounded-lg bg-secondary w-14 h-14 flex items-center justify-center">
                    <useCase.icon className="h-7 w-7 text-secondary-foreground" />
                  </div>
                  <h3 className="text-xl font-bold text-foreground">{useCase.title}</h3>
                  <p className="text-muted-foreground leading-relaxed">{useCase.description}</p>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* <section className="bg-card py-20 md:py-32 border-y border-border">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">

            <div className="text-center space-y-4 mb-16">
              <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold tracking-tight">
                Built for Accuracy & Structure
              </h2>
              <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                Designed for official documents where wording, layout, and precision matter
              </p>
            </div>

            <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
              {[
                {
                  icon: Brain,
                  title: "Strict accuracy processing",
                  description:
                    "Preserves original wording without paraphrasing. Unclear text is left as-is or clearly marked instead of guessed.",
                },
                {
                  icon: Zap,
                  title: "Layout-aware formatting",
                  description:
                    "Automatically detects tables, headings, lists, and form structure to maintain document integrity.",
                },
                {
                  icon: FileCheck,
                  title: "Works with real-world scans",
                  description:
                    "Handles uneven lighting, phone photos, cursive handwriting, and low-quality scanned documents.",
                },
              ].map((feature) => (
                <div key={feature.title} className="text-center space-y-4">
                  <div className="mx-auto rounded-lg bg-primary/10 w-16 h-16 flex items-center justify-center">
                    <feature.icon className="h-8 w-8 text-primary" />
                  </div>
                  <h3 className="text-lg font-semibold text-foreground px-4">
                    {feature.title}
                  </h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    {feature.description}
                  </p>
                </div>
              ))}
            </div>

          </div>
        </section> */}


        <section className="py-20 md:py-28">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <Card className="max-w-3xl mx-auto p-10 md:p-14 text-center space-y-6 shadow-lg border border-primary/20 bg-card">
              
              <h2 className="text-2xl md:text-3xl lg:text-4xl font-bold tracking-tight">
                Start Converting Your Documents
              </h2>

              <Button
                size="lg"
                asChild
                className="text-base font-medium px-10 py-6 h-auto shadow-md hover:shadow-lg transition-all"
              >
                <Link href="/handwritten-to-doc/upload">
                  Upload Document
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Link>
              </Button>

              <p className="text-xs text-muted-foreground">
                No signup • Files deleted automatically • Secure processing
              </p>

            </Card>
          </div>
        </section>


      </main>
      <Footer />
    </div>
  )
}
