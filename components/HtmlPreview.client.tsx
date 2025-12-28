"use client";

import { useEffect, useState } from "react";

type HtmlPreviewProps = {
  htmlFragment: string;
  height?: string;
  className?: string;
  showWatermark?: boolean;
};

export default function HtmlPreview({
  htmlFragment,
  height = "600px",
  className = "",
  showWatermark = false,
}: HtmlPreviewProps) {
  const [srcDoc, setSrcDoc] = useState("");
  const [iframeHeight, setIframeHeight] = useState<number | null>(null);
  


  const makeFullDoc = (fragment: string) => {
    if (!fragment) return "";
    const wrappedFragment = fragment.includes('class="document"')
    ? fragment
    : `<div class="document">${fragment}</div>`;

    return `<!doctype html>
<html>
<head>
<meta charset="utf-8" />
<style>
body {
  margin: 0;
  padding: 16px 0; 
  background: #f4f6f8;
  font-family: "Times New Roman", serif;
  font-size: 11pt;
  line-height: 1.45;
  color: #000;

  /* hide scrollbar but keep scroll */
  overflow: hidden;
  scrollbar-width: none;        /* Firefox */
}
  .doc-title {
    text-align: center;
    font-weight: bold;
    text-decoration: underline;
  }

/* Chrome / Edge / Safari */
body::-webkit-scrollbar {
  display: none;
}

.preview-canvas {
  display: flex;
  justify-content: center;
  padding: 0 30px;   /* 👈 LEFT & RIGHT space */
}

.page {
  background: #fff;
  width: 8.27in;
  min-height: 11.69in;

  padding-left: 1.1in;
  padding-right: 1.1in;
  padding-bottom: 1.1in;
  padding-top: 0.6in;

  user-select: ${showWatermark ? "none" : "text"};
  position: relative;
}
  
/* ================= DOCUMENT STYLES ================= */
.document {
  font-family: "Times New Roman", serif;
  font-size: 11pt;
  line-height: 1.6;
  color: #000;
}

.document p {
  margin: 0 0 10pt 0;
}

.document table {
  width: 100%;
  border-collapse: collapse;
  margin: 12pt 0;
}

.document th,
.document td {
  border: 1px solid #444;
  padding: 6pt;
  vertical-align: top;
}

.doc-title {
  text-align: center;
  font-size: 18pt;
  font-weight: bold;
  margin-bottom: 24pt;
}

.doc-meta p {
  margin: 0;
}

.doc-subject {
  margin-top: 18pt;
  font-weight: bold;
  text-decoration: underline;
}

.doc-salutation {
  margin-top: 18pt;
}

.doc-body p {
  text-indent: 0.5in;
}

.doc-signoff {
  margin-top: 24pt;
}

.watermark {
  position: fixed;
  top: 45%;
  left: 50%;
  transform: translate(-50%, -50%) rotate(-25deg);
  font-size: 48px;
  font-weight: 600;
  color: rgba(0,0,0,0.08);
  pointer-events: none;
}

/* ===== Repeating Watermark Layer ===== */
.watermark-layer {
  position: fixed;
  inset: 0;
  pointer-events: none;
  z-index: 9999;
  overflow: hidden;
}

.watermark-grid {
  position: absolute;
  width: 300%;
  height: 300%;
  top: -100%;
  left: -100%;
  transform: rotate(-30deg);
  display: grid;
  grid-template-columns: repeat(10, 1fr); /* 🔥 more columns */
  gap: 70px; /* instead of 80px */
}

.watermark-item {
  font-size: 36px;            /* 🔥 bigger */
  font-weight: 700;
  letter-spacing: 6px;
  color: rgba(0, 0, 0, 0.08); /* 🔥 slightly darker */
  text-align: center;
  white-space: nowrap;
  user-select: none;
}


.watermark,
.watermark-layer,
.watermark-grid,
.watermark-item,
.center-watermark {
  user-select: none !important;
  pointer-events: none;
}
  .center-watermark {
    position: fixed;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%) rotate(-25deg);
    font-size: 64px;
    font-weight: 700;
    color: rgba(0, 0, 0, 0.06);
    pointer-events: none;
    z-index: 9998;
  }
  .preview-watermarked .page::before {
    content: "";
    position: absolute;
    inset: 0;
    background-image: repeating-linear-gradient(
      -30deg,
      rgba(0, 0, 0, 0.03) 0px,
      rgba(0, 0, 0, 0.03) 120px,
      transparent 120px,
      transparent 240px
    );
    pointer-events: none;
  }


</style>
</head>

<body>
${showWatermark ? `
  <div class="center-watermark">INK2DOC</div>
  <div class="watermark-layer">
    <div class="watermark-grid">
      ${Array.from({ length: 120 })
        .map(() => `<div class="watermark-item">INK2DOC • PREVIEW</div>`)
        .join("")}
    </div>
  </div>
` : ""} 
<div class="preview-canvas ${showWatermark ? "preview-watermarked" : ""}">
  
  <div class="page">
      ${wrappedFragment}
  </div>
</div>
<script>
  function resizeParent() {
    const height = document.documentElement.scrollHeight;
    parent.postMessage({ type: "DOC_HEIGHT", height }, "*");
  }

  window.addEventListener("load", resizeParent);
  window.addEventListener("resize", resizeParent);
</script>
</body>
</html>`;
  };

  useEffect(() => {
    const handler = (e: MessageEvent) => {
      if (e.data?.type === "DOC_HEIGHT") {
        setIframeHeight(e.data.height);
      }
    };
    window.addEventListener("message", handler);
    return () => window.removeEventListener("message", handler);
  }, []);

  useEffect(() => {
    setSrcDoc(makeFullDoc(htmlFragment));
  }, [htmlFragment, showWatermark]);

  return (
    <div className={`w-full h-full ${className}`}>
      <iframe
        title="Document preview"
        srcDoc={srcDoc}
        style={{
          width: "100%",
          height: iframeHeight ? `${iframeHeight}px` : "auto",
          border: "none",
          background: "#e5e7eb",
          overflow: "hidden",
        }}
      />
    </div>
  );
}
