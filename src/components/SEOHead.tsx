import { useEffect } from "react";
import { useLocation } from "react-router-dom";

interface SEOHeadProps {
  title?: string;
  description?: string;
  image?: string;
  url?: string;
  type?: string;
}

export default function SEOHead({
  title = "Certifyer - Professional Certificate Management Platform",
  description = "Generate, manage, and verify professional certificates for your organization. Multi-tenant SaaS platform with customizable templates, real-time previews, and secure verification.",
  image = "https://certifyer.online/og-image.png",
  url,
  type = "website",
}: SEOHeadProps) {
  const location = useLocation();
  const currentUrl = url || `https://certifyer.online${location.pathname}`;

  useEffect(() => {
    // Update document title
    document.title = title;

    // Update or create meta tags
    const metaTags: Record<string, string> = {
      description,
      "og:title": title,
      "og:description": description,
      "og:image": image,
      "og:url": currentUrl,
      "og:type": type,
      "og:site_name": "Certifyer",
      "twitter:card": "summary_large_image",
      "twitter:title": title,
      "twitter:description": description,
      "twitter:image": image,
      "theme-color": "#f97316", // Orange theme
    };

    Object.entries(metaTags).forEach(([name, content]) => {
      let meta = document.querySelector(
        `meta[name="${name}"], meta[property="${name}"]`
      ) as HTMLMetaElement;

      if (!meta) {
        meta = document.createElement("meta");
        if (name.startsWith("og:") || name.startsWith("twitter:")) {
          meta.setAttribute("property", name);
        } else {
          meta.setAttribute("name", name);
        }
        document.head.appendChild(meta);
      }

      meta.content = content;
    });

    // Add canonical link
    let canonical = document.querySelector('link[rel="canonical"]') as HTMLLinkElement;
    if (!canonical) {
      canonical = document.createElement("link");
      canonical.rel = "canonical";
      document.head.appendChild(canonical);
    }
    canonical.href = currentUrl;

    // Add JSON-LD structured data
    const structuredData = {
      "@context": "https://schema.org",
      "@type": "WebApplication",
      name: "Certifyer",
      description:
        "Professional certificate management platform for organizations",
      url: "https://certifyer.online",
      applicationCategory: "BusinessApplication",
      operatingSystem: "Web",
      offers: {
        "@type": "Offer",
        price: "0",
        priceCurrency: "USD",
      },
    };

    let scriptTag = document.querySelector(
      'script[type="application/ld+json"]'
    ) as HTMLScriptElement;
    if (!scriptTag) {
      scriptTag = document.createElement("script");
      scriptTag.type = "application/ld+json";
      document.head.appendChild(scriptTag);
    }
    scriptTag.textContent = JSON.stringify(structuredData);
  }, [title, description, image, currentUrl, type]);

  return null; // This component doesn't render anything
}