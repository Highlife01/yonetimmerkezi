import { useEffect } from "react";

interface SeoHeadProps {
  title: string;
  description: string;
  canonicalPath?: string;
  keywords?: string;
  ogType?: string;
  ogImage?: string;
  noindex?: boolean;
}

const SITE_URL = "https://www.yonetimmerkezi.com.tr";

/**
 * Per-page SEO controller.
 * Keeps the www.yonetimmerkezi.com.tr canonical domain consistent on every route,
 * syncs Open Graph / Twitter meta and manages per-page robots & hreflang tags.
 */
export default function SeoHead({
  title,
  description,
  canonicalPath = "/",
  keywords,
  ogType = "website",
  ogImage = `${SITE_URL}/og-image.svg`,
  noindex = false,
}: SeoHeadProps) {
  useEffect(() => {
    // 1. Update Title
    const fullTitle = `${title} | Yönetim Merkezi`;
    document.title = fullTitle;

    // 2. Update Primary Meta Description
    let metaDesc = document.querySelector('meta[name="description"]');
    if (!metaDesc) {
      metaDesc = document.createElement("meta");
      metaDesc.setAttribute("name", "description");
      document.head.appendChild(metaDesc);
    }
    metaDesc.setAttribute("content", description);

    // 3. Update Meta Keywords if provided
    if (keywords) {
      let metaKeywords = document.querySelector('meta[name="keywords"]');
      if (!metaKeywords) {
        metaKeywords = document.createElement("meta");
        metaKeywords.setAttribute("name", "keywords");
        document.head.appendChild(metaKeywords);
      }
      metaKeywords.setAttribute("content", keywords);
    }

    // 4. Update Canonical Link
    const cleanPath = canonicalPath.startsWith("/") ? canonicalPath : `/${canonicalPath}`;
    const canonicalUrl = `${SITE_URL}${cleanPath === "/" ? "/" : cleanPath}`;

    let linkCanonical = document.querySelector('link[rel="canonical"]');
    if (!linkCanonical) {
      linkCanonical = document.createElement("link");
      linkCanonical.setAttribute("rel", "canonical");
      document.head.appendChild(linkCanonical);
    }
    linkCanonical.setAttribute("href", canonicalUrl);

    // 4a. Hreflang alternates per page
    const hreflangSpecs: Array<[string, string]> = [
      ["tr", canonicalUrl],
      ["x-default", canonicalUrl],
    ];
    for (const [lang, href] of hreflangSpecs) {
      const selector = `link[rel="alternate"][hreflang="${lang}"]`;
      let linkAlt = document.querySelector(selector);
      if (!linkAlt) {
        linkAlt = document.createElement("link");
        linkAlt.setAttribute("rel", "alternate");
        linkAlt.setAttribute("hreflang", lang);
        document.head.appendChild(linkAlt);
      }
      linkAlt.setAttribute("href", href);
    }

    // 4b. Per-page robots directive
    let metaRobots = document.querySelector('meta[name="robots"]');
    if (!metaRobots) {
      metaRobots = document.createElement("meta");
      metaRobots.setAttribute("name", "robots");
      document.head.appendChild(metaRobots);
    }
    metaRobots.setAttribute(
      "content",
      noindex
        ? "noindex, nofollow"
        : "index, follow, max-snippet:-1, max-image-preview:large, max-video-preview:-1"
    );

    // 5. Update Open Graph Meta
    const ogTitle = document.querySelector('meta[property="og:title"]');
    if (ogTitle) ogTitle.setAttribute("content", fullTitle);

    const ogDesc = document.querySelector('meta[property="og:description"]');
    if (ogDesc) ogDesc.setAttribute("content", description);

    const ogUrl = document.querySelector('meta[property="og:url"]');
    if (ogUrl) ogUrl.setAttribute("content", canonicalUrl);

    const ogTypeMeta = document.querySelector('meta[property="og:type"]');
    if (ogTypeMeta) ogTypeMeta.setAttribute("content", ogType);

    const ogImageMeta = document.querySelector('meta[property="og:image"]');
    if (ogImageMeta) ogImageMeta.setAttribute("content", ogImage);

    const ogImageSecure = document.querySelector('meta[property="og:image:secure_url"]');
    if (ogImageSecure) ogImageSecure.setAttribute("content", ogImage);

    // 6. Update Twitter Meta
    const twTitle = document.querySelector('meta[name="twitter:title"]');
    if (twTitle) twTitle.setAttribute("content", fullTitle);

    const twDesc = document.querySelector('meta[name="twitter:description"]');
    if (twDesc) twDesc.setAttribute("content", description);

    const twUrl = document.querySelector('meta[name="twitter:url"]');
    if (twUrl) twUrl.setAttribute("content", canonicalUrl);

    const twImage = document.querySelector('meta[name="twitter:image"]');
    if (twImage) twImage.setAttribute("content", ogImage);

    // Scroll to top on page mount
    window.scrollTo({ top: 0, behavior: "instant" });
  }, [title, description, canonicalPath, keywords, ogType, ogImage, noindex]);

  return null;
}
