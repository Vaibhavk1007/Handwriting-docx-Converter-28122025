export default function PrivacyPage() {
  return (
    <main className="bg-muted/30">
      <section className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 py-16 space-y-10">
        <h1 className="text-4xl font-bold tracking-tight">Privacy Policy</h1>

        <p className="text-muted-foreground">
          Last updated: {new Date().toLocaleDateString()}
        </p>

        <div className="space-y-6 text-base leading-relaxed">
          <div className="space-y-2">
            <h2 className="text-2xl font-semibold">1. Information We Process</h2>
            <p className="text-muted-foreground">
              We process only the information required to perform document conversion.
              This may include uploaded images or PDF files and the text extracted
              during processing.
            </p>
            <p className="text-muted-foreground">
              User accounts are not required to use this service.
            </p>
          </div>

          <div className="space-y-2">
            <h2 className="text-2xl font-semibold">2. How Your Data Is Used</h2>
            <p className="text-muted-foreground">
              Uploaded documents are used solely to:
            </p>
            <ul className="list-disc list-inside space-y-2 text-muted-foreground">
              <li>Convert handwritten or scanned content into editable Word files</li>
              <li>Display a temporary preview for verification</li>
            </ul>
            <p className="text-muted-foreground">
              We do not sell user data, share documents with third parties, or use
              uploaded files to train AI models.
            </p>
          </div>

          <div className="space-y-2">
            <h2 className="text-2xl font-semibold">3. File Storage & Retention</h2>
            <p className="text-muted-foreground">
              Files are processed temporarily and automatically deleted after
              conversion. No long-term document storage is performed.
            </p>
          </div>

          <div className="space-y-2">
            <h2 className="text-2xl font-semibold">4. Security</h2>
            <p className="text-muted-foreground">
              We use secure processing environments and industry-standard safeguards
              to protect uploaded documents during conversion.
            </p>
          </div>

          <div className="space-y-2">
            <h2 className="text-2xl font-semibold">5. Third-Party Services</h2>
            <p className="text-muted-foreground">
              We may use third-party infrastructure providers strictly to perform
              document processing. These providers are not permitted to store or reuse
              your data.
            </p>
          </div>

          <div className="space-y-2">
            <h2 className="text-2xl font-semibold">6. Cookies & Analytics</h2>
            <p className="text-muted-foreground">
              Handwritten → DOC does not use tracking cookies for advertising purposes.
              Limited analytics may be used to improve site reliability and performance.
            </p>
          </div>

          <div className="space-y-2">
            <h2 className="text-2xl font-semibold">7. Your Rights</h2>
            <p className="text-muted-foreground">
              You retain full ownership of your documents at all times. If you have
              questions regarding privacy or data handling, you may contact us at:
            </p>
            <p className="font-medium">
              support@yourdomain.com
            </p>
          </div>
        </div>
      </section>
    </main>
  );
}
