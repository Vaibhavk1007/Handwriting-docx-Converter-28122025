import { Suspense } from "react";
import EditorClient from "./EditorClient";

export default function Page() {
  return (
    <Suspense fallback={<div className="p-6">Loading editor…</div>}>
      <EditorClient />
    </Suspense>
  );
}