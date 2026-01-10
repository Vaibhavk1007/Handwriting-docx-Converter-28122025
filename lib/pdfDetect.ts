// export async function detectPdfType(
//   buffer: Buffer
// ): Promise<"digital" | "scanned"> {

//   // @ts-ignore — pdfjs node build has no types
//   const pdfjsLib = await import("pdfjs-dist/legacy/build/pdf.node.mjs");

//   const data = new Uint8Array(buffer);
//   const pdf = await pdfjsLib.getDocument({ data }).promise;

//   const pagesToCheck = Math.min(pdf.numPages, 3);

//   for (let i = 1; i <= pagesToCheck; i++) {
//     const page = await pdf.getPage(i);
//     const textContent = await page.getTextContent();

//     console.log(`📄 Page ${i} → text items: ${textContent.items.length}`);

//     if (textContent.items.length > 0) {
//       return "digital";
//     }
//   }

//   return "scanned";
// }
