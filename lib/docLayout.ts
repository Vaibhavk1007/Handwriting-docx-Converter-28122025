// lib/docLayout.ts
import type { DocLayoutStyle } from "@/types/doc-layout"

/**
 * All visual styles we support in the editor.
 */
const DOC_LAYOUTS: Record<string, DocLayoutStyle> = {
  default: {
    shellVariant: "page",
    showLogo: false,
    showSignature: false,
    pageWidthPx: 794,
    minPageHeightPx: 1123,
  },

  // HR / offer style (blue header/footer)
  offer_modern_blue: {
    shellVariant: "page",
    headerImageUrl: "/graphics/offer/header-mod-blue.png",
    footerImageUrl: "/graphics/offer/footer-wave-blue.png",
    showLogo: true,
    showSignature: true,
    pageWidthPx: 794,
    minPageHeightPx: 1123,
  },
  // 🔽 NEW
  offer_green_wave: {
    shellVariant: "page",
    headerImageUrl: "/graphics/offer/header-green-wave.webp",
    footerImageUrl: "/graphics/offer/footer-green-wave.webp",
    showLogo: true,
    showSignature: true,
    pageWidthPx: 794,
    minPageHeightPx: 1123,
  },

  // Minimal offer (no header/footer)
  offer_minimal_plain: {
    shellVariant: "page",
    showLogo: true,
    showSignature: true,
    pageWidthPx: 794,
    minPageHeightPx: 1123,
  },

  // Classic bordered offer (you can style later)
  offer_classic_border: {
    shellVariant: "page",
    showLogo: true,
    showSignature: true,
    pageWidthPx: 794,
    minPageHeightPx: 1123,
  },

  // Very simple NOC layout
  noc_plain: {
    shellVariant: "page",
    showLogo: true,
    showSignature: true,
    pageWidthPx: 794,
    minPageHeightPx: 1123,
  },

  // Rental agreement – slightly wider page
  rental_plain: {
    shellVariant: "page",
    showLogo: true,
    showSignature: true,
    pageWidthPx: 820,
    minPageHeightPx: 1123,
  },

  // No page shell at all – blog writer, proposals, etc.
  plain_editor: {
    shellVariant: "plain",
  },
}

/**
 * Exact slug → default style if no explicit designKey.
 * These are your real slugs from prisma/seed.js (and the ones you mentioned).
 */
const SLUG_STYLE_OVERRIDES: Record<string, keyof typeof DOC_LAYOUTS> = {
  // Visa – editor is plain, no header/footer
  "visa-expiration-letter": "plain_editor",

  // Proposals + blog → normal editor
  "website-proposal-standard": "plain_editor",
  "mobile-app-proposal-standard": "plain_editor",
  "blog-article-standard": "plain_editor",

  // Legal-draft rental (future-proof)
  "rental-agreement-11-months": "rental_plain",

  // HR + NOC
  "offer-letter-standard": "offer_modern_blue",
  "noc-employee-visa": "noc_plain",
}

/**
 * Decide which layout to use for a given template slug + design key.
 */
export function getLayoutForTemplateSlug(
  slug?: string | null,
  designKey?: string | null,
): DocLayoutStyle {

  const s = (slug || "").toLowerCase();

  // ✅ Leave applications should be plain like visa (no letterhead/title bar)
  if (s.startsWith("leave-application-")) {
    return DOC_LAYOUTS.plain_editor; // or whatever your visa/normal layout key is
  }

  // 1️⃣ If a designKey is explicitly set and we know it, use that first
  if (designKey && DOC_LAYOUTS[designKey]) {
    return DOC_LAYOUTS[designKey]
  }

  // 2️⃣ Otherwise, slug → override mapping
  if (slug) {
    const exact = SLUG_STYLE_OVERRIDES[slug]
    if (exact) return DOC_LAYOUTS[exact]

    const lower = slug.toLowerCase()

    // Safety net heuristics
    if (
      lower.includes("offer") ||
      lower.includes("appointment") ||
      lower.includes("joining")
    ) {
      return DOC_LAYOUTS.offer_modern_blue
    }

    if (lower.includes("noc")) return DOC_LAYOUTS.noc_plain

    if (lower.includes("rental") || lower.includes("lease")) {
      return DOC_LAYOUTS.rental_plain
    }

    if (
      lower.includes("blog") ||
      lower.includes("ai-blog") ||
      lower.includes("content") ||
      lower.includes("copywriter") ||
      lower.includes("proposal")
    ) {
      return DOC_LAYOUTS.plain_editor
    }
  }

  // 3️⃣ Final fallback
  return DOC_LAYOUTS.default
}
