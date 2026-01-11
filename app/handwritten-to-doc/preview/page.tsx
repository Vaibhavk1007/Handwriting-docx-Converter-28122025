import { Suspense } from "react";
import PreviewClient from "./PreviewClient";

export default function Page() {
  return (
    <Suspense fallback={<div className="p-6">Loading preview…</div>}>
      <PreviewClient />
    </Suspense>
  );
}
