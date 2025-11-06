import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "./ui/card";
import { Button } from "./ui/button";
import { Badge } from "./ui/badge";
import { Eye } from "lucide-react";
import CertificateRenderer from "./CertificateRenderer";
import PreviewWrapper from "./PreviewWrapper";

interface Template {
  id: string;
  name: string;
  description: string;
  config: any;
  type: "default" | "custom";
  createdBy?: string;
  createdAt: string;
  isDefault: boolean;
}

interface TemplatePreviewCardProps {
  template: Template;
  onSelect: (template: Template) => void;
  onPreview?: (template: Template) => void;
  onDelete?: (template: Template) => void;
  showDelete?: boolean;
}

export default function TemplatePreviewCard({
  template,
  onSelect,
  onPreview,
  onDelete,
  showDelete = false,
}: TemplatePreviewCardProps) {
  return (
    <Card
      className="group hover:shadow-xl transition-all duration-300 hover:border-orange-400 cursor-pointer overflow-hidden"
      onClick={() => onSelect(template)}
    >
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <CardTitle className="text-base group-hover:text-orange-600 transition-colors">
              {template.name}
            </CardTitle>
            <CardDescription className="text-xs mt-1">
              {template.description}
            </CardDescription>
          </div>
          {template.isDefault && (
            <Badge variant="secondary" className="ml-2 text-xs">
              Default
            </Badge>
          )}
        </div>
      </CardHeader>

      <CardContent className="space-y-3">
        {/* Preview - Actual Certificate Render */}
        <div className="relative aspect-[4/3] rounded-lg overflow-hidden border-2 border-gray-200 bg-gray-50 transition-transform group-hover:scale-[1.02]">
          <PreviewWrapper scale={0.4} origin="center" wrapperSize={2}>
            <CertificateRenderer
              templateId={template.id}
              header="Certificate of Completion"
              courseTitle="Sample Course"
              description="This is a preview of the certificate template"
              date="22ND JANUARY 2025"
              recipientName="John Doe"
              isPreview={true}
              mode="template-selection"
              // If this is a custom template, pass the saved config so logos/signatures render.
              // Avoid passing config for default templates to ensure built-in templates use their specific components.
              customTemplateConfig={
                template.type === "custom" ? template.config : undefined
              }
            />
          </PreviewWrapper>
        </div>

        {/* Actions */}
        <div className="flex gap-2">
          {onPreview && (
            <Button
              size="sm"
              variant="outline"
              onClick={(e) => {
                e.stopPropagation();
                onPreview(template);
              }}
              className="flex-1"
            >
              <Eye className="w-3 h-3 mr-1" />
              Preview
            </Button>
          )}
          <Button
            size="sm"
            onClick={(e) => {
              e.stopPropagation();
              onSelect(template);
            }}
            className="flex-1 bg-orange-600 hover:bg-orange-700 text-white"
          >
            Use Template
          </Button>
        </div>

        {showDelete && onDelete && (
          <Button
            size="sm"
            variant="destructive"
            onClick={(e) => {
              e.stopPropagation();
              onDelete(template);
            }}
            className="w-full"
          >
            Delete
          </Button>
        )}
      </CardContent>
    </Card>
  );
}
