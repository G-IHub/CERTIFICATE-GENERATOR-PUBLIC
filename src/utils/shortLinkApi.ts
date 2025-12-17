import { projectId, publicAnonKey } from "./supabase/info";

const API_BASE = `https://${projectId}.supabase.co/functions/v1/make-server-a611b057`;

/**
 * Create a short link for a certificate
 */
export async function createShortLink(
  organizationId: string,
  programId: string,
  certificateId: string,
  certificateData?: any
): Promise<{
  success: boolean;
  shortCode?: string;
  shortUrl?: string;
  fullShortUrl?: string;
  error?: string;
}> {
  // Short links have been disabled. Return a clear error to callers.
  console.warn("Short links are disabled in this deployment");
  return {
    success: false,
    error: "Short links are disabled",
  };
}

/**
 * Get analytics for a short link
 */
export async function getShortLinkAnalytics(code: string): Promise<{
  success: boolean;
  analytics?: {
    code: string;
    certificateId: string;
    organizationId: string;
    createdAt: string;
    totalClicks: number;
    lastClickedAt: string | null;
    clicks: Array<{
      timestamp: string;
      userAgent: string;
      referer: string;
    }>;
  };
  error?: string;
}> {
  console.warn("Short link analytics requested but short links are disabled");
  return { success: false, error: "Short links disabled" };
}

/**
 * Get all short links for an organization
 */
export async function getOrganizationShortLinks(
  organizationId: string,
  accessToken: string
): Promise<{
  success: boolean;
  shortLinks?: any[];
  totalLinks?: number;
  totalClicks?: number;
  error?: string;
}> {
  console.warn("Organization short links requested but short links are disabled");
  return { success: false, error: "Short links disabled" };
}