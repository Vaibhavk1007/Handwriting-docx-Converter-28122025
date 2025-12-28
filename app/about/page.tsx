export default function AboutPage() {
  return (
    <main className="bg-muted/30">
      <section className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 py-16 space-y-10">
        <h1 className="text-4xl font-bold tracking-tight">
          About Handwritten → DOC
        </h1>

        <p className="text-lg text-muted-foreground">
          Handwritten → DOC helps individuals and organizations convert handwritten
          and scanned documents into clean, structured, and fully editable Word files.
        </p>

        <div className="space-y-6 text-base leading-relaxed">
          <p>
            The platform is designed for accuracy-first document conversion — especially
            for forms, applications, records, and official paperwork where wording,
            structure, and layout matter.
          </p>

          <p>
            Many important documents still exist on paper, including employment
            applications, government forms, onboarding paperwork, questionnaires,
            and handwritten submissions. Traditional OCR tools often struggle with
            handwriting, tables, and real-world scans.
          </p>

          <p>
            Handwritten → DOC was built specifically to address these challenges with
            a workflow optimized for structured documents rather than free-form notes.
          </p>
        </div>

        <div className="space-y-4">
          <h2 className="text-2xl font-semibold">How It Works</h2>
          <p className="text-muted-foreground">
            The system combines optical character recognition (OCR) with layout-aware
            AI processing to:
          </p>
          <ul className="list-disc list-inside space-y-2 text-muted-foreground">
            <li>Extract handwritten or printed text from images and PDFs</li>
            <li>Preserve document structure such as headings, tables, and form fields</li>
            <li>Generate Word documents that are easy to edit, review, and submit</li>
          </ul>
        </div>

        <div className="space-y-4">
          <h2 className="text-2xl font-semibold">What We Focus On</h2>
          <ul className="list-disc list-inside space-y-2 text-muted-foreground">
            <li>Accuracy over paraphrasing</li>
            <li>Structure over free-form text cleanup</li>
            <li>Forms and records over casual note-taking</li>
            <li>Compatibility with Microsoft Word and Google Docs</li>
          </ul>
          <p className="text-muted-foreground">
            The preview shown is for verification only. Final editing is performed in
            Microsoft Word or Google Docs.
          </p>
        </div>

        <div className="space-y-4">
          <h2 className="text-2xl font-semibold">Who Uses It</h2>
          <ul className="list-disc list-inside space-y-2 text-muted-foreground">
            <li>HR and administrative teams</li>
            <li>Institutions and records offices</li>
            <li>Professionals handling applications and paperwork</li>
            <li>Individuals converting personal documents</li>
          </ul>
        </div>

        <div className="space-y-4">
          <h2 className="text-2xl font-semibold">Data & Privacy</h2>
          <p className="text-muted-foreground">
            Files are processed securely and deleted automatically after conversion.
            Documents are not stored or reused for training.
          </p>
        </div>
      </section>
    </main>
  );
}
