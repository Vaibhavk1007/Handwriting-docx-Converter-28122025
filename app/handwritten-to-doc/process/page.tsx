import { Suspense } from "react";
import ProcessClient from "./ProcessClient";

export const dynamic = "force-dynamic";

export default function Page() {
  return (
    <Suspense fallback={<div className="p-6">Starting process…</div>}>
      <ProcessClient />
    </Suspense>
  );
}