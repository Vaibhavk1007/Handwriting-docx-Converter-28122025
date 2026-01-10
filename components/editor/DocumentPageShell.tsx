// components/editor/DocumentPageShell.tsx
"use client";

import { Editor, EditorContent } from "@tiptap/react";
import type {
  BrandProfile,
  SignatoryProfile,
  DocLayoutStyle,
} from "@/types/doc-layout";

interface DocumentPageShellProps {
  editor: Editor;
  layout: DocLayoutStyle;
  brand?: BrandProfile;
  signatory?: SignatoryProfile;
  title?: string;
  zoom: number;
}

export function DocumentPageShell({
  editor,
  layout,
  brand,
  signatory,
  title,
  zoom,
}: DocumentPageShellProps) {
  const pageWidth = layout.pageWidthPx ?? 794;
  const minPageHeight = layout.minPageHeightPx ?? 1123;

  return (
    <div
      className="
        bg-white
        shadow-[0_0_0_1px_rgba(15,23,42,0.04),0_12px_24px_rgba(15,23,42,0.06)]
        mx-auto
        flex flex-col
      "
      style={{
        
        minHeight: minPageHeight,
        transform: `scale(${zoom})`,
        transformOrigin: "top left",
      }}
    >
      {/* HEADER */}
      <div className="px-14 pt-5 pb-4 relative overflow-hidden">

      </div>

      {/* BODY – actual TipTap editor */}
      <div className="px-12 py-6 flex-1">
        <EditorContent editor={editor} className="tiptap" />
      </div>

      {/* FOOTER */}
      {/* <div className="px-14 pb-10 pt-4 mt-auto">
        {layout.footerImageUrl && (
          <img
            src={layout.footerImageUrl}
            alt="Footer"
            className="mt-6 h-20 w-full select-none object-cover pointer-events-none"
          />
        )}
      </div> */}
    </div>
  );
}
