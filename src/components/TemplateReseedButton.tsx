import React, { useState } from "react";
import { Button } from "./ui/button";
import { RefreshCw, CheckCircle, AlertCircle } from "lucide-react";
import { toast } from "sonner";
import { templateApi } from "../utils/api";

/**
 * Developer utility button to reseed templates
 * Add this temporarily to your dashboard when you need to update templates
 */
export default function TemplateReseedButton() {
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState<"idle" | "success" | "error">("idle");

  const handleReseed = async () => {
    if (
      !confirm(
        "This will delete all existing templates and reseed with the latest template definitions. Continue?"
      )
    ) {
      return;
    }

    setLoading(true);
    setStatus("idle");

    try {
      const result = await templateApi.forceReseed();
      console.log("✅ Reseed successful:", result);
      toast.success(
        `Success! ${result.count} templates reseeded. Please refresh the page.`
      );
      setStatus("success");

      // Auto-refresh after 2 seconds
      setTimeout(() => {
        window.location.reload();
      }, 2000);
    } catch (error: any) {
      console.error("❌ Reseed failed:", error);
      toast.error(error.message || "Failed to reseed templates");
      setStatus("error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed bottom-4 right-4 z-50">
      <Button
        onClick={handleReseed}
        disabled={loading}
        size="sm"
        variant={
          status === "success"
            ? "default"
            : status === "error"
            ? "destructive"
            : "outline"
        }
        className="shadow-lg"
      >
        {loading ? (
          <>
            <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
            Reseeding...
          </>
        ) : status === "success" ? (
          <>
            <CheckCircle className="w-4 h-4 mr-2" />
            Success! Refreshing...
          </>
        ) : status === "error" ? (
          <>
            <AlertCircle className="w-4 h-4 mr-2" />
            Failed - Try Again
          </>
        ) : (
          <>
            <RefreshCw className="w-4 h-4 mr-2" />
            Reseed Templates
          </>
        )}
      </Button>
    </div>
  );
}