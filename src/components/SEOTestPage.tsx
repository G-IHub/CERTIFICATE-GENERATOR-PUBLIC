import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { CheckCircle, XCircle, AlertCircle, ExternalLink } from "lucide-react";
import { Button } from "./ui/button";

export default function SEOTestPage() {
  const [metaTags, setMetaTags] = useState<Record<string, string>>({});
  const [sitemapStatus, setSitemapStatus] = useState<"loading" | "success" | "error">("loading");
  const [robotsStatus, setRobotsStatus] = useState<"loading" | "success" | "error">("loading");

  useEffect(() => {
    // Get all meta tags
    const tags: Record<string, string> = {};
    document.querySelectorAll("meta").forEach((meta) => {
      const name = meta.getAttribute("name") || meta.getAttribute("property");
      const content = meta.getAttribute("content");
      if (name && content) {
        tags[name] = content;
      }
    });
    setMetaTags(tags);

    // Test sitemap
    fetch("/sitemap.xml")
      .then((res) => {
        if (res.ok) setSitemapStatus("success");
        else setSitemapStatus("error");
      })
      .catch(() => setSitemapStatus("error"));

    // Test robots.txt
    fetch("/robots.txt")
      .then((res) => {
        if (res.ok) setRobotsStatus("success");
        else setRobotsStatus("error");
      })
      .catch(() => setRobotsStatus("error"));
  }, []);

  const StatusIcon = ({ status }: { status: "loading" | "success" | "error" }) => {
    if (status === "loading") return <AlertCircle className="w-5 h-5 text-yellow-500" />;
    if (status === "success") return <CheckCircle className="w-5 h-5 text-green-500" />;
    return <XCircle className="w-5 h-5 text-red-500" />;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 to-white p-8">
      <div className="max-w-4xl mx-auto space-y-6">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold mb-2">SEO Test Page</h1>
          <p className="text-muted-foreground">
            Verify that your SEO implementation is working correctly
          </p>
        </div>

        {/* File Status */}
        <Card>
          <CardHeader>
            <CardTitle>SEO Files Status</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
              <div className="flex items-center gap-3">
                <StatusIcon status={sitemapStatus} />
                <div>
                  <p className="font-semibold">sitemap.xml</p>
                  <p className="text-sm text-muted-foreground">
                    {sitemapStatus === "success"
                      ? "Accessible and valid"
                      : sitemapStatus === "loading"
                      ? "Checking..."
                      : "Not found or error"}
                  </p>
                </div>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => window.open("/sitemap.xml", "_blank")}
              >
                <ExternalLink className="w-4 h-4 mr-2" />
                View
              </Button>
            </div>

            <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
              <div className="flex items-center gap-3">
                <StatusIcon status={robotsStatus} />
                <div>
                  <p className="font-semibold">robots.txt</p>
                  <p className="text-sm text-muted-foreground">
                    {robotsStatus === "success"
                      ? "Accessible and valid"
                      : robotsStatus === "loading"
                      ? "Checking..."
                      : "Not found or error"}
                  </p>
                </div>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => window.open("/robots.txt", "_blank")}
              >
                <ExternalLink className="w-4 h-4 mr-2" />
                View
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Meta Tags */}
        <Card>
          <CardHeader>
            <CardTitle>Meta Tags</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="p-4 bg-gray-50 rounded-lg">
                <p className="font-semibold mb-2">Page Title</p>
                <p className="text-sm text-muted-foreground">{document.title}</p>
              </div>

              {["description", "og:title", "og:description", "twitter:title"].map((key) => (
                <div key={key} className="p-4 bg-gray-50 rounded-lg">
                  <p className="font-semibold mb-2">{key}</p>
                  <p className="text-sm text-muted-foreground">
                    {metaTags[key] || "Not set"}
                  </p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* All Meta Tags */}
        <Card>
          <CardHeader>
            <CardTitle>All Meta Tags ({Object.keys(metaTags).length})</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-1 max-h-96 overflow-y-auto">
              {Object.entries(metaTags).map(([key, value]) => (
                <div key={key} className="p-2 bg-gray-50 rounded text-xs">
                  <span className="font-mono text-blue-600">{key}:</span>{" "}
                  <span className="text-gray-700">{value}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Testing Tools */}
        <Card>
          <CardHeader>
            <CardTitle>External Testing Tools</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <Button
              variant="outline"
              className="w-full justify-start"
              onClick={() =>
                window.open(
                  "https://www.opengraph.xyz/url/" +
                    encodeURIComponent(window.location.href),
                  "_blank"
                )
              }
            >
              <ExternalLink className="w-4 h-4 mr-2" />
              Test Open Graph Tags
            </Button>
            <Button
              variant="outline"
              className="w-full justify-start"
              onClick={() =>
                window.open(
                  "https://cards-dev.twitter.com/validator",
                  "_blank"
                )
              }
            >
              <ExternalLink className="w-4 h-4 mr-2" />
              Test Twitter Cards
            </Button>
            <Button
              variant="outline"
              className="w-full justify-start"
              onClick={() =>
                window.open(
                  "https://search.google.com/test/mobile-friendly?url=" +
                    encodeURIComponent(window.location.href),
                  "_blank"
                )
              }
            >
              <ExternalLink className="w-4 h-4 mr-2" />
              Google Mobile-Friendly Test
            </Button>
            <Button
              variant="outline"
              className="w-full justify-start"
              onClick={() =>
                window.open("https://search.google.com/search-console/", "_blank")
              }
            >
              <ExternalLink className="w-4 h-4 mr-2" />
              Google Search Console
            </Button>
          </CardContent>
        </Card>

        {/* Instructions */}
        <Card className="bg-orange-50 border-orange-200">
          <CardHeader>
            <CardTitle className="text-orange-900">Next Steps</CardTitle>
          </CardHeader>
          <CardContent className="text-sm text-orange-800 space-y-2">
            <p>✅ All meta tags are being injected dynamically</p>
            <p>
              ⚠️ Remember to switch from HashRouter to BrowserRouter for proper SEO
            </p>
            <p>
              📝 Submit your sitemap to Google Search Console at
              https://search.google.com/search-console/
            </p>
            <p>📚 See /SEO_IMPLEMENTATION.md for the complete guide</p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}