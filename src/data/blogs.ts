export interface BlogPost {
  id: string;
  title: string;
  excerpt: string;
  content: string;
  author: string;
  date: string; // ISO date
  image: string;
}

export const blogs: BlogPost[] = [
  {
    id: "getting-started",
    title: "Getting Started with Certifyer",
    excerpt:
      "Learn how to set up your first organization, create a program, and issue certificates.",
    content:
      "Welcome to Certifyer! This post walks you through setting up your organization, creating a program, and issuing your first certificates. Start by creating an organization in the dashboard, then add a program and choose a template. You can customize signatories, completion dates, and restrict downloads. Once ready, generate certificates and share them with students.\n\nThis guide includes screenshots, tips, and links to support resources.",
    author: "Tola N.",
    date: "2026-02-10",
    image: "https://images.unsplash.com/photo-1651648719049-add1f6eec799?w=600&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8N3x8bGFwdG9wJTIwYW5kJTIwY29mZWUlMjBiZ3xlbnwwfHwwfHx8MA%3D%3D",
  },
  {
    id: "best-practices",
    title: "Certificate Design Best Practices",
    excerpt:
      "Design attractive and accessible certificates that your students will be proud to share.",
    content:
      "## Design Best Practices\n\nA well-designed certificate balances branding and readability. Use clear typography, include the program title, recipient name, issuer, and date. Consider accessibility: ensure contrast, provide downloadable alt-friendly PDFs, and include metadata for verification.\n\nTips: keep the layout simple, use a single accent color, and include a verification link.",
    author: "Design Team",
    date: "2026-01-20",
    image: "https://images.unsplash.com/photo-1650964295437-82e0b7b4379d?w=600&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8OHx8bGFwdG9wJTIwYW5kJTIwY29mZWUlMjBiZ3xlbnwwfHwwfHx8MA%3D%3D",
  },
  {
    id: "security-verify",
    title: "Secure Certificate Verification",
    excerpt:
      "How verification works and ways to keep issued certificates secure.",
    content:
      "## Secure Verification\n\nCertifyer provides verification links and optional email-based download restrictions. To improve security, enable restricted downloads, configure signatories, and require email verification before downloads. We also support verification tokens embedded in certificate links for tamper-resistant checks.",
    author: "Security Team",
    date: "2026-02-01",
    image: "https://images.unsplash.com/photo-1767627857933-e46e878380ac?w=600&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8Mnx8bGFwdG9wJTIwYW5kJTIwY29mZWUlMjBiZ3xlbnwwfHwwfHx8MA%3D%3D",
  },
];
