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
  try {
    const response = await fetch(`${API_BASE}/short/create`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${publicAnonKey}`,
      },
      body: JSON.stringify({
        organizationId,
        programId,
        certificateId,
        certificateData,
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      return {
        success: false,
        error: data.error || "Failed to create short link",
      };
    }

    return data;
  } catch (error) {
    console.error("Create short link error:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
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
  try {
    const response = await fetch(`${API_BASE}/short/${code}/analytics`, {
      headers: {
        Authorization: `Bearer ${publicAnonKey}`,
      },
    });

    const data = await response.json();

    if (!response.ok) {
      return {
        success: false,
        error: data.error || "Failed to get analytics",
      };
    }

    return data;
  } catch (error) {
    console.error("Get analytics error:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
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
  try {
    const response = await fetch(
      `${API_BASE}/short/org/${organizationId}/links`,
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      }
    );

    const data = await response.json();

    if (!response.ok) {
      return {
        success: false,
        error: data.error || "Failed to get short links",
      };
    }

    return data;
  } catch (error) {
    console.error("Get organization short links error:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}